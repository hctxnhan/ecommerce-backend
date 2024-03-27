import Email from 'email-templates';
import configs from '../../configs/index.js';

const email = new Email({
  message: {
    from: configs.mailTransfer.auth.user
  },
  transport: {
    service: 'gmail',
    auth: {
      user: configs.mailTransfer.auth.user,
      pass: configs.mailTransfer.auth.password
    }
  },
  send: true,
  preview: {
    open: {
      app: 'edge',
      wait: false
    },
    openSimulator: false
  }
});

export default async function sendMail({ to, template, locals }) {
  return email
    .send({
      template,
      message: {
        to
      },
      locals
    })
    .catch(console.error);
}

export const Mail = {
  TEMPLATE: {
    VERIFY_SIGN_UP: 'verifySignup',
    RESET_PASSWORD: 'resetPassword'
  },
  verifySignup({ to, name, verificationCode }) {
    return {
      send: () =>
        sendMail({
          to,
          template: Mail.TEMPLATE.VERIFY_SIGN_UP,
          locals: {
            name,
            verificationCode
          }
        })
    };
  },
  resetPassword({ to, verificationCode }) {
    return {
      send: () =>
        sendMail({
          to,
          template: Mail.TEMPLATE.RESET_PASSWORD,
          locals: {
            verificationCode
          }
        })
    };
  }
};
