import { ObjectId } from 'mongodb';
import { connect } from '../../services/dbs/index.js';

export function findUserByEmail(email) {
  return connect.USERS().findOne({
    email: {
      $regex: new RegExp(`^${email}$`, 'i')
    }
  });
}

export function findUserById(userId) {
  return connect.USERS().findOne({ _id: new ObjectId(userId) });
}

export function updateUser(filter, update) {
  return connect.USERS().updateOne(filter, { $set: update });
}
