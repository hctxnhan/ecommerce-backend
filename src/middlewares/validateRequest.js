import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import configs from '../configs/index.js';
import { checkApiKey } from '../api/apikey/apikey.service.js';

export function validateReqBody(schema) {
  return async (req, res, next) => {
    try {
      const reqBody = await schema.parseAsync(req.body);
      req.body = reqBody;
      next();
    } catch (error) {
      next(
        createHttpError(400, {
          message: 'Invalid request body',
          details: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message
          }))
        })
      );
    }
  };
}

export async function validateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw createHttpError.Unauthorized('Access token not found');
  }

  await jwt.verify(token, configs.auth.jwtSecret);
  next();
}

export async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    throw createHttpError.Unauthorized('API key not found');
  }

  const isValid = await checkApiKey(apiKey);
  if (!isValid) {
    throw createHttpError.Unauthorized('API key is invalid');
  }

  next();
}
