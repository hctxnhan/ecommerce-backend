import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import {
  validatePaginationQuery,
  validateReqQuery
} from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findProducts } from '../product.services.js';

const QuerySchema = z.object({
  status: z.enum(['published', 'draft']).default('published')
});

async function handler(req, res) {
  const { status, page, limit } = req.query;

  const result = await findProducts({
    isPublished: status === 'published',
    owner: new ObjectId(req.user.userId),
    // page,
    // limit
  }).toArray();

  return success({
    status: httpStatus.OK,
    data: result,
    metadata: {
      pagination: {
        total: result.length,
        limit: req.query.limit,
        page: req.query.page
      }
    }
  }).send(res);
}

const findAllOwnProduct = controllerFactory()
  .method(HttpMethod.GET)
  .path('/my-products')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery, validateReqQuery(QuerySchema)]);

export default findAllOwnProduct;
