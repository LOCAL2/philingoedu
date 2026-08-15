#!/usr/bin/env tsx
/* seed-website-urls.ts — backfill website_url for all schools from static data */
import { db } from '../../lib/db/src/index.js';
import { schoolsTable } from '../../lib/db/src/schema/schools.js';
import { eq, sql } from 'drizzle-orm';

const WEBSITE_MAP: Record<string, string> = {
  'cia':               'https://www.cebucia.com',
  'qq-english':        'https://www.qqenglish.com',
  'philinter':         'https://www.philinter.com',
  'b-cebu':            'https://bcebu.com',
  'bcebu':             'https://bcebu.com',
  'cpils':             'https://www.cpils.com',
  'ev-academy':        'https://www.ev-academy.com',
  'smeag':             'https://www.smeag.com',
  'pines':             'https://pinesacademy.com',
  'gitc':              'http://gitc.edu.ph',
  'gitc-iloilo':       'http://gitc.edu.ph',
  'english-fella':     'https://englishfella.com',
  'cpi':               'https://www.cebucpi.com',
  'cella':             'https://www.cellaenglish.com',
  'cg-academy':        'https://www.cgesl.com',
  'ims-academy':       'https://imsacademy.net',
  'glc-english':       'https://glcenglish.com',
  'ibreeze':           'https://cebuibreeze.com',
  'winning-english':   'https://winningenglishschool.com',
  'genius-english':    'https://studyenglishgenius.com',
  '3d-academy':        'https://3d-universal.com',
  'idea-english':      'https://ideaenglish.net',
  'btes':              'https://btes.ph',
  'beci':              'https://beciedu.com',
  'monol':             'https://monol.edu.ph',
  'help-english':      'https://helpenglish.org',
  'jic-academy':       'https://baguiojic.com',
  'aj-academy':        'https://anjacademy.com',
  'wales-english':     'https://walesacademy.com',
  'cns-academy':       'https://cnsenglish.com',
  'cip-english':       'https://cipenglish.net',
  'eg-academy':        'https://egesl.com',
  'hana-academy':      'https://clarkhana.com',
  'we-academy':        'https://clarkweacademy.com',
  'gs-academy':        'https://gsnels.com',
  'mk-education':      'https://mk-edu.com',
  'e-room':            'https://e-roominc.com',
  'lslc':              'https://lslc.edu.ph',
  'enderun':           'https://www.enderuncolleges.com',
  'wesli':             'https://wesli.com.ph',
  'we-academy-iloilo': 'https://www.weacademy-iloilo.com',
  'mk-education-iloilo': 'https://www.mk-edu.net',
  'pia-iloilo':        'https://iloilopia.com',
};

let updated = 0;
let skipped = 0;

for (const [slug, url] of Object.entries(WEBSITE_MAP)) {
  try {
    const result = await db
      .update(schoolsTable)
      .set({ websiteUrl: url, updatedAt: new Date() })
      .where(eq(schoolsTable.slug, slug))
      .returning({ id: schoolsTable.id, slug: schoolsTable.slug });
    if (result.length > 0) {
      console.log(`✅ ${slug} → ${url}`);
      updated++;
    } else {
      console.log(`⚠️  ${slug} — not found in DB`);
      skipped++;
    }
  } catch (e: any) {
    console.error(`❌ ${slug}: ${e.message}`);
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} not found`);
process.exit(0);
