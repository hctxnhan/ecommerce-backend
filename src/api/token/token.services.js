import { connect } from '../../services/dbs/index.js';

export function didRefreshTokenUsed(refreshToken) {
  return connect.TOKENS().findOne({
    token: refreshToken
  });
}

export function usedRefreshToken(refreshToken, userId, expiresAt) {
  return connect.TOKENS().insertOne({
    token: refreshToken,
    type: 'refresh',
    userId,
    expiresAt
  });
}
