import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { DiscountSchema } from '../discount.models.js';
import { createDiscount, findDiscountByCode } from '../discount.services.js';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { Permission, Resource } from '../../rbac/index.js';

async function handler(req, res) {
  const existingDiscount = await findDiscountByCode(req.body.code);

  if (existingDiscount) {
    throw createHttpError.Conflict(
      `Discount code ${req.body.code} already exists`
    );
  }

  const result = await createDiscount(req.user.userId, req.body);

  return success({
    message: 'Discount has been created successfully!',
    status: httpStatus.CREATED,
    data: {
      id: result.insertedId,
      ...req.body
    }
  }).send(res);
}

const createDiscountController = controllerFactory()
  .method(HttpMethod.POST)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([
    roleCheck(Resource.DISCOUNT, Permission.CREATE_OWN),
    validateReqBody(DiscountSchema)
  ]);

export default createDiscountController;
