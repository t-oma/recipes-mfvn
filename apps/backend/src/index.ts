import { buildApp } from "./app.js";
import { ensureRootAdmin } from "./common/bootstrap/admin.js";
import { logger } from "./common/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

async function start() {
  await connectDatabase(logger);
  await ensureRootAdmin(logger);

  const app = await buildApp(logger);

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const signals = ["SIGINT", "SIGTERM"] as const satisfies NodeJS.Signals[];

  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info({ signal }, "Received signal, shutting down gracefully");
      try {
        await app.close();
        app.log.info("HTTP server closed");
        await disconnectDatabase(logger);
      } catch (err) {
        app.log.error(err, "Error during shutdown");
      }
      process.exit(0);
    });
  }
}

start();
