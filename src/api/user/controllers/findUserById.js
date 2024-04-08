import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findUserById } from '../user.services.js';

async function handler(req, res) {
  const user = await findUserById(req.params.userId);

  if (!user) {
    return success({
      status: httpStatus.NOT_FOUND,
      message: 'User not found'
    }).send(res);
  }

  return success({
    status: httpStatus.OK,
    data: user
  }).send(res);
}

const findUserByIdController = controllerFactory()
  .method(HttpMethod.GET)
  .path('/:userId')
  .handler(asyncHandler(handler))
  .middlewares([])
  .skipAuth();

export default findUserByIdController;
