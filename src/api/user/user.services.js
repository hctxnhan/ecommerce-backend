import { ObjectId } from 'mongodb';
import { connect } from '../../dbs/index.js';

export function findUserByEmail(email) {
  return connect.USERS().findOne({ email });
}

export function findUserById(userId) {
  return connect.USERS().findOne({ _id: new ObjectId(userId) });
}
