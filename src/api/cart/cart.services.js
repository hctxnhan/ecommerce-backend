import { ObjectId } from 'mongodb';
import { connect } from '../../dbs/index.js';

export function createCart(customerId) {
  if (!customerId) throw new Error('customerId is required!');

  return connect.CARTS().insertOne({
    customerId: new ObjectId(customerId),
    items: [],
    count: 0,
    total: 0
  });
}

export async function findCartOfCustomer(customerId) {
  if (!customerId) throw new Error('customerId is required!');

  const result = await connect.CARTS().findOne(
    { customerId: new ObjectId(customerId) },
    {
      projection: {
        customerId: 0,
        _id: 0
      }
    }
  );

  if (!result) {
    await createCart(customerId);
    return findCartOfCustomer(customerId);
  }

  return result;
}

/*
  item = {
    productId,
    productName,
    price,
    quantity,
    ownerId,
  }
  */
export async function addItemToCart(customerId, newItem) {
  const { productId, productName, price, quantity, ownerId } = newItem;

  const cart = await findCartOfCustomer(customerId);

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
    cart.items[itemIndex].total = cart.items[itemIndex].quantity * price;
    cart.count += quantity;
    cart.total += quantity * price;
  } else {
    cart.items.push({
      productId: new ObjectId(productId),
      productName,
      price,
      quantity,
      ownerId: new ObjectId(ownerId),
      total: quantity * price
    });
    cart.count += quantity;
    cart.total += quantity * price;
  }

  await connect
    .CARTS()
    .updateOne({ customerId: new ObjectId(customerId) }, { $set: cart });
}

export async function removeItemFromCart(customerId, productId) {
  const cart = await findCartOfCustomer(customerId);

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex > -1) {
    cart.count -= cart.items[itemIndex].quantity;
    cart.total -= cart.items[itemIndex].total;
    cart.items.splice(itemIndex, 1);
  }

  return connect
    .CARTS()
    .updateOne({ customerId: new ObjectId(customerId) }, { $set: cart });
}

export async function updateCart(customerId, cart) {
  return connect
    .CARTS()
    .updateOne({ customerId: new ObjectId(customerId) }, { $set: cart });
}

export async function deleteCart(customerId) {
  await connect.CARTS().deleteOne({ customerId: new ObjectId(customerId) });
}

export async function calculateCartEager(customerId) {
  const pipeline = [
    {
      $match: {
        customerId: new ObjectId(customerId)
      }
    },
    {
      $unwind: '$items'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $group: {
        _id: '$_id',
        items: {
          $push: {
            productId: '$items.productId',
            quantity: '$items.quantity',
            price: '$product.price',
            name: '$product.name',
            description: '$product.description',
            thumbnail: '$product.thumbnail',
            slug: '$product.slug',
            avgRating: '$product.avgRating',
            attributes: '$product.attributes',
            type: '$product.type',
            ownerId: '$product.owner'
          }
        },
        totalValue: {
          $sum: {
            $multiply: ['$items.quantity', '$items.price']
          }
        }
      }
    }
  ];

  const cart = await connect.CARTS().aggregate(pipeline).toArray();

  return cart.length > 0 ? cart[0] : null;
}
