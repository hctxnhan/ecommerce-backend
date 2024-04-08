import { ObjectId } from 'mongodb';
import { connect } from '../../services/dbs/index.js';
import { UserRole } from '../rbac/index.js';

export function findUserByEmail(email) {
  return connect.USERS().findOne({
    email: {
      $regex: new RegExp(`^${email}$`, 'i')
    }
  });
}

export function findUserById(userId) {
  return connect.USERS().findOne(
    { _id: new ObjectId(userId) },
    {
      projection: {
        password: 0
      }
    }
  );
}

export const SHOP_REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked'
};

export function createShopRequest({
  userId,
  shopName,
  shopDescription,
  shopAddress
}) {
  return connect.SHOP_REQUESTS().insertOne({
    userId: new ObjectId(userId),
    shopName,
    shopDescription,
    shopAddress,
    status: SHOP_REQUEST_STATUS.PENDING
  });
}

export async function confirmShopRequest(requestId) {
  let res = await connect.withSession(async (session) =>
    session.withTransaction(async (session) => {
      const request = await connect
        .SHOP_REQUESTS()
        .findOne({ _id: new ObjectId(requestId) }, { session });

      if (!request) {
        return {
          success: false,
          message: 'Request not found'
        };
      }

      if (request.status !== SHOP_REQUEST_STATUS.PENDING) {
        return {
          success: false,
          message: 'Request is not pending'
        };
      }

      await connect.USERS().updateOne(
        { _id: request.userId },
        {
          $set: {
            role: UserRole.SHOP_OWNER,
            shop: {
              name: request.shopName,
              description: request.shopDescription,
              address: request.shopAddress
            }
          }
        },
        { session }
      );

      await connect
        .SHOP_REQUESTS()
        .updateOne(
          { _id: new ObjectId(requestId) },
          { $set: { status: SHOP_REQUEST_STATUS.APPROVED } },
          { session }
        );

      return {
        success: true
      };
    }, null)
  );

  return res;
}

export async function rejectShopRequest(requestId) {
  const filter = { _id: new ObjectId(requestId) };

  const request = await connect.SHOP_REQUESTS().findOne(filter);

  if (!request) {
    return {
      success: false,
      message: 'Request not found'
    };
  }

  if (request.status !== SHOP_REQUEST_STATUS.PENDING) {
    return {
      success: false,
      message: 'Request is not pending'
    };
  }

  await connect
    .SHOP_REQUESTS()
    .update(filter, { $set: { status: SHOP_REQUEST_STATUS.REJECTED } });

  return {
    success: true
  };
}

export function updateUser(filter, update) {
  return connect.USERS().updateOne(filter, { $set: update });
}

export function getShopRequests({
  status = SHOP_REQUEST_STATUS.PENDING,
  page = 1,
  limit = 10
}) {
  return connect
    .SHOP_REQUESTS()
    .find({ status })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
}

export function getUsers({
  role = UserRole.USER,
  status = USER_STATUS.ACTIVE,
  page = 1,
  limit = 10
}) {
  return connect
    .USERS()
    .find({ role, status })
    .project({ password: 0 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
}
