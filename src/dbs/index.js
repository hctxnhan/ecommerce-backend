import { MongoClient } from 'mongodb';
import configs from '../configs/index.js';

const uri = configs.db.url;
const client = new MongoClient(uri);
const { dbName } = configs.db;

export { client, dbName };
