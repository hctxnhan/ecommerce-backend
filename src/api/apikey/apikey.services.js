import { client, dbName } from '../../services/dbs/index.js';

export async function checkApiKey(apiKey) {
  const db = client.db(dbName);
  const collection = db.collection('apiKeys');

  const existingApiKey = await collection.findOne({ apiKey });

  return !!existingApiKey;
}
