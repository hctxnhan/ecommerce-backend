import httpStatus from 'http-status';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { updateProfile } from '../user.services.js';

const reqBodySchema = z
  .object({
    name: z.string(),
    phone: z.string()
  })
  .strict();

async function handler(req, res) {
  const { name, phone } = req.body;
  const { userId } = req.user;

  await updateProfile(userId, { name, phone });

  return success({
    status: httpStatus.OK,
    message: 'Profile updated successfully!'
  }).send(res);
}

const updateProfileController = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/profile')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)]);

export default updateProfileController;
