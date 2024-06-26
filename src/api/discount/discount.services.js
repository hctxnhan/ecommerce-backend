import { connect } from '../../services/dbs/index.js';
import { ISODateNow, toObjectId } from '../../utils/index.js';
import { findProductById } from '../product/product.services.js';
import { DiscountApplyType, DiscountType } from './discount.models.js';

export async function createDiscount(ownerId, data) {
  return connect.DISCOUNTS().insertOne({
    ...data,
    owner: toObjectId(ownerId),
    usedBy: [],
    usedCount: 0
  });
}

export function getDiscounts(discountCodes, includeExpired = false) {
  const query = {
    code: {
      $in: discountCodes
    }
  };

  if (!includeExpired) {
    query.endDate = {
      $gte: new Date().toISOString()
    };
  }

  return connect.DISCOUNTS().find(query).toArray();
}

export function checkIfDiscountOwner(discountCode, ownerId) {
  return connect.DISCOUNTS().findOne({
    code: discountCode,
    owner: toObjectId(ownerId)
  });
}

export function updateDiscountStatus(discountCode, status) {
  return connect.DISCOUNTS().updateOne(
    {
      code: discountCode
    },
    {
      $set: {
        status
      }
    }
  );
}

export function findAllDiscounts(
  { ownerId, status = 'active' },
  { page = 1, limit = 10 } = {}
) {
  const currentDate = new Date().toISOString();
  const endDate =
    status === 'expired'
      ? { $lt: currentDate }
      : {
          $gte: currentDate
        };

  return connect
    .DISCOUNTS()
    .find({
      owner: toObjectId(ownerId),
      endDate,
      isActive: !(status === 'inactive')
    })
    .limit(limit)
    .skip((page - 1) * limit)
    .toArray();
}

export function isOwnerOfDiscount(discountCode, ownerId) {
  return connect
    .DISCOUNTS()
    .findOne({
      code: discountCode,
      owner: toObjectId(ownerId)
    })
    .then((discount) => !!discount);
}

export function findDiscountByCode(code) {
  return connect.DISCOUNTS().findOne({
    code
  });
}

export async function applyDiscount(
  code,
  totalValue = 0,
  cart = { items: [] }
) {
  const validDiscount = await findDiscountByCode(code);
  if (!validDiscount) {
    return {
      isValid: false,
      reason: 'INVALID_CODE',
      message: 'Discount code is invalid!',
      discount: null
    };
  }

  const {
    applyType,
    applyValue,
    type,
    value,
    minOrderValue,
    owner,
    usedBy
    // usageLimit,
    // usageLimitPerUser,
    // usedCount
  } = validDiscount;

  // if (usageLimit && usedCount >= usageLimit) {
  //   return {
  //     isValid: false,
  //     reason: 'LIMIT_EXCEEDED',
  //     message: 'Discount code has been used up!',
  //     discount: null
  //   };
  // }

  // check if user has used this discount code
  if (usedBy?.includes(owner.toString())) {
    return {
      isValid: false,
      reason: 'ALREADY_USED',
      message: 'Discount code has been used by you!',
      discount: null
    };
  }

  if (totalValue < minOrderValue) {
    return {
      isValid: false,
      reason: 'MIN_ORDER_VALUE',
      message: 'Total value is not enough!',
      discount: null
    };
  }

  const calculatedCarts = cart.items.map((product) => {
    const productOwner =
      typeof product.ownerId === 'string'
        ? product.ownerId
        : product.ownerId?.toString();

    const canApplied =
      (applyType === DiscountApplyType.CATEGORIES &&
        applyValue.includes(product.type)) ||
      (applyType === DiscountApplyType.BRANDS &&
        applyValue.includes(product.brand)) ||
      (applyType === DiscountApplyType.PRODUCTS &&
        applyValue.includes(product._id)) ||
      applyType === DiscountApplyType.ALL;

    if (!canApplied && !(productOwner !== owner.toString())) {
      return {
        ...product,
        totalPriceAfterDiscount: product.price
      };
    }

    const currentPrice = product.totalPriceAfterDiscount ?? product.price;

    const totalPriceAfterDiscount =
      type === DiscountType.PERCENTAGE
        ? currentPrice * (1 - value / 100)
        : currentPrice - value;

    return {
      ...product,
      totalPriceAfterDiscount:
        totalPriceAfterDiscount < 0 ? 0 : totalPriceAfterDiscount
    };
  });

  return {
    isValid: true,
    reason: 'VALID',
    message: 'Discount code is valid!',
    cart: calculatedCarts,
    totalValueAfterDiscount: calculatedCarts.reduce(
      (acc, cur) => acc + cur.totalPriceAfterDiscount * cur.quantity,
      0
    )
  };
}

export function deleteDiscount(code) {
  return connect.DISCOUNTS().deleteOne({
    code
  });
}

export async function findAllProductDiscounts(
  productId,
  { page = 1, limit = 10 } = {}
) {
  const product = await findProductById(productId);

  if (!product) {
    return [];
  }

  return connect
    .DISCOUNTS()
    .find({
      $or: [
        {
          applyType: DiscountApplyType.ALL
        },
        {
          applyType: DiscountApplyType.PRODUCTS,
          applyValue: productId
        },
        {
          applyType: DiscountApplyType.CATEGORIES,
          applyValue: product.type
        },
        {
          applyType: DiscountApplyType.BRANDS,
          applyValue:
            product.attributes?.brand ?? product.attributes?.manufacturer
        }
      ],
      endDate: {
        $gte: new Date().toISOString()
      }
    })
    .limit(limit)
    .skip((page - 1) * limit)
    .toArray();
}

export function findAllDiscountProducts(
  discountCode,
  { page = 1, limit = 10 } = {}
) {
  const skip = (page - 1) * limit;
  const pipeline = [
    // Stage 1: Find discount by code which is not applied to all products.
    {
      $match: {
        code: discountCode,
        applyType: {
          $ne: DiscountApplyType.ALL
        }
      }
    },
    {
      $limit: 1
    },
    {
      $project: {
        applyType: 1,
        applyValue: 1
      }
    },
    /*
      Stage 2: Divide into 3 branches: products, categories, brands
      and find products that match each branch.
    */
    {
      $facet: {
        products: [
          {
            $match: {
              applyType: 'products'
            }
          },
          {
            $project: {
              applyValue: 1
            }
          },
          {
            $unwind: '$applyValue'
          },
          {
            $lookup: {
              from: 'products',
              localField: 'applyValue',
              foreignField: '_id',
              as: 'product'
            }
          },
          {
            $unwind: '$products'
          },
          {
            $replaceRoot: {
              newRoot: '$products'
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ],
        categories: [
          {
            $match: {
              applyType: DiscountApplyType.CATEGORIES
            }
          },
          {
            $project: {
              applyValue: 1
            }
          },
          {
            $unwind: '$applyValue'
          },
          {
            $lookup: {
              from: 'products',
              localField: 'applyValue',
              foreignField: 'type',
              as: 'products'
            }
          },
          {
            $unwind: '$products'
          },
          {
            $replaceRoot: {
              newRoot: '$products'
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ],
        brands: [
          {
            $match: {
              applyType: DiscountApplyType.BRANDS
            }
          },
          {
            $project: {
              applyValue: 1
            }
          },
          {
            $unwind: '$applyValue'
          },
          {
            $lookup: {
              from: 'products',
              let: {
                brand: '$applyValue'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $or: [
                        {
                          $eq: ['$$brand', '$attributes.brand']
                        },
                        {
                          $eq: ['$$brand', '$attributes.manufacturer']
                        }
                      ]
                    }
                  }
                }
              ],
              as: 'products'
            }
          },
          {
            $unwind: '$products'
          },
          {
            $replaceRoot: {
              newRoot: '$products'
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ]
      }
    },
    // Stage 3: Concat 3 branches into 1 array.
    {
      $project: {
        products: {
          $concatArrays: ['$products', '$categories', '$brands']
        }
      }
    },
    {
      $unwind: '$products'
    },
    // Stage 4: Repalce root to products.
    {
      $replaceRoot: {
        newRoot: '$products'
      }
    }
  ];

  return connect.DISCOUNTS().aggregate(pipeline).toArray();
}
