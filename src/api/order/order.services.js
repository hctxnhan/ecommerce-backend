import { ObjectId } from 'mongodb';
import { connect } from '../../services/dbs/index.js';
import { ISODateNow, toObjectId } from '../../utils/index.js';
import { reservationInventory } from '../inventory/inventory.services.js';
import { OrderItemStatus, OrderSchema, OrderStatus } from './order.models.js';

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
      createdAt: ISODateNow(),
      updatedAt: ISODateNow()
    },
    { session }
  );

  const orderItems = items.map((item) => ({
    ...item,
    orderId: createdOrder.insertedId,
    customerId: new ObjectId(customerId),
    status: OrderItemStatus.PENDING
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
            await session.abortTransaction();

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
    {
      _id: new ObjectId(userId)
    },
    {
      $set: {
        address
      }
    }
  );
}

export function findMyOrders(userId, { page, limit, status }) {
  return connect
    .ORDERS()
    .aggregate([
      {
        $match: {
          customerId: userId
        }
      },
      // find order items and alias as "orderItems"
      {
        $lookup: {
          from: 'orderItems',
          localField: '_id',
          foreignField: 'orderId',
          as: 'orderItems'
        }
      },
      {
        $project: {
          _id: 1,
          customerId: 1,
          shippingInfo: 1,
          totalValue: 1,
          status: {
            $cond: {
              // If size of orderItems that have "completed" status is equal to size of all orderItems
              if: {
                $eq: [
                  {
                    $size: {
                      $filter: {
                        input: '$orderItems',
                        as: 'item',
                        cond: {
                          $eq: ['$$item.status', 'completed']
                        }
                      }
                    }
                  },
                  {
                    $size: '$orderItems'
                  }
                ]
              },
              then: 'completed',
              else: {
                $cond: {
                  if: {
                    $eq: [
                      {
                        $size: {
                          $filter: {
                            input: '$orderItems',
                            as: 'item',
                            cond: {
                              // $eq: ['$$item.status', 'processing']
                              // processing or confirmed
                              $or: [
                                { $eq: ['$$item.status', 'processing'] },
                                { $eq: ['$$item.status', 'confirmed'] },
                                { $eq: ['$$item.status', 'shipping'] }
                              ]
                            }
                          }
                        }
                      },
                      {
                        $size: '$orderItems'
                      }
                    ]
                  },
                  then: 'processing',
                  else: {
                    $cond: {
                      if: {
                        $eq: [
                          {
                            $size: {
                              $filter: {
                                input: '$orderItems',
                                as: 'item',
                                cond: {
                                  $eq: ['$$item.status', 'cancelled']
                                }
                              }
                            }
                          },
                          {
                            $size: '$orderItems'
                          }
                        ]
                      },
                      then: 'cancelled',
                      
                      else: 'pending'
                    }
                  }
                }
              }
            }
          },
          createdAt: 1,
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          }
        }
      },
      {
        $match: {
          status: status === OrderStatus.ALL ? { $ne: 'cancelled' } : status
        }
      },
      {
        $group: {
          _id: '$date',
          orders: {
            $push: {
              _id: '$_id',
              customerId: '$customerId',
              shippingInfo: '$shippingInfo',
              totalValue: '$totalValue',
              status: '$status',
              createdAt: '$createdAt'
            }
          }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ])
    .toArray();
}

export function findOrderById(orderId) {
  return connect
    .ORDERS()
    .find({ _id: new ObjectId(orderId) })
    .toArray();
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

export function updateProductOrderStatus(
  { itemId, ownerId },
  { status },
  session
) {
  return connect.ORDER_ITEMS().updateOne(
    {
      _id: toObjectId(itemId),
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

export function updateOrderStatus(orderId, customerId, status) {
  return connect.ORDER_ITEMS().updateMany(
    {
      orderId: toObjectId(orderId),
      customerId: toObjectId(customerId)
    },
    {
      $set: {
        status
      }
    }
  );
}

export function getOrderItemByShopId({ shopId, status, page, limit }) {
  return connect
    .ORDER_ITEMS()
    .find(
      {
        ownerId: toObjectId(shopId),
        status:
          status === OrderItemStatus.ALL
            ? { $ne: OrderItemStatus.CANCELLED }
            : status
      },
      {
        limit,
        skip: (page - 1) * limit
      }
    )
    .toArray();
}

export function getOrderItem({ itemId }) {
  return connect
    .ORDER_ITEMS()
    .aggregate([
      {
        $match: {
          _id: new ObjectId(itemId)
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order'
        }
      },
      {
        $unwind: '$order'
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          customerId: 1,
          productId: 1,
          status: 1,
          ownerId: 1,
          createdAt: 1,
          updatedAt: 1,
          order: {
            customerId: '$order.customerId',
            shippingInfo: '$order.shippingInfo',
            createdAt: '$order.createdAt',
            updatedAt: '$order.updatedAt'
          }
        }
      }
    ])
    .toArray();
}
