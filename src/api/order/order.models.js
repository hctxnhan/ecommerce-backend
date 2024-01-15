import { z } from 'zod';

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

export const OrderSchema = z.object({
  customerId: z.string(),
  shippingInfo: z.object({
    address: z.string(),
    name: z.string(),
    phone: z.string()
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
      name: z.string(),
      description: z.string(),
      thumbnail: z.string(),
      slug: z.string(),
      type: z.string(),
      ownerId: z.string()
    })
  ),
  totalValue: z.number(),
  status: z.enum(Object.values(OrderStatus))
});
