import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { calculateCartEager as computeCartEager } from '../../cart/cart.services.js';
import { applyDiscount } from '../../discount/discount.services.js';
import { placeOrder } from '../order.services.js';

const reqBodySchema = z
  .object({
    discountCodes: z.array(z.string())
  })
  .strip();

async function handler(req, res) {
  const cart = await computeCartEager(req.user.userId);

  if (!cart) {
    throw createHttpError.BadRequest(
      'Please add items to cart first then checkout again!'
    );
  }

  const { discountCodes } = req.body;

  const calculatedCartDiscount = cart;

  // eslint-disable-next-line no-restricted-syntax
  for (const code of discountCodes) {
    const {
      isValid,
      totalValueAfterDiscount,
      cart: cartAfterDiscount
      // eslint-disable-next-line no-await-in-loop
    } = await applyDiscount(
      code,
      calculatedCartDiscount.totalValue,
      calculatedCartDiscount
    );

    if (!isValid) {
      throw createHttpError.BadRequest(`Discount code ${code} is invalid!`);
    }

    calculatedCartDiscount.totalValue = totalValueAfterDiscount;
    calculatedCartDiscount.items = cartAfterDiscount;
  }

  const result = await placeOrder(req.user.userId, calculatedCartDiscount);

  if (!result.success) {
    if (result.reason === 'INTERNAL_SERVER_ERROR') {
      throw createHttpError.InternalServerError(result.message);
    }
    throw createHttpError.BadRequest(result.message);
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
