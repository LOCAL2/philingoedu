/**
 * Startup migration — guarded by a DB flag, runs only once per environment.
 * Safely updates rows that still have old thaistudyabroad brand values.
 * Uses conditional WHERE so it never overwrites admin-customised values.
 *
 * On first successful run, inserts key='startup_migration_v1_done' into
 * site_settings. On every subsequent server start, that row is detected and
 * the function returns immediately — nothing is touched.
 */
import { db } from './db.js';
import { siteSettingsTable, adminUsersTable } from '@workspace/db';
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';

/** Inserted into site_settings after first successful run — prevents re-runs */
const MIGRATION_DONE_KEY = 'startup_migration_v1_done';

const OLD_LINE_ID  = '@thaistudyabroad';
const OLD_FB_URL   = 'https://www.facebook.com/thaistudyabroad';

const NEW_LINE_ID  = '@philingo';
const NEW_FB_URL   = 'https://www.facebook.com/philingo.th';

/** Known old password hashes from original seeds — reset if still unchanged */
const OLD_PROD_HASH = '$2b$12$J4fB2./NI1RqmS3QMiSQSOXZ2oGAr17Zo9pIFEDN8Z8p870/5m23W';
const OLD_DEV_HASH  = '$2b$12$N3ThhlJALNRDO1XP6KSVL.K9uaANLhXAWUF0tARkyiKX8pHMoA.7y';
const NEW_ADMIN_PASSWORD = 'Admin@2024!';

export async function runStartupMigration(): Promise<void> {
  try {
    // ── Guard: exit immediately if this migration already ran ────────
    const [doneFlag] = await db
      .select({ value: siteSettingsTable.value })
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, MIGRATION_DONE_KEY))
      .limit(1);

    if (doneFlag) {
      logger.info('startup-migration: already completed — skipping');
      return;
    }
    // ────────────────────────────────────────────────────────────────

    // 1. Fix old brand contact settings (only if still on old value)
    const settingFixes: [string, string, string][] = [
      // contact_email is managed by admin — do NOT touch it here
      ['line_id',       OLD_LINE_ID, NEW_LINE_ID],
      ['facebook_url',  OLD_FB_URL,  NEW_FB_URL],
    ];

    for (const [key, oldVal, newVal] of settingFixes) {
      const result = await db
        .update(siteSettingsTable)
        .set({ value: newVal })
        .where(and(eq(siteSettingsTable.key, key), eq(siteSettingsTable.value, oldVal)));
      if ((result as any).rowCount > 0) {
        logger.info(`startup-migration: updated ${key} → ${newVal}`);
      }
    }

    // 2. Reset admin password only if it still has a known old hash
    const [admin] = await db
      .select({ id: adminUsersTable.id, passwordHash: adminUsersTable.passwordHash })
      .from(adminUsersTable)
      .where(eq(adminUsersTable.email, 'admin@philingo.com'))
      .limit(1);

    if (admin) {
      const isOldHash = (admin.passwordHash === OLD_PROD_HASH || admin.passwordHash === OLD_DEV_HASH);
      if (isOldHash) {
        const newHash = await bcrypt.hash(NEW_ADMIN_PASSWORD, 12);
        await db
          .update(adminUsersTable)
          .set({ passwordHash: newHash })
          .where(eq(adminUsersTable.id, admin.id));
        logger.info('startup-migration: admin password reset to Admin@2024!');
      }
    }

    // ── Mark as permanently done ─────────────────────────────────────
    await db.insert(siteSettingsTable)
      .values({
        key:   MIGRATION_DONE_KEY,
        value: new Date().toISOString(),
        group: 'system',
        label: 'Startup migration v1 — completed at this timestamp',
      })
      .onConflictDoNothing();
    logger.info('startup-migration: completed and marked done');
    // ────────────────────────────────────────────────────────────────

  } catch (err) {
    // Non-fatal — log and continue booting
    logger.warn({ err }, 'startup-migration: failed (non-fatal)');
  }
}
