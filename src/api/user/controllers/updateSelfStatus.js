import httpStatus from 'http-status';
import { z } from 'zod';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { Permission, Resource } from '../../rbac/index.js';
import { updateUser } from '../user.services.js';
import { toObjectId } from '../../../utils/index.js';

const reqBodySchema = z.object({
  status: z.string()
});

async function handler(req, res) {
  const { userId } = req.user;
  const { status } = req.body;

  await updateUser({
    _id: toObjectId(userId),
    status
  });

  return success({
    status: httpStatus.OK,
    data: {
      message: 'User status updated successfully'
    }
  }).send(res);
}

const updateUserStatusApi = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/updateStatus')
  .handler(asyncHandler(handler))
  .middlewares([
    validateReqBody(reqBodySchema),
    roleCheck(Resource.USER, Permission.UPDATE)
  ]);

export default updateUserStatusApi;
