import { ObjectId } from 'mongodb';
import { client, dbName } from '../../dbs/index.js';

export function findUserByEmail(email) {
  return client.db(dbName).collection('users').findOne({ email });
}

export function findUserById(userId) {
  return client
    .db(dbName)
    .collection('users')
    .findOne({ _id: new ObjectId(userId) });
}
