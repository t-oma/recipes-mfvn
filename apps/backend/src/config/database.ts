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
  mongoose.connection.on("reconnected", () => {
    log.warn("MongoDB reconnected");
  });
}

export async function disconnectDatabase(log: Logger): Promise<void> {
  await mongoose.disconnect();
  log.info("MongoDB disconnected gracefully");
}
