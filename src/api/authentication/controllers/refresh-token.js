import createHttpError from 'http-errors';
import httpStatus from 'http-status';
import asyncHandler from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';
import {
  didRefreshTokenUsed,
  usedRefreshToken
} from '../../token/token.services.js';
import { createToken, verifyToken } from '../auth.utils.js';
import { findUserById } from '../../user/user.services.js';
import { HttpMethod } from '../../../utils/enum/role.js';

async function handler(req, res) {
  const refreshToken = req.headers.authorization?.split(' ')[1];
  if (!refreshToken) {
    throw createHttpError(httpStatus.BAD_REQUEST, {
      message: 'Refresh token is required.'
    });
  }

  const payload = await verifyToken(refreshToken);

  const used = await didRefreshTokenUsed(refreshToken);
  if (used) {
    throw createHttpError(httpStatus.BAD_REQUEST, {
      message: 'Something went wrong, please login again.'
    });
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    throw createHttpError(httpStatus.BAD_REQUEST, {
      message: 'User does not exist.'
    });
  }

  const tokens = createToken(user);
  usedRefreshToken(refreshToken, user._id, payload.exp);

  return success({
    message: 'Refresh token successfully.',
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    }
  }).send(res);
}

const refreshToken = {
  handler: asyncHandler(handler),
  path: '/refresh-token',
  method: HttpMethod.POST
};

export default refreshToken;
