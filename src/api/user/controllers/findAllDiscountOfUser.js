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
import { findAllDiscounts } from '../../discount/discount.services.js';

const querySchema = z.object({
  status: z.enum(['active', 'inactive', 'expired'])
});

async function handler(req, res) {
  const products = await findAllDiscounts(
    {
      ownerId: req.params.userId,
      status: req.query.status
    },
    req.query
  );


  return success({
    status: httpStatus.OK,
    data: products,
    metadata: {
      pagination: {
        total: products.length,
        limit: req.query.limit,
        page: req.query.page
      }
    }
  }).send(res);
}

const findAllDiscountOfUser = controllerFactory()
  .method(HttpMethod.GET)
  .path('/:userId/discounts')
  .handler(asyncHandler(handler))
  .middlewares([validatePaginationQuery, validateReqQuery(querySchema)])
  .skipAuth();

export default findAllDiscountOfUser;
