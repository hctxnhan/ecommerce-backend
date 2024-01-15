import { connect } from '../../dbs/index.js';
import { reservationInventory } from '../inventory/inventory.services.js';
import { OrderSchema, OrderStatus } from './order.models.js';

export function createOrder(
  { customerId, shippingInfo, items, totalValue },
  { session }
) {
  const order = OrderSchema.parse({
    customerId,
    shippingInfo,
    items,
    totalValue,
    status: OrderStatus.PENDING
  });

  return connect.ORDERS().insertOne(
    {
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    { session }
  );
}

export async function placeOrder(userId, calculatedCart) {
  const { items } = calculatedCart;

  const session = await connect.startSession();

  try {
    await session.withTransaction(async () => {
      const result = await Promise.all(
        items.map(async (item) => reservationInventory(item, session))
      );

      const failedItem = result.find((r) => !r.success);

      if (failedItem) {
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
            address: '123',
            name: '123',
            phone: '123'
          },
          items: calculatedCart.items,
          totalValue: calculatedCart.totalValue
        },
        { session }
      );

      return {
        success: true
      };
    });
  } catch (err) {
    console.log(err);
    return {
      success: false,
      reason: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong'
    };
  } finally {
    session.endSession();
  }

  return {
    success: true
  };
}
