import { z, ZodError } from 'zod';

export const DiscountType = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
};

export const DiscountApplyType = {
  ALL: 'all',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  BRANDS: 'brands'
};

export const DiscountSchema = z
  .object({
    name: z.string().min(3).max(255),
    description: z.string().min(3).max(255),
    type: z.enum(Object.values(DiscountType)),
    value: z.number().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    minOrderValue: z.number().min(1),
    usageLimit: z.number().min(1),
    usageLimitPerUser: z.number().min(1),
    code: z.string().min(3).max(255),
    isActive: z.boolean().default(true),
    applyType: z
      .enum(Object.values(DiscountApplyType))
      .default(DiscountApplyType.ALL),
    applyValue: z.array(z.string()).default([])
  })
  .strict()
  .refine((data) => {
    if (new Date(data.startDate) > new Date(data.endDate)) {
      throw new ZodError([
        {
          code: 'invalid_date',
          message: 'Start date cannot be greater than end date',
          path: ['startDate', 'endDate']
        }
      ]);
    }

    if (data.type === DiscountType.PERCENTAGE && data.value > 100) {
      throw new ZodError([
        {
          code: 'invalid_value',
          message: 'Discount value cannot be greater than 100',
          path: ['value']
        }
      ]);
    }

    if (data.usageLimitPerUser > data.usageLimit) {
      throw new ZodError([
        {
          code: 'invalid_usage_limit',
          message: 'Usage limit per user cannot be greater than usage limit',
          path: ['usageLimit', 'usageLimitPerUser']
        }
      ]);
    }

    if (
      data.applyType !== DiscountApplyType.ALL &&
      data.applyValue.length === 0
    ) {
      throw new ZodError([
        {
          code: 'invalid_apply_value',
          message: 'Apply value cannot be empty',
          path: ['applyValue']
        }
      ]);
    }

    return true;
  });
