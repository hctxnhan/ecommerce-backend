import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { z } from 'zod';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { validateReqQuery } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { Permission, Resource } from '../../rbac/index.js';
import {
  checkIfDiscountOwner,
  findDiscountByCode,
  updateDiscountStatus
} from '../discount.services.js';

const querySchema = z.object({
  status: z.enum(['active', 'inactive'])
});

async function handler(req, res) {
  const { discountCode } = req.params;
  const existingDiscount = await findDiscountByCode(discountCode);

  if (!existingDiscount) {
    throw createHttpError.BadRequest(
      `Discount code ${discountCode} does not exist`
    );
  }

  const isOwner = await checkIfDiscountOwner(discountCode, req.user.userId);

  if (!isOwner) {
    throw createHttpError.Forbidden(
      'You are not allowed to update this discount'
    );
  }

  await updateDiscountStatus(discountCode, req.query.status);

  return success({
    message: `Discount has been ${req.query.status} successfully!`,
    status: httpStatus.OK
  }).send(res);
}

const updateDiscountActive = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/:discountCode')
  .handler(asyncHandler(handler))
  .middlewares([
    roleCheck(Resource.DISCOUNT, Permission.UPDATE_OWN),
    validateReqQuery(querySchema)
  ]);

export default updateDiscountActive;
