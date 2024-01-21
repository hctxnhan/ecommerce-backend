import createHttpError from 'http-errors';
import { z } from 'zod';

import { validateReqQuery } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { updateUser } from '../../user/user.services.js';
import {
  VerifyPurpose,
  useVerifyCode
} from '../../verifyCode/verifyCode.services.js';

const querySchema = z.object({
  code: z.coerce.number(),
  email: z.string().email()
});

async function handler(req, res) {
  const { code, email } = req.query;

  const result = await useVerifyCode({
    email,
    code,
    purpose: VerifyPurpose.SIGN_UP
  });

  if (!result.success) {
    throw createHttpError.BadRequest(result.message);
  }

  await updateUser({ email }, { verified: true });

  return success({
    message: 'Account verified successfully!'
  }).send(res);
}

const verifySignup = controllerFactory()
  .method(HttpMethod.POST)
  .path('/verify-signup')
  .handler(asyncHandler(handler))
  .middlewares([validateReqQuery(querySchema)])
  .skipAuth();

export default verifySignup;
