import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {};

let _clientPromise: Promise<MongoClient> | undefined;

export function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global.__mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global.__mongoClientPromise = client.connect();
    }
    return global.__mongoClientPromise;
  }

  if (!_clientPromise) {
    const client = new MongoClient(uri, options);
    _clientPromise = client.connect();
  }
  return _clientPromise;
}
