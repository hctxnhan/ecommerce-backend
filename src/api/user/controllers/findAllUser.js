import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { USER_STATUS, getUsers } from '../user.services.js';
import { z } from 'zod';
import { validatePaginationQuery } from '../../../middlewares/validateRequest.js';

const reqQuerySchema = z.object({
  status: z
    .enum(Object.values(USER_STATUS))
    .optional()
    .default(USER_STATUS.ACTIVE),
  role: z.enum(Object.values(USER_ROLE)).optional().default(USER_ROLE.USER)
});

async function handler(req, res) {
  const { status, role } = req.query;
  const users = await getUsers({
    limit: req.query.limit,
    page: req.query.page,
    status,
    role
  });

  return success({
    status: httpStatus.OK,
    data: users
  }).send(res);
}

const findAllUsersController = controllerFactory()
  .method(HttpMethod.GET)
  .path('/')
  .handler(asyncHandler(handler))
  .middlewares([
    validatePaginationQuery,
    validateReqQuery(reqQuerySchema),
    roleCheck(Resource.USER, Permission.READ_ANY)
  ])
  .skipAuth();

export default findAllUsersController;
