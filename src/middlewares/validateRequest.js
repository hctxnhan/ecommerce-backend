import createHttpError from 'http-errors';
import { z } from 'zod';
import { checkApiKey } from '../api/apikey/apikey.service.js';
import { verifyToken } from '../api/authentication/auth.utils.js';

export function validateReqBody(schema) {
  return async (req, res, next) => {
    try {
      const reqBody = await schema.parseAsync(req.body);
      req.body = reqBody;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export async function validateToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw createHttpError.Unauthorized('Access token not found');
    }

    const payload = await verifyToken(token);
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
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

const PaginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(10)
});

export function validatePaginationQuery(req, res, next) {
  try {
    const { page, limit } = req.query;
    const paginationQuery = PaginationQuerySchema.passthrough().parse({
      page,
      limit
    });

    req.query.page = paginationQuery.page;
    req.query.limit = paginationQuery.limit;

    next();
  } catch (error) {
    next(error);
  }
}

export function validateReqQuery(schema) {
  return async (req, res, next) => {
    try {
      const reqQuery = schema.passthrough().parse(req.query);
      req.query = reqQuery;
      next();
    } catch (error) {
      next(error);
    }
  };
}
