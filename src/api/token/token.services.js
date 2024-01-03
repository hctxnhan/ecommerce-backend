import { client, dbName } from '../../dbs/index.js';

export function didRefreshTokenUsed(refreshToken) {
  return client.db(dbName).collection('tokens').findOne({
    token: refreshToken
  });
}

export function usedRefreshToken(refreshToken, userId, expiresAt) {
  return client.db(dbName).collection('tokens').insertOne({
    token: refreshToken,
    type: 'refresh',
    userId,
    expiresAt
  });
}
