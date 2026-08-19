import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { newsletterCampaignsTable } from "./lib/db/src/schema/contacts";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

// Read DATABASE_URL from .env
const env = readFileSync("./artifacts/api-server/.env", "utf8");
const dbUrl = env.split("\n").find(l => l.startsWith("DATABASE_URL="))?.split("=")[1]?.trim();

const client = postgres(dbUrl || "");
const db = drizzle(client);

async function main() {
  try {
    console.log("Inserting campaign...");
    const [campaign] = await db.insert(newsletterCampaignsTable)
      .values({ subject: "Test", body: "Test body" })
      .returning();
    console.log("Inserted:", campaign);

    console.log("Updating campaign...");
    const res = await db.update(newsletterCampaignsTable)
      .set({ status: "sent", sentAt: new Date(), recipientCount: 5 })
      .where(eq(newsletterCampaignsTable.id, campaign.id))
      .returning();
    console.log("Updated:", res);
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    process.exit(0);
  }
}
main();
