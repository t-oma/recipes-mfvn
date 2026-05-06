import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer | undefined;

export async function connectTestDatabase(): Promise<void> {
  mongod = await MongoMemoryServer.create({
    binary: { version: "7.0.14" },
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

export async function disconnectTestDatabase(): Promise<void> {
  await mongoose.disconnect();
  for (const modelName of Object.keys(mongoose.models)) {
    mongoose.deleteModel(modelName);
  }
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
}

export async function clearTestDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
}
