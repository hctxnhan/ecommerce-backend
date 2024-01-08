import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { deleteDiscount, isOwnerOfDiscount } from '../discount.services.js';

async function handler(req, res) {
  const isOwner = await isOwnerOfDiscount(
    req.params.discountCode,
    req.user.userId
  );

  if (!isOwner) {
    throw createHttpError.Forbidden(
      'You are not allowed to delete this discount'
    );
  }

  await deleteDiscount(req.params.discountCode);

  return success({
    status: httpStatus.OK,
    message: 'Successfully deleted discount'
  }).send(res);
}

const deleteADiscount = controllerFactory()
  .method(HttpMethod.DELETE)
  .path('/:discountCode')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default deleteADiscount;
