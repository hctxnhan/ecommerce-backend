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
import { findProducts } from '../product.services.js';

const QuerySchema = z.object({
  search: z.string().default(''),
  type: z.string().default('')
});

async function handler(req, res) {
  const { search, page, limit, type = 'all' } = req.query;

  const result = await findProducts(
    {
      isPublished: true,
      type: type === 'all' ? { $ne: 'all' } : type
    },
    {
      search,
      page,
      limit
    }
  ).toArray();

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

const findAllProduct = controllerFactory()
  .method(HttpMethod.GET)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery, validateReqQuery(QuerySchema)])
  .skipAuth();

export default findAllProduct;
