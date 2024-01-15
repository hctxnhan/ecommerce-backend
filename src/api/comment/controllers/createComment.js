import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import Comment from '../comment.models.js';

const reqBodySchema = z.object({
  content: z.string(),
  productId: z.string(),
  parentCommentId: z.string().optional()
});

async function handler(req, res) {
  const result = await Comment.create({
    ...req.body,
    userId: req.user.userId
  });

  if (!result.success) {
    if (result.reason === 'INTERNAL_SERVER_ERROR') {
      throw createHttpError.InternalServerError(result.message);
    }
    throw createHttpError.BadRequest(result.message);
  }

  return success({
    status: httpStatus.CREATED,
    message: 'Comment has been created!'
  }).send(res);
}

const createComment = controllerFactory()
  .method(HttpMethod.POST)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)]);

export default createComment;
