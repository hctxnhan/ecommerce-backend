import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { z } from 'zod';

import configs from '../../../configs/index.js';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import { connect } from '../../../services/dbs/index.js';
import { Mail } from '../../../services/nodemailer/index.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod, Role, Status } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import { findUserByEmail } from '../../user/user.services.js';
import {
  VerifyPurpose,
  createVerifyCode
} from '../../verifyCode/verifyCode.services.js';

const reqBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
    name: z.string().min(1).max(100)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

async function handler(req, res) {
  const { email, password, name } = req.body;

  const user = await findUserByEmail(email);
  if (user) {
    throw createHttpError.Conflict('User already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, configs.auth.saltRounds);

  await connect.USERS().insertOne({
    email,
    password: hashedPassword,
    name,
    status: Status.ACTIVE,
    role: Role.USER,
    verified: false
  });

  const verificationCode = await createVerifyCode({
    email,
    purpose: VerifyPurpose.SIGN_UP
  });

  await Mail.verifySignup({ to: email, verificationCode }).send();

  return success({
    status: 201,
    message:
      'An email has been sent to your email address. Get the code and verify your account to complete the sign up process. The code will expire in 5 minutes.'
  }).send(res);
}

const signUp = controllerFactory()
  .method(HttpMethod.POST)
  .path('/sign-up')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)])
  .skipAuth();

export default signUp;
