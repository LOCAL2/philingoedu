import app from "./app";
import { logger } from "./lib/logger";
import { runStartupMigration } from "./lib/startup-migration";
import { runDbBackup } from "./lib/db-backup";
import cron from "node-cron";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await runStartupMigration();

  // ── Daily DB backup at 00:00 UTC ──────────────────────────────────
  cron.schedule("0 0 * * *", async () => {
    logger.info("db-backup: cron triggered (00:00 UTC)");
    const result = await runDbBackup();
    if (result.ok) {
      logger.info(result, "db-backup: daily backup complete ✅");
    } else {
      logger.error(result, "db-backup: daily backup FAILED ❌");
    }
  });
  logger.info("db-backup: daily cron scheduled at 00:00 UTC");

  // Run first backup immediately on startup (non-blocking)
  runDbBackup().then((result) => {
    if (result.ok) {
      logger.info(result, "db-backup: startup backup complete ✅");
    } else {
      logger.error(result, "db-backup: startup backup FAILED ❌");
    }
  });
});
