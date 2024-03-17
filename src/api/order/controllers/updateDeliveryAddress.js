import httpStatus from 'http-status';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { updatePrimaryDeliveryAddress } from '../order.services.js';

const reqBodySchema = z.object({
  address: z.string(),
  city: z.string(),
  name: z.string(),
  phone: z.string()
});

async function handler(req, res) {
  const { address, city, name, phone } = req.body;
  const { userId } = req.user;

  await updatePrimaryDeliveryAddress(userId, {
    name,
    phone,
    address,
    city
  });

  return success({
    status: httpStatus.OK,
    message: 'Delivery address updated successfully!'
  }).send(res);
}

const updateDeliveryAddress = controllerFactory()
  .method(HttpMethod.PUT)
  .path('/delivery-address')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)]);

export default updateDeliveryAddress;
