import mongoose from "mongoose";
import type { Logger } from "@/common/logger.js";
import { env } from "./env.js";

export async function connectDatabase(log: Logger): Promise<void> {
  try {
    await mongoose.connect(env.MONGO_URI);
    log.info("MongoDB connected");
  } catch (error) {
    log.fatal(error, "MongoDB connection error");
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    log.error(err, "MongoDB connection error");
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
