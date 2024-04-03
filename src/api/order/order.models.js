import { z } from 'zod';

export const OrderItemStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const OrderStatus = {
  ALL: 'all',
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const OrderItemStatusSchema = z.nativeEnum(OrderItemStatus);

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
