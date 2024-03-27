import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { createPresignedUrl } from '../../../services/aws/s3.js';

async function handler(req, res) {
  const { userId } = req.user;

  const url = await createPresignedUrl(
    `user-avatars/avatar-${userId}.jpg`,
    'putObject'
  );

  return success({
    status: httpStatus.OK,
    data: { url }
  }).send(res);
}

const getPresignedUrl = controllerFactory()
  .method(HttpMethod.GET)
  .path('/profile/avatar/presigned-url')
  .handler(asyncHandler(handler))
  .middlewares([]);

export default getPresignedUrl;
