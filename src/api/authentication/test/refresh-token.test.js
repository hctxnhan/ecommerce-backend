import httpStatus from 'http-status';
import createHttpError from 'http-errors';
import refreshToken from '../controllers/refreshToken.js';
import { verifyToken } from '../auth.utils';
import {
  didRefreshTokenUsed,
  usedRefreshToken
} from '../../token/token.services';

describe('Refresh token handler', () => {
  beforeEach(() => {
    const mockDidRefreshTokenUsed = jest.fn().mockReturnValue(true);
    didRefreshTokenUsed.mockReturnValueOnce(mockDidRefreshTokenUsed);

    const mockVerifyToken = jest.fn().mockReturnValueOnce(() => {
      throw new Error();
    });

    verifyToken.mockReturnValueOnce(mockVerifyToken);

    const mockUsedRefreshToken = jest.fn();
    usedRefreshToken.mockReturnValueOnce(mockUsedRefreshToken);
  });

  it('Should throw error if refresh token is missing from the request header', async () => {
    const req = {
      headers: {}
    };

    await refreshToken.handler(req);

    expect(() => refreshToken.handler(req)).toThrowError(
      createHttpError(httpStatus.BAD_REQUEST, {
        message: 'Refresh token is required'
      })
    );
  });

  it('Should throw error if the token is used before', async () => {
    const req = {
      headers: {
        authorization: 'Bearer refreshToken'
      }
    };
    const res = {};

    await refreshToken.handler(req, res);

    await expect(refreshToken.handler(req, res)).rejects.toThrowError(
      createHttpError.BadRequest('Refresh token has been used')
    );
  });

  it('Should throw error if the token is invalid', () => {
    const req = {
      headers: {
        authorization: 'Bearer refreshToken'
      }
    };
    const res = {};

    expect(() => refreshToken.handler(req, res)).toThrowError(
      createHttpError(httpStatus.BAD_REQUEST, {
        message: 'Refresh token is required'
      })
    );
  });

  it('Should call mark refresh token as used', async () => {
    const req = {
      headers: {
        authorization: 'Bearer refreshToken'
      }
    };
    const res = {};

    const mockDidRefreshTokenUsed = jest.fn().mockReturnValue(false);
    didRefreshTokenUsed.mockReturnValueOnce(mockDidRefreshTokenUsed);

    const mockVerifyToken = jest.fn().mockReturnValue({
      userId: 'userId'
    });

    verifyToken.mockReturnValueOnce(mockVerifyToken);

    await refreshToken.handler(req, res);

    expect(mockUsedRefreshToken).toHaveBeenCalledWith('refreshToken');
  });
});
