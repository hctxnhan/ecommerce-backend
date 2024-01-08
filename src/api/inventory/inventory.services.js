import { ObjectId } from 'mongodb';
import { client, dbName } from '../../dbs/index.js';

// eslint-disable-next-line import/prefer-default-export
export function createInventory({ productId, stock, userId }) {
  return client
    .db(dbName)
    .collection('inventory')
    .insertOne({
      productId: new ObjectId(productId),
      stock,
      userId: new ObjectId(userId)
    });
}
