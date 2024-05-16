import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { applyDiscount } from '../../discount/discount.services.js';

const reqBodySchema = z.object({
  discountCodes: z.array(z.string()).optional().default([]),
  cart: z.object({
    total: z.number(),
    count: z.number(),
    items: z.array(
      z.object({
        productId: z.string().transform((val) => new ObjectId(val)),
        productName: z.string(),
        quantity: z.number(),
        price: z.number(),
        type: z.string(),
        total: z.number(),
        ownerId: z.string().transform((val) => new ObjectId(val))
      })
    )
  })
});

async function handler(req, res) {
  const { discountCodes, cart } = req.body;

  const calculatedCartDiscount = cart;

  // eslint-disable-next-line no-restricted-syntax
  for (const code of discountCodes) {
    const {
      isValid,
      totalValueAfterDiscount,
      reason,
      cart: cartAfterDiscount
      // eslint-disable-next-line no-await-in-loop
    } = await applyDiscount(
      code,
      calculatedCartDiscount.total,
      calculatedCartDiscount
    );

    if (!isValid) {
      throw createHttpError.BadRequest(reason);
    }

    calculatedCartDiscount.total = totalValueAfterDiscount;
    calculatedCartDiscount.items = cartAfterDiscount;
  }

  return success({
    status: httpStatus.OK,
    data: {
      cart: calculatedCartDiscount
    }
  }).send(res);
}

const checkoutReviewController = controllerFactory()
  .method(HttpMethod.POST)
  .path('/review')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)]);

export default checkoutReviewController;
