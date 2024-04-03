import { ObjectId } from 'mongodb';

export function toObjectId(id) {
  if (id instanceof ObjectId) {
    return id;
  }

  return new ObjectId(id);
}

export function ISODateNow() {
  return new Date(new Date().toISOString());
}
