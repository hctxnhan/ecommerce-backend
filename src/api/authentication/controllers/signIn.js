import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { validateReqBody } from '../../../middlewares/validateRequest.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import { findUserByEmail } from '../../user/user.services.js';
import { createToken } from '../auth.utils.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import controllerFactory from '../../../utils/controllerFactory.js';

const reqBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

async function handler(req, res) {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw createHttpError.BadRequest('User does not exist.');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw createHttpError.BadRequest('Incorrect password.');
  }

  const tokens = await createToken(user);

  return success({
    message: 'Logged in successfully.',
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }).send(res);
}

const signIn = controllerFactory()
  .method(HttpMethod.POST)
  .path('/sign-in')
  .handler(asyncHandler(handler))
  .middlewares([validateReqBody(reqBodySchema)])
  .skipAuth();

export default signIn;
