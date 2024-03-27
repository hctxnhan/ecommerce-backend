import sendMail from '../../../services/nodemailer/index.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import controllerFactory from '../../../utils/controllerFactory.js';
import { HttpMethod } from '../../../utils/enum/index.js';
import { success } from '../../../utils/response.js';
import {
  VerifyPurpose,
  createVerifyCode
} from '../../verifyCode/verifyCode.services.js';

async function handler(req, res) {
  const code = await createVerifyCode({
    email: 'thanhnhanstudy@gmail.com',
    purpose: VerifyPurpose.SIGN_UP
  });

  // await sendMail({
  //   to: 'thanhnhanstudy@gmail.com',
  //   locals: {
  //     name: 'Nhan'
  //   },
  //   template: 'verifySignup'
  // });

  return success({
    status: 201,
    message: 'Mail sent successfully'
  }).send(res);
}

const testMail = controllerFactory()
  .method(HttpMethod.GET)
  .path('/test')
  .handler(asyncHandler(handler))
  .middlewares([])
  .skipAuth();

export default testMail;
