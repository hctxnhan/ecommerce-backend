import { MongoClient } from 'mongodb';
import configs from '../../configs/index.js';

const uri = configs.db.url;
const client = new MongoClient(uri);
const { dbName } = configs.db;

export { client, dbName };

export const connect = {
  USERS: () => client.db(dbName).collection('users'),
  PRODUCTS: () => client.db(dbName).collection('products'),
  CARTS: () => client.db(dbName).collection('carts'),
  ORDERS: () => client.db(dbName).collection('orders'),
  DISCOUNTS: () => client.db(dbName).collection('discounts'),
  INVENTORY: () => client.db(dbName).collection('inventory'),
  TOKENS: () => client.db(dbName).collection('tokens'),
  COMMENTS: () => client.db(dbName).collection('comments'),
  VERIFY_CODES: () => client.db(dbName).collection('verifyCodes'),
  startSession: () => client.startSession()
};
