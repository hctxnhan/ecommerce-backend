import { connect } from '../../services/dbs/index.js';

export const VerifyPurpose = {
  SIGN_UP: 'SIGN_UP',
  RESET_PASSWORD: 'RESET_PASSWORD'
};

export function generateVerifyCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createVerifyCode({ email, purpose }) {
  let code;
  while (true) {
    code = generateVerifyCode();
    // eslint-disable-next-line no-await-in-loop
    const existingCode = await connect.VERIFY_CODES().findOne({
      code,
      expiredAt: { $gt: new Date().toISOString() }
    });
    if (!existingCode) {
      break;
    }
  }

  await connect.VERIFY_CODES().insertOne({
    email,
    code,
    purpose,
    expiredAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  });

  return code;
}

export async function verifyCode({ email, code, purpose }) {
  const existingCode = await connect.VERIFY_CODES().findOne({
    email,
    code,
    purpose
  });

  if (!existingCode) {
    return {
      valid: false,
      reason: 'INVALID_CODE',
      message: 'Invalid code'
    };
  }

  if (existingCode.expiredAt < new Date().toISOString()) {
    return {
      valid: false,
      reason: 'EXPIRED_CODE',
      message: 'Code expired'
    };
  }

  return {
    valid: true
  };
}

export function deleteVerifyCode({ email, code, purpose }) {
  return connect.VERIFY_CODES().deleteOne({
    email,
    code,
    purpose
  });
}

export async function useVerifyCode({ email, code, purpose }) {
  const result = await verifyCode({ email, code, purpose });

  if (!result.valid) {
    return {
      success: false,
      reason: result.reason,
      message: result.message
    };
  }

  await deleteVerifyCode({ email, code, purpose });

  return {
    success: true
  };
}
