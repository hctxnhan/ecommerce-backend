import { ObjectId } from 'mongodb';
import { connect } from '../../services/dbs/index.js';
import { toObjectId } from '../../utils/index.js';
import { reservationInventory } from '../inventory/inventory.services.js';
import { OrderSchema, OrderStatus } from './order.models.js';

export async function createOrder(
  { customerId, shippingInfo, items, totalValue },
  { session }
) {
  const order = OrderSchema.parse({
    customerId,
    shippingInfo,
    totalValue,
    quantity: items.reduce((acc, item) => acc + item.quantity, 0)
  });

  const createdOrder = await connect.ORDERS().insertOne(
    {
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { session }
  );

  const orderItems = items.map((item) => ({
    ...item,
    orderId: createdOrder.insertedId,
    status: OrderStatus.PENDING
  }));

  await connect.ORDER_ITEMS().insertMany(orderItems, { session });

  return createdOrder;
}

export async function placeOrder(userId, calculatedCart, deliveryAddress) {
  const { items } = calculatedCart;

  const res = await connect.withSession(async (session) =>
    session
      .withTransaction(async () => {
        try {
          const result = await Promise.all(
            items.map(async (item) =>
              reservationInventory(userId, item, session)
            )
          );

          const failedItem = result.find((r) => !r.success);

          if (failedItem) {
            session.abortTransaction();

            return {
              success: false,
              reason: failedItem.reason,
              message: failedItem.message,
              failedItem
            };
          }

          await createOrder(
            {
              customerId: userId,
              shippingInfo: {
                ...deliveryAddress
              },
              items: calculatedCart.items,
              totalValue: calculatedCart.totalValue
            },
            { session }
          );

          await connect.CARTS().deleteOne(
            { customerId: userId },
            {
              session
            }
          );

          return {
            message: 'Order placed successfully',
            success: true
          };
        } catch (err) {
          return {
            success: false,
            reason: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong'
          };
        }
      }, null)
      .finally(() => {
        session.endSession();
      })
  );

  return res;
}

export function updatePrimaryDeliveryAddress(userId, address) {
  return connect.USERS().updateOne(
    { _id: userId },
    {
      $set: {
        primaryDeliveryAddress: address
      }
    }
  );
}

export function findMyOrders(userId, { page, limit }) {
  return connect
    .ORDERS()
    .find({ customerId: userId })
    .project({
      _id: 1,
      customerId: 1,
      shippingInfo: 1,
      totalValue: 1,
      status: 1,
      createdAt: 1
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
}

export function findOrderById(orderId) {
  return connect.ORDERS().find({ _id: new ObjectId(orderId) });
}

export function getOrderDetailById(orderId) {
  return connect
    .ORDERS()
    .aggregate([
      {
        $match: {
          _id: new ObjectId(orderId)
        }
      },
      {
        $lookup: {
          from: 'orderItems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'items'
        }
      }
    ])
    .toArray();
}

export function updateProductOrderStatus(orderId, productId, ownerId, status, session) {
  return connect.ORDER_ITEMS().updateOne(
    {
      orderId: toObjectId(orderId),
      productId: toObjectId(productId),
      ownerId: toObjectId(ownerId)
    },
    {
      $set: {
        status
      }
    },
    { session }
  );
}
