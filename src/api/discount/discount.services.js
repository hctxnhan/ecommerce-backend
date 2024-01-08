import { ObjectId } from 'mongodb';
import { client, dbName } from '../../dbs/index.js';
import { findProductById } from '../product/product.services.js';
import { DiscountApplyType, DiscountType } from './discount.models.js';

export async function createDiscount(ownerId, data) {
  return client
    .db(dbName)
    .collection('discounts')
    .insertOne({
      ...data,
      owner: new ObjectId(ownerId),
      usedBy: [],
      usedCount: 0
    });
}

export function findAllDiscounts(ownerId, { page = 1, limit = 10 } = {}) {
  return client
    .db(dbName)
    .collection('discounts')
    .find({
      owner: new ObjectId(ownerId),
      endDate: {
        $gte: new Date().toISOString()
      }
    })
    .limit(limit)
    .skip((page - 1) * limit)
    .toArray();
}

export function isOwnerOfDiscount(discountCode, ownerId) {
  return client
    .db(dbName)
    .collection('discounts')
    .findOne({
      code: discountCode,
      owner: new ObjectId(ownerId)
    })
    .then((discount) => !!discount);
}

export function findDiscountByCode(code) {
  return client
    .db(dbName)
    .collection('discounts')
    .findOne({
      code,
      endDate: {
        $gte: new Date().toISOString()
      }
    });
}

/*
  Initially we have a cart that contains product with interface like this:
  {
    _id: '123',
    quantity: 2,
    type: 'clothes' | 'furniture' | 'electronics',
    price: 100,
    brand: 'nike',
  }
*/
export async function applyDiscount(code, totalValue = 0, carts = []) {
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
    minOrderValue
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

  if (totalValue < minOrderValue) {
    return {
      isValid: false,
      reason: 'MIN_ORDER_VALUE',
      message: 'Total value is not enough!',
      discount: null
    };
  }

  const calculatedCarts = carts.map((product) => {
    const canApplied =
      (applyType === DiscountApplyType.CATEGORIES &&
        applyValue.includes(product.type)) ||
      (applyType === DiscountApplyType.BRANDS &&
        applyValue.includes(product.brand)) ||
      (applyType === DiscountApplyType.PRODUCTS &&
        applyValue.includes(product._id)) ||
      applyType === DiscountApplyType.ALL;

    if (!canApplied) {
      return {
        ...product,
        totalPriceAfterDiscount: product.price
      };
    }

    const totalPriceAfterDiscount =
      type === DiscountType.PERCENTAGE
        ? product.price * (1 - value / 100)
        : product.price - value;

    return {
      ...product,
      totalPriceAfterDiscount
    };
  });

  return {
    isValid: true,
    reason: 'VALID',
    message: 'Discount code is valid!',
    carts: calculatedCarts,
    totalValueAfterDiscount: calculatedCarts.reduce(
      (acc, cur) => acc + cur.totalPriceAfterDiscount * cur.quantity,
      0
    )
  };
}

export function deleteDiscount(code) {
  return client.db(dbName).collection('discounts').deleteOne({
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

  return client
    .db(dbName)
    .collection('discounts')
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

  return client
    .db(dbName)
    .collection('discounts')
    .aggregate(pipeline)
    .toArray();
}
