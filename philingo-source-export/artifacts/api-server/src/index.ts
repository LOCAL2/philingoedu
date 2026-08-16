import app from "./app";
import { logger } from "./lib/logger";
import { runStartupMigration } from "./lib/startup-migration";
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
  // Only run when GCS bucket is configured (production)
  const bucketId = process.env["DEFAULT_OBJECT_STORAGE_BUCKET_ID"];
  if (bucketId) {
    const { runDbBackup } = await import("./lib/db-backup");
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
  } else {
    logger.info("db-backup: skipped (DEFAULT_OBJECT_STORAGE_BUCKET_ID not set)");
  }
});
