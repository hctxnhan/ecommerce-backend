import httpStatus from 'http-status';
import { z } from 'zod';
import {
  validatePaginationQuery,
  validateReqQuery
} from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findAllCommentsOfProduct } from '../comment.services.js';

const reqBodySchema = z.object({
  parentCommentId: z.string().optional(),
  productId: z.string()
});

async function handler(req, res) {
  const result = await findAllCommentsOfProduct(
    req.query.productId,
    req.query.parentCommentId,
    req.query
  );

  return success({
    status: httpStatus.OK,
    data: result
  }).send(res);
}

const getComment = controllerFactory()
  .method(HttpMethod.GET)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery, validateReqQuery(reqBodySchema)]);

export default getComment;
