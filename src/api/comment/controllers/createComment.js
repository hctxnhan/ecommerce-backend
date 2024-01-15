import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findCommentById } from '../comment.services.js';
import Comment from '../comment.models.js';

const reqBodySchema = z
  .object({
    content: z.string(),
    productId: z.string(),
    parentComment: z.string().optional()
  })
  .strip();

async function handler(req, res) {
  if (req.body.parentId) {
    const parentComment = await findCommentById(req.body.parentId);
    if (!parentComment) {
      throw createHttpError.BadRequest('Comment parent not found!');
    }
  }

  const createdComment = await Comment.create(req.body);

  if (!createdComment) {
    throw createHttpError.BadRequest('Cannot create comment!');
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
