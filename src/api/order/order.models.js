import { z } from 'zod';

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const OrderStatusSchema = z.nativeEnum(OrderStatus);

export const OrderSchema = z
  .object({
    customerId: z.string(),
    shippingInfo: z.object({
      address: z.string(),
      name: z.string(),
      phone: z.string()
    }),
    totalValue: z.number(),
    quantity: z.number()
  })
  .strip();
