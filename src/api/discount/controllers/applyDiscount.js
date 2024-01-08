import httpStatus from 'http-status';
import { z } from 'zod';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { applyDiscount } from '../discount.services.js';
import { ProductType } from '../../product/product.model.js';
import { validateReqBody } from '../../../middlewares/validateRequest.js';

const reqBodySchema = z.object({
  carts: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      type: z.enum(Object.values(ProductType)),
      price: z.number(),
      brand: z.string()
    })
  ),
  totalValue: z.number()
});

async function handler(req, res) {
  const result = await applyDiscount(
    req.params.discountCode,
    req.body.totalValue,
    req.body.carts
  );

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const applyDiscountToCart = controllerFactory()
  .method(HttpMethod.POST)
  .path('/:discountCode/applyDiscount')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)])
  .skipAuth();

export default applyDiscountToCart;
