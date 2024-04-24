import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { z } from 'zod';
import configs from '../../../configs/index.js';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { updateUser } from '../../user/user.services.js';
import {
  VerifyPurpose,
  useVerifyCode
} from '../../verifyCode/verifyCode.services.js';

const reqBodySchema = z.object({
  code: z.coerce.string(),
  email: z.string().email(),
  password: z.string().min(8)
});

async function handler(req, res) {
  const { password, code, email } = req.body;

  const result = await useVerifyCode({
    email,
    code,
    purpose: VerifyPurpose.RESET_PASSWORD
  });

  if (!result.success) {
    throw createHttpError.BadRequest(result.message);
  }

  const hashedPassword = await bcrypt.hash(password, configs.auth.saltRounds);

  await updateUser({ email }, { password: hashedPassword });

  return success({
    message: 'Password reset successfully!'
  }).send(res);
}

const resetPassword = controllerFactory()
  .method(HttpMethod.POST)
  .path('/reset-password')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)])
  .skipAuth();

export default resetPassword;
