import { ObjectId } from 'mongodb';
import { connect } from '../../dbs/index.js';
import { acquireLock, releaseLock } from '../../redis/index.js';

// eslint-disable-next-line import/prefer-default-export
export function createInventory({ productId, stock, userId }) {
  return connect.INVENTORY().insertOne({
    productId: new ObjectId(productId),
    stock,
    userId: new ObjectId(userId)
  });
}

export async function reservationInventory(
  { productId, quantity, cartId },
  { session }
) {
  const lockKey = `inventory_product:${productId}`;
  const value = cartId;

  const lockAcquired = await acquireLock(lockKey, value);
  const release = () => releaseLock(lockKey);

  if (!lockAcquired) {
    return {
      success: false,
      reason: 'LOCK_NOT_ACQUIRED',
      message: 'Cannot acquire lock'
    };
  }

  const result = await connect.INVENTORY().findOneAndUpdate(
    {
      productId: new ObjectId(productId),
      stock: { $gte: quantity }
    },
    {
      $inc: { stock: -quantity }
    },
    {
      returnOriginal: false,
      session
    }
  );

  release();

  if (!result.ok) {
    return {
      success: false,
      reason: 'OUT_OF_STOCK',
      message: 'Out of stock'
    };
  }

  release();

  return {
    success: true
  };
}
