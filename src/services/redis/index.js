import { createClient } from 'redis';

const client = createClient();
client.on('error', (err) => console.log('Redis Client Error', err));
await client.connect();

export function releaseLock(lockKey) {
  return client.del(lockKey);
}

export async function acquireLock(
  lockKey,
  value,
  expireTime = 5000,
  retryTimes = 3,
  retryDelay = 100
) {
  for (let i = 0; i < retryTimes; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const result = await client.set(lockKey, value, 'NX', 'PX', expireTime);

    if (result === 'OK') {
      return true;
    }

    // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  return false;
}
