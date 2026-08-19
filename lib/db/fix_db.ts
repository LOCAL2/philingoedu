import pkg from 'pg';
const { Client } = pkg;
const dbUrl = "postgresql://postgres.srxteomobjamicmpetwj:0956362445za@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";
const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  try {
    await client.connect();
    await client.query(`ALTER TABLE "newsletter_campaigns" ALTER COLUMN "recipient_count" DROP DEFAULT;`);
    await client.query(`ALTER TABLE "newsletter_campaigns" ALTER COLUMN "recipient_count" TYPE integer USING ("recipient_count"::integer);`);
    await client.query(`ALTER TABLE "newsletter_campaigns" ALTER COLUMN "recipient_count" SET DEFAULT 0;`);
    await client.query(`DROP SEQUENCE IF EXISTS newsletter_campaigns_recipient_count_seq CASCADE;`);
    console.log("Success");
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
    process.exit(0);
  }
}
main();
