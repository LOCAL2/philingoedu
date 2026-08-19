import { db } from "./artifacts/api-server/src/db";
import { newsletterCampaignsTable } from "./lib/db/src/schema/contacts";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const [campaign] = await db.insert(newsletterCampaignsTable)
      .values({ subject: "Test", body: "Test body" })
      .returning();
    console.log("Inserted:", campaign);

    const res = await db.update(newsletterCampaignsTable)
      .set({ status: "sent", sentAt: new Date(), recipientCount: 5 })
      .where(eq(newsletterCampaignsTable.id, campaign.id))
      .returning();
    console.log("Updated:", res);
  } catch (e) {
    console.error("DB Error:", e);
  }
}
main();
