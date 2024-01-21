import { config } from 'dotenv';

config({
  path: `.env.${process.env.NODE_ENV}`
});

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const configs = {
  app: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost'
  },
  auth: {
    saltRounds: Number.parseInt(process.env.SALT_ROUNDS, 10) || 10,
    jwtSecret: process.env.JWT_SECRET,
    apiKeySecret: process.env.APIKEY_SECRET,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
  },
  db: {
    url: process.env.MONGO_URL,
    dbName: process.env.MONGO_DB_NAME
  },
  mailTransfer: {
    service: process.env.MAIL_TRANSFER_SERVICE,
    auth: {
      user: process.env.MAIL_TRANSFER_USER,
      password: process.env.MAIL_TRANSFER_PASSWORD
    }
  },
  env: process.env.NODE_ENV || 'development',
};

export default configs;
