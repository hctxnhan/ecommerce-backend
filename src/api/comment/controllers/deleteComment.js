import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { deleteComment } from '../comment.services.js';
import { roleCheck } from '../../../middlewares/roleCheck.js';
import { Permission, Resource } from '../../rbac/index.js';

async function handler(req, res) {
  const result = await deleteComment(req.params.commentId);

  if (!result.success) {
    throw createHttpError.BadRequest(result.message);
  }

  return success({
    status: httpStatus.OK,
    message: 'Comment has been deleted!'
  }).send(res);
}

const deleteCommentController = controllerFactory()
  .method(HttpMethod.DELETE)
  .path('/:commentId')
  .handler(asyncHandler(handler))
  .middlewares([roleCheck(Resource.COMMENT, Permission.DELETE_OWN)]);

export default deleteCommentController;
