import express from 'express';
import signUp from './controllers/signUp.js';
import signIn from './controllers/signIn.js';
import refreshToken from './controllers/refreshToken.js';
import testMail from './controllers/testMail.js';
import verify from './controllers/verifySignup.js';
import resendVerifyCode from './controllers/resendVerifyCode.js';
import resetPassword from './controllers/resetPassword.js';

const router = express.Router();

const controllers = [
  signUp,
  signIn,
  refreshToken,
  testMail,
  verify,
  resendVerifyCode,
  resetPassword
];

controllers.forEach((controller) => {
  router[controller.method](
    controller.path,
    ...(controller.middlewares ?? []),
    controller.handler
  );
});

export default router;
