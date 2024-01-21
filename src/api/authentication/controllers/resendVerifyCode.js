import { z } from 'zod';

import { validateReqQuery } from '../../../middlewares/validateRequest.js';
import { Mail } from '../../../services/nodemailer/index.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import {
  VerifyPurpose,
  createVerifyCode
} from '../../verifyCode/verifyCode.services.js';

const querySchema = z.object({
  purpose: z.enum(Object.values(VerifyPurpose)),
  email: z.string().email()
});

async function handler(req, res) {
  const { purpose, email } = req.query;

  const verificationCode = await createVerifyCode({ email, purpose });

  switch (purpose) {
    case VerifyPurpose.SIGN_UP:
      Mail.verifySignup({ to: email, verificationCode }).send();
      break;
    case VerifyPurpose.RESET_PASSWORD:
      Mail.resetPassword({ to: email, verificationCode }).send();
      break;
    default:
      throw new Error('Unknown purpose');
  }

  return success({
    message: 'Verification code sent!'
  }).send(res);
}

const resendVerifyCode = controllerFactory()
  .method(HttpMethod.POST)
  .path('/resend-verify-code')
  .handler(asyncHandler(handler))
  .middlewares([validateReqQuery(querySchema)])
  .skipAuth();

export default resendVerifyCode;
