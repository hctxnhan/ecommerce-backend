import asyncHandler from '../../../utils/asyncHandler.js';
import { success } from '../../../utils/response.js';

export async function handler(req, res) {
  // TODO: Remove saved access token from redis
  return success({
    message: 'Logged out successfully'
  }).send(res);
}

export const signIn = {
  handler: asyncHandler(handler),
  path: '/sign-out'
};
