import { ObjectId } from 'mongodb';
import { connect } from '../../services/dbs/index.js';
import { acquireLock, releaseLock } from '../../services/redis/index.js';

// eslint-disable-next-line import/prefer-default-export
export function createInventory({ productId, stock, userId }) {
  return connect.INVENTORY().insertOne({
    productId: new ObjectId(productId),
    stock,
    userId: new ObjectId(userId)
  });
}

export async function reservationInventory(
  userId,
  { productId, quantity },
  session
) {
  const lockKey = `inventory_product:${productId}`;
  const value = userId;

  const lockAcquired = await acquireLock(lockKey, value);
  const release = () => releaseLock(lockKey);

  if (!lockAcquired) {
    return {
      success: false,
      reason: 'LOCK_NOT_ACQUIRED',
      message: 'Cannot acquire lock'
    };
  }

  try {
    const result = await connect.INVENTORY().findOneAndUpdate(
      {
        productId: new ObjectId(productId),
        stock: { $gte: quantity }
      },
      {
        $inc: { stock: -quantity }
      },
      {
        session,
        returnOriginal: false
      }
    );

    if (!result) {
      return {
        success: false,
        reason: 'OUT_OF_STOCK',
        message: 'Out of stock'
      };
    }

    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      reason: 'INTERNAL_SERVER_ERROR',
      message: error.message
    };
  } finally {
    release();
  }
}
