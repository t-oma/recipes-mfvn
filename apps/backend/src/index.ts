import { buildApp } from "./app.js";
import { ensureRootAdmin } from "./common/bootstrap/admin.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function start() {
  await connectDatabase();
  await ensureRootAdmin();

  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
