import express from 'express';
import signUp from './controllers/signUp.js';
import signIn from './controllers/signIn.js';
import refreshToken from './controllers/refreshToken.js';
import testMail from './controllers/testMail.js';
import verify from './controllers/verifySignup.js';
import resendVerifyCode from './controllers/resendVerifyCode.js';
import resetPassword from './controllers/resetPassword.js';
import getUserInfo from './controllers/getUserInfo.js';
import getPresignedUrl from './controllers/getPresignedUrl.js';

const router = express.Router();

const controllers = [
  signUp,
  signIn,
  refreshToken,
  testMail,
  verify,
  resendVerifyCode,
  resetPassword,
  getUserInfo,
  getPresignedUrl
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
