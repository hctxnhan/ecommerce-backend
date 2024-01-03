import jwt from 'jsonwebtoken';
import configs from '../../configs/index.js';

export const createToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    status: user.status,
    verified: user.verified,
    email: user.email
  };

  const accessToken = jwt.sign(payload, configs.auth.jwtSecret, {
    expiresIn: configs.auth.accessTokenExpiresIn,
    algorithm: 'HS256'
  });

  const refreshToken = jwt.sign(payload, configs.auth.jwtSecret, {
    expiresIn: configs.auth.refreshTokenExpiresIn,
    algorithm: 'HS256'
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  const payload = jwt.verify(token, configs.auth.jwtSecret);
  return payload;
};
