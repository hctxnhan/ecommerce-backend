import httpStatus from 'http-status';
import ErrorResponse from './response/ErrorResponse.js';
import SuccessResponse from './response/SuccessResponse.js';

export function success({
  status = 200,
  message = httpStatus[200],
  data,
  metadata
}) {
  return new SuccessResponse({ status, message, data, metadata });
}

export function error({ status = 500, message = httpStatus[500], errors }) {
  return new ErrorResponse({ status, message, errors });
}
