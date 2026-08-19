import { db } from "./src/db";
import { newsletterCampaignsTable, newsletterSubscribersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    const subs = await db.select().from(newsletterSubscribersTable);
    console.log("Subscribers:", subs.length);
    
    const [campaign] = await db.insert(newsletterCampaignsTable)
      .values({ subject: "Test", body: "Test", status: "draft" })
      .returning();
    console.log("Inserted:", campaign.id);

    const res = await db.update(newsletterCampaignsTable)
      .set({ status: "sent", sentAt: new Date(), recipientCount: 5 })
      .where(eq(newsletterCampaignsTable.id, campaign.id))
      .returning();
    console.log("Updated:", res.length);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}
run();
