import { MongoClient } from 'mongodb';
import configs from '../../configs/index.js';

const { dbName, url: uri } = configs.db;
const client = new MongoClient(uri);

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
  ORDER_ITEMS: () => client.db(dbName).collection('orderItems'),
  VERIFY_CODES: () => client.db(dbName).collection('verifyCodes'),
  SHOP_REQUESTS: () => client.db(dbName).collection('shopRequests'),
  withSession: client.withSession.bind(client),
  startSession: client.startSession.bind(client)
};