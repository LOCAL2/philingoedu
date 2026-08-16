import bcrypt from "bcryptjs";
import { db } from "./lib/db.js";
import { adminUsersTable, siteSettingsTable, schoolsTable, coursesTable, faqsTable, testimonialsTable, partnersTable, promotionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Admin User ───────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@philingo.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin@2024!";
  const existing = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, adminEmail)).limit(1);
  if (!existing.length) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.insert(adminUsersTable).values({ email: adminEmail, passwordHash, name: "Philingo Admin", role: "superadmin" });
    console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("ℹ️ Admin user already exists, skipping.");
  }

  // ─── Site Settings ────────────────────────────────────────────
  const settings = [
    { key: "site_name", value: "Philingo", group: "general", label: "ชื่อเว็บไซต์" },
    { key: "site_description", value: "บริการส่งนักเรียนไทยเรียนภาษาอังกฤษที่ฟิลิปปินส์ครบวงจร", group: "general", label: "คำอธิบายเว็บไซต์" },
    { key: "contact_email", value: "philingoedu@gmail.com", group: "contact", label: "อีเมลติดต่อ" },
    { key: "phone", value: "061-656-4159", group: "contact", label: "เบอร์โทร" },
    { key: "address", value: "88/27 The City Pinklao\nถนนบรมราชชนนี แขวงศาลาธรรมสพน์\nเขตทวีวัฒนา กรุงเทพฯ 10170", group: "contact", label: "ที่อยู่" },
    { key: "line_id", value: "@philingo", group: "social", label: "LINE ID" },
    { key: "facebook_url", value: "https://www.facebook.com/philingo.th", group: "social", label: "Facebook URL" },
    { key: "tiktok_url", value: "https://www.tiktok.com/@philingo", group: "social", label: "TikTok URL" },
    { key: "line_url", value: "https://lin.ee/nBR4rsN", group: "social", label: "LINE URL" },
    { key: "ga4_id", value: "", group: "analytics", label: "Google Analytics 4 ID" },
    { key: "fb_pixel_id", value: "", group: "analytics", label: "Facebook Pixel ID" },
    { key: "gtm_id", value: "", group: "analytics", label: "Google Tag Manager ID" },
    // Notification settings
    { key: "notification_email", value: "", group: "notifications", label: "อีเมลรับแจ้งเตือนฟอร์ม" },
    { key: "line_notify_token", value: "", group: "notifications", label: "LINE Notify Token" },
  ];

  for (const s of settings) {
    await db.insert(siteSettingsTable).values(s).onConflictDoNothing();
  }
  console.log("✅ Site settings seeded");

  // ─── Schools ─────────────────────────────────────────────────
  const schools = [
    // ── Cebu Partners ──────────────────────────────────────────────────────
    { slug: "cia",        name: "CIA (Cebu International Academy)",  nameTh: "ซีไอเอ เซบู",               city: "Mactan, Cebu City",   rating: 4.8, studentsCount: "800+",  nationalityCount: "15+ ชาติ", foundedYear: 2003, isFeatured: true,  sortOrder: 1,  tags: ["Semi-Sparta","New Campus","IELTS","TOEIC"],        accentClass: "from-red-800 to-red-600",        tagline: "Semi-Sparta | แคมปัสพรีเมียม Mactan Island",       taglineTh: "Semi-Sparta | แคมปัสพรีเมียม | เกาะ Mactan" },
    { slug: "qq-english", name: "QQ English",                         nameTh: "คิวคิว อิงลิช",              city: "IT Park, Cebu City",  rating: 4.7, studentsCount: "500+",  nationalityCount: "12+ ชาติ", foundedYear: 2008, isFeatured: true,  sortOrder: 2,  tags: ["Callan Method","ESL","IELTS","IT Park"],           accentClass: "from-sky-500 to-blue-600",       tagline: "Callan Method | พูดคล่อง 4× | IT Park Cebu",       taglineTh: "Callan Method | พูดคล่องไว | IT Park" },
    { slug: "philinter",  name: "Philinter Academy",                  nameTh: "ฟิลินเตอร์ อคาเดมี",        city: "Mactan, Cebu City",   rating: 4.7, studentsCount: "400+",  nationalityCount: "10+ ชาติ", foundedYear: 2003, isFeatured: true,  sortOrder: 3,  tags: ["Business English","Speaking","Cambridge","ESL"],   accentClass: "from-green-800 to-green-600",    tagline: "Business & Speaking | Cambridge | Mactan",          taglineTh: "ธุรกิจ & Speaking | Cambridge | Mactan" },
    { slug: "b-cebu",     name: "B'Cebu Language School",             nameTh: "บี เซบู แลงกวิจ สคูล (เซบู)", city: "Banilad, Cebu City", rating: 4.6, studentsCount: "300+",  nationalityCount: "10+ ชาติ", foundedYear: 2015, isFeatured: false, sortOrder: 4,  tags: ["Intensive","New Campus","IELTS","TOEIC"],          accentClass: "from-blue-700 to-indigo-700",    tagline: "แคมปัสใหม่ | Intensive | Banilad Cebu City",        taglineTh: "แคมปัสใหม่ | เข้มข้น | Banilad เซบู" },
    { slug: "cpils",      name: "CPILS",                              nameTh: "ซีพีไอแอลเอส",               city: "Cebu City",           rating: 4.7, studentsCount: "600+",  nationalityCount: "15+ ชาติ", foundedYear: 1999, isFeatured: true,  sortOrder: 5,  tags: ["Native Teachers","IELTS Guarantee","ESL","TOEIC"], accentClass: "from-orange-500 to-amber-600",   tagline: "Native Teacher 100% | ก่อตั้ง 1999 | ใจกลาง Cebu", taglineTh: "ครูเจ้าของภาษา 100% | ก่อตั้ง 1999" },
    { slug: "ev-academy", name: "EV Academy",                         nameTh: "อีวี อคาเดมี",               city: "Cebu City",           rating: 4.7, studentsCount: "400+",  nationalityCount: "20+ ชาติ", foundedYear: 2010, isFeatured: false, sortOrder: 6,  tags: ["Resort Style","French Owner","IELTS","Semi-Sparta"], accentClass: "from-amber-600 to-yellow-600",  tagline: "Resort Campus | French-Managed | Premium",          taglineTh: "แคมปัส Resort | บริหารโดยชาวฝรั่งเศส" },
    { slug: "smeag",      name: "SMEAG Global School",                nameTh: "สเมก โกลบอล สคูล",           city: "Cebu City",           rating: 4.8, studentsCount: "1200+", nationalityCount: "20+ ชาติ", foundedYear: 1996, isFeatured: true,  sortOrder: 7,  tags: ["Sparta","IELTS Guarantee","Big Campus"],           accentClass: "from-red-600 to-orange-600",     tagline: "Sparta & Classic | IELTS Guarantee | 1,200+ นักเรียน", taglineTh: "Sparta | การันตี IELTS | นักเรียน 1,200+ คน" },
    { slug: "gitc",       name: "GITC (Green International Technological College)", nameTh: "จีไอทีซี เซบู", city: "La Paz, Cebu City",  rating: 4.4, studentsCount: "250+",  nationalityCount: "10+ ชาติ", foundedYear: 2003, isFeatured: false, sortOrder: 8,  tags: ["ESL","IELTS","TOEIC"],                            accentClass: "from-green-600 to-emerald-600",  tagline: "ESL & IELTS & TOEIC | La Paz, Cebu City",           taglineTh: "ESL, IELTS, TOEIC | ค่าเรียนประหยัด" },
    // ── Cebu Non-Partners ──────────────────────────────────────────────────
    { slug: "english-fella",    name: "English Fella",                     nameTh: "อิงลิช เฟลลา",         city: "IT Park, Cebu City",   rating: 4.5, studentsCount: "200+", nationalityCount: "8+ ชาติ",  foundedYear: 2012, isFeatured: false, sortOrder: 10, tags: ["Semi-Sparta","ESL","Speaking","IT Park"],          accentClass: "from-blue-500 to-cyan-500",      tagline: "Semi-Sparta | IT Park | Speaking Focus",            taglineTh: "Semi-Sparta | IT Park | Speaking" },
    { slug: "cpi",              name: "Cebu Pelis Institute (CPI)",         nameTh: "ซีพีไอ เซบู",          city: "Cebu City",            rating: 4.4, studentsCount: "150+", nationalityCount: "6+ ชาติ",  foundedYear: 2007, isFeatured: false, sortOrder: 11, tags: ["ESL","Affordable","Cebu City"],                    accentClass: "from-gray-600 to-gray-500",      tagline: "สถาบันเก่าแก่ | ESL | Affordable | Cebu City",      taglineTh: "สถาบันเก่าแก่ | ค่าเรียนประหยัด" },
    { slug: "cella",            name: "CELLA English Academy",              nameTh: "เซลล่า อิงลิช",        city: "Cebu City",            rating: 4.5, studentsCount: "150+", nationalityCount: "7+ ชาติ",  foundedYear: 2010, isFeatured: false, sortOrder: 12, tags: ["ESL","IELTS","General English"],                   accentClass: "from-teal-500 to-green-500",     tagline: "General English | IELTS | Friendly Atmosphere",     taglineTh: "ESL ทั่วไป | IELTS | บรรยากาศเป็นกันเอง" },
    { slug: "cg-academy",       name: "CG Academy",                         nameTh: "ซีจี อคาเดมี",          city: "Cebu City",            rating: 4.4, studentsCount: "120+", nationalityCount: "6+ ชาติ",  foundedYear: 2008, isFeatured: false, sortOrder: 13, tags: ["Callan","ESL","General English"],                  accentClass: "from-indigo-500 to-blue-500",    tagline: "Callan & General English | ESL | Cebu City",        taglineTh: "Callan Method | ESL | เซบู" },
    { slug: "ims-academy",      name: "IMS Academy",                        nameTh: "ไอเอ็มเอส อคาเดมี",    city: "Cebu City",            rating: 4.5, studentsCount: "130+", nationalityCount: "7+ ชาติ",  foundedYear: 2011, isFeatured: false, sortOrder: 14, tags: ["Intensive","ESL","IELTS","Small Class"],           accentClass: "from-purple-500 to-indigo-500",  tagline: "Intensive ESL | IELTS | Small Class Size",          taglineTh: "เรียนเข้มข้น | ห้องเรียนเล็ก" },
    { slug: "glc-english",      name: "GLC English Academy",                nameTh: "จีแอลซี อิงลิช",       city: "Cebu City",            rating: 4.4, studentsCount: "100+", nationalityCount: "6+ ชาติ",  foundedYear: 2009, isFeatured: false, sortOrder: 15, tags: ["ESL","IELTS","General English"],                   accentClass: "from-green-500 to-teal-500",     tagline: "General English | IELTS | Cebu",                    taglineTh: "General English | IELTS | เซบู" },
    { slug: "ibreeze",          name: "I.BREEZE",                           nameTh: "ไอ.บรีซ",               city: "Mactan, Cebu City",   rating: 4.5, studentsCount: "120+", nationalityCount: "7+ ชาติ",  foundedYear: 2013, isFeatured: false, sortOrder: 16, tags: ["ESL","Semi-Sparta","Speaking"],                    accentClass: "from-cyan-500 to-sky-500",       tagline: "ESL | Semi-Sparta | Mactan Island",                 taglineTh: "ESL | Semi-Sparta | Mactan" },
    { slug: "winning-english",  name: "Winning English Academy",            nameTh: "วินนิ่ง อิงลิช",       city: "Cebu City",            rating: 4.5, studentsCount: "150+", nationalityCount: "8+ ชาติ",  foundedYear: 2014, isFeatured: false, sortOrder: 17, tags: ["ESL","IELTS","Winning Method"],                    accentClass: "from-yellow-500 to-orange-500",  tagline: "Winning Method | ESL | IELTS | Cebu",               taglineTh: "Winning Method | ESL | IELTS" },
    { slug: "genius-english",   name: "Genius English Professionals",       nameTh: "จีเนียส อิงลิช",       city: "Cebu City",            rating: 4.6, studentsCount: "300+", nationalityCount: "10+ ชาติ", foundedYear: 2009, isFeatured: false, sortOrder: 18, tags: ["Sparta","IELTS","ESL"],                            accentClass: "from-rose-500 to-red-500",       tagline: "Sparta | IELTS | ESL | Cebu City",                  taglineTh: "Sparta | IELTS | เซบู" },
    { slug: "3d-academy",       name: "3D Academy",                         nameTh: "ทรีดี อคาเดมี",         city: "Cebu City",            rating: 4.5, studentsCount: "200+", nationalityCount: "8+ ชาติ",  foundedYear: 2011, isFeatured: false, sortOrder: 19, tags: ["3D System","ESL","Business"],                      accentClass: "from-violet-500 to-purple-500",  tagline: "3D Learning System | ESL | Business | Cebu",        taglineTh: "3D System | ESL | Business" },
    { slug: "idea-english",     name: "IDEA English Academy",               nameTh: "ไอเดีย อิงลิช",        city: "Cebu City",            rating: 4.5, studentsCount: "150+", nationalityCount: "8+ ชาติ",  foundedYear: 2012, isFeatured: false, sortOrder: 20, tags: ["IDEA Method","IELTS","ESL"],                       accentClass: "from-amber-500 to-yellow-500",   tagline: "IDEA Method | IELTS | ESL | Cebu City",             taglineTh: "IDEA Method | IELTS | ESL" },
    { slug: "btes",             name: "BTES",                               nameTh: "บีทีอีเอส เซบู",        city: "Cebu City",            rating: 4.5, studentsCount: "200+", nationalityCount: "8+ ชาติ",  foundedYear: 2010, isFeatured: false, sortOrder: 21, tags: ["Sparta","IELTS","TOEIC"],                          accentClass: "from-red-500 to-pink-500",       tagline: "Sparta | IELTS | TOEIC | Cebu City",                taglineTh: "Sparta | IELTS | TOEIC | เซบู" },
    // ── Baguio Partners ────────────────────────────────────────────────────
    { slug: "pines",  name: "PINES International Academy",                  nameTh: "ไพนส์ อินเตอร์เนชั่นแนล", city: "Baguio City",       rating: 4.9, studentsCount: "700+", nationalityCount: "15+ ชาติ", foundedYear: 1994, isFeatured: true,  sortOrder: 22, tags: ["Sparta","Cool Weather","IELTS","Baguio"],          accentClass: "from-teal-700 to-emerald-700",   tagline: "Sparta เข้มข้น | อากาศเย็น 18–22°C | Baguio",      taglineTh: "Sparta เข้มข้น | อากาศเย็น | บาเกียว" },
    { slug: "bcebu",  name: "B'Cebu Language School (บาเกียว)",              nameTh: "บี เซบู แลงกวิจ สคูล (บาเกียว)", city: "Baguio City", rating: 4.6, studentsCount: "300+", nationalityCount: "10+ ชาติ", foundedYear: 2018, isFeatured: false, sortOrder: 23, tags: ["B'Sparta","Intensive","ESL","Baguio"],             accentClass: "from-blue-600 to-indigo-600",    tagline: "Intensive | B'Sparta | อากาศเย็น 18–22°C",          taglineTh: "เข้มข้น | B'Sparta | อากาศเย็น" },
    // ── Baguio Non-Partners ────────────────────────────────────────────────
    { slug: "beci",         name: "BECI Academy",                      nameTh: "เบซี อคาเดมี",            city: "Baguio City",  rating: 4.6, studentsCount: "300+", nationalityCount: "10+ ชาติ", foundedYear: 2007, isFeatured: false, sortOrder: 24, tags: ["Sparta","ESL","IELTS"],                    accentClass: "from-emerald-600 to-green-600",  tagline: "Sparta | ESL | IELTS | บาเกียว",              taglineTh: "Sparta | ESL | IELTS | บาเกียว" },
    { slug: "monol",        name: "MONOL International Education Center", nameTh: "โมนอล อินเตอร์เนชั่นแนล", city: "Baguio City",  rating: 4.7, studentsCount: "500+", nationalityCount: "15+ ชาติ", foundedYear: 2002, isFeatured: false, sortOrder: 25, tags: ["Sparta","IELTS","Big Campus","Korean Mgmt"], accentClass: "from-blue-700 to-blue-600",      tagline: "Sparta | สถาบันขนาดใหญ่ | IELTS | บาเกียว", taglineTh: "Sparta | วิทยาเขตใหญ่ | IELTS" },
    { slug: "help-english", name: "HELP English Academy",               nameTh: "เฮลป์ อิงลิช อคาเดมี",   city: "Baguio City",  rating: 4.5, studentsCount: "150+", nationalityCount: "7+ ชาติ",  foundedYear: 2010, isFeatured: false, sortOrder: 26, tags: ["Semi-Sparta","ESL","Affordable"],          accentClass: "from-sky-500 to-blue-500",       tagline: "Semi-Sparta | ESL | Affordable | บาเกียว",    taglineTh: "Semi-Sparta | ราคาประหยัด | บาเกียว" },
    { slug: "jic-academy",  name: "JIC Academy",                         nameTh: "เจไอซี อคาเดมี",          city: "Baguio City",  rating: 4.5, studentsCount: "150+", nationalityCount: "8+ ชาติ",  foundedYear: 2008, isFeatured: false, sortOrder: 27, tags: ["Japanese Mgmt","ESL","Business"],          accentClass: "from-red-500 to-orange-500",     tagline: "Japanese Management | ESL | Business | บาเกียว", taglineTh: "บริหารญี่ปุ่น | ESL | Business" },
    { slug: "aj-academy",   name: "A&J Academy",                         nameTh: "เอแอนด์เจ อคาเดมี",       city: "Baguio City",  rating: 4.4, studentsCount: "100+", nationalityCount: "6+ ชาติ",  foundedYear: 2013, isFeatured: false, sortOrder: 28, tags: ["ESL","Speaking","Affordable"],             accentClass: "from-pink-500 to-rose-500",      tagline: "ESL | Speaking Focus | อากาศเย็น | บาเกียว",  taglineTh: "ESL | Speaking | อากาศเย็น บาเกียว" },
    { slug: "wales-english",name: "WALES English Academy",               nameTh: "เวลส์ อิงลิช อคาเดมี",    city: "Baguio City",  rating: 4.5, studentsCount: "150+", nationalityCount: "7+ ชาติ",  foundedYear: 2011, isFeatured: false, sortOrder: 29, tags: ["Semi-Sparta","ESL","IELTS"],               accentClass: "from-teal-500 to-cyan-500",      tagline: "Semi-Sparta | ESL | IELTS | บาเกียว",         taglineTh: "Semi-Sparta | ESL | IELTS | บาเกียว" },
    { slug: "cns-academy",  name: "CNS Academy",                         nameTh: "ซีเอ็นเอส อคาเดมี",       city: "Baguio City",  rating: 4.5, studentsCount: "120+", nationalityCount: "6+ ชาติ",  foundedYear: 2009, isFeatured: false, sortOrder: 30, tags: ["Sparta","ESL","TOEIC"],                    accentClass: "from-orange-500 to-amber-500",   tagline: "Sparta | ESL | TOEIC | บาเกียว",              taglineTh: "Sparta | ESL | TOEIC | บาเกียว" },
    { slug: "cip-english",  name: "CIP English Academy",                 nameTh: "ซีไอพี อิงลิช อคาเดมี",   city: "Baguio City",  rating: 4.6, studentsCount: "200+", nationalityCount: "8+ ชาติ",  foundedYear: 2005, isFeatured: false, sortOrder: 31, tags: ["Comprehensive","IELTS","Business"],        accentClass: "from-indigo-600 to-violet-600",  tagline: "Comprehensive English | IELTS | Business | บาเกียว", taglineTh: "ครบครัน | IELTS | Business" },
    { slug: "eg-academy",   name: "EG Academy",                          nameTh: "อีจี อคาเดมี",             city: "Baguio City",  rating: 4.4, studentsCount: "100+", nationalityCount: "6+ ชาติ",  foundedYear: 2012, isFeatured: false, sortOrder: 32, tags: ["ESL","Sparta","Speaking"],                 accentClass: "from-gray-500 to-slate-500",     tagline: "ESL | Speaking | Sparta | บาเกียว",           taglineTh: "ESL | Speaking | Sparta | บาเกียว" },
    // ── Clark Non-Partners ─────────────────────────────────────────────────
    { slug: "hana-academy",  name: "HANA Academy",       nameTh: "ฮานะ อคาเดมี",              city: "Clark Freeport Zone",  rating: 4.5, studentsCount: "200+", nationalityCount: "8+ ชาติ",  foundedYear: 2010, isFeatured: false, sortOrder: 33, tags: ["ESL","Japanese Mgmt","Clark"],          accentClass: "from-pink-600 to-rose-600",      tagline: "ESL | Japanese Management | Clark Freeport",  taglineTh: "ESL | บริหารญี่ปุ่น | คลาร์ก" },
    { slug: "we-academy",    name: "WE Academy (Clark)", nameTh: "วี อคาเดมี (คลาร์ก)",        city: "Clark Freeport Zone",  rating: 4.4, studentsCount: "150+", nationalityCount: "7+ ชาติ",  foundedYear: 2015, isFeatured: false, sortOrder: 34, tags: ["ESL","Speaking","Clark"],               accentClass: "from-sky-500 to-blue-500",       tagline: "ESL | Speaking Focus | Clark Freeport Zone",   taglineTh: "ESL | Speaking | คลาร์ก" },
    { slug: "gs-academy",    name: "GS Academy (NELS)",  nameTh: "จีเอส อคาเดมี (เนลส์)",      city: "Clark, Pampanga",      rating: 4.4, studentsCount: "100+", nationalityCount: "6+ ชาติ",  foundedYear: 2012, isFeatured: false, sortOrder: 35, tags: ["ESL","General English","Clark"],         accentClass: "from-green-500 to-teal-500",     tagline: "General English | ESL | Clark, Pampanga",      taglineTh: "General English | ESL | คลาร์ก" },
    { slug: "mk-education",  name: "MK Education (Clark)", nameTh: "เอ็มเค เอดูเคชั่น (คลาร์ก)", city: "Clark, Angeles City", rating: 4.4, studentsCount: "150+", nationalityCount: "7+ ชาติ",  foundedYear: 2011, isFeatured: false, sortOrder: 36, tags: ["ESL","IELTS","Clark"],                  accentClass: "from-amber-500 to-orange-500",   tagline: "ESL | IELTS | Clark, Angeles City",            taglineTh: "ESL | IELTS | คลาร์ก" },
    // ── Manila Non-Partners ────────────────────────────────────────────────
    { slug: "e-room",   name: "E-Room Language Center",            nameTh: "อี-รูม แลงกวิจ เซ็นเตอร์",     city: "Manila",  rating: 4.4, studentsCount: "100+", nationalityCount: "6+ ชาติ",  foundedYear: 2015, isFeatured: false, sortOrder: 37, tags: ["ESL","Online","Business","Manila"],       accentClass: "from-blue-500 to-indigo-500",   tagline: "Online + Onsite | ESL | Manila",        taglineTh: "ออนไลน์ + ออนไซต์ | ESL | มะนิลา" },
    { slug: "lslc",     name: "LSLC Language Skills Institute",    nameTh: "แอลเอสแอลซี มะนิลา",            city: "Manila",  rating: 4.4, studentsCount: "150+", nationalityCount: "8+ ชาติ",  foundedYear: 2008, isFeatured: false, sortOrder: 38, tags: ["ESL","Professional","Business"],          accentClass: "from-teal-500 to-green-500",    tagline: "Professional ESL | Business | Manila",  taglineTh: "ESL วิชาชีพ | Business | มะนิลา" },
    { slug: "enderun",  name: "Enderun Language Center",           nameTh: "เอ็นเดอรัน แลงกวิจ เซ็นเตอร์",  city: "BGC, Manila", rating: 4.7, studentsCount: "200+", nationalityCount: "10+ ชาติ", foundedYear: 2007, isFeatured: false, sortOrder: 39, tags: ["Premium","BGC","Business","IELTS"],      accentClass: "from-purple-600 to-indigo-600", tagline: "Premium ESL | BGC Manila | Business",    taglineTh: "พรีเมียม | BGC | Business | มะนิลา" },
    { slug: "wesli",    name: "WESLI",                             nameTh: "เวสลี่ มะนิลา",                  city: "Manila",  rating: 4.4, studentsCount: "100+", nationalityCount: "6+ ชาติ",  foundedYear: 2010, isFeatured: false, sortOrder: 40, tags: ["ESL","Eastwood","Business"],              accentClass: "from-rose-500 to-pink-500",     tagline: "ESL | Eastwood Manila | Business",      taglineTh: "ESL | Eastwood | มะนิลา" },
    // ── Iloilo Partners ────────────────────────────────────────────────────
    { slug: "we-academy-iloilo",   name: "We Academy Iloilo",                                       nameTh: "วี อคาเดมี อิโลอิโล",          city: "Jaro, Iloilo City",       rating: 4.5, studentsCount: "300+", nationalityCount: "10+ ชาติ", foundedYear: 2010, isFeatured: false, sortOrder: 41, tags: ["IELTS Computer-Based","ESL","IELTS","Swimming Pool"],  accentClass: "from-sky-500 to-blue-600",       tagline: "ศูนย์สอบ IELTS Computer-Based | สระว่ายน้ำ | Jaro", taglineTh: "ศูนย์สอบ IELTS | สระว่ายน้ำ | อิโลอิโล" },
    { slug: "gitc-iloilo",         name: "GITC Iloilo (Green International Technological College)", nameTh: "จีไอทีซี อิโลอิโล",           city: "La Paz, Iloilo City",     rating: 4.5, studentsCount: "200+", nationalityCount: "8+ ชาติ",  foundedYear: 2005, isFeatured: false, sortOrder: 42, tags: ["ESL","IELTS","TOEIC","Quiet Atmosphere"],              accentClass: "from-teal-500 to-emerald-600",   tagline: "นิยมจากนักเรียนญี่ปุ่น–เกาหลี | ESL | La Paz",    taglineTh: "นิยมจากนักเรียนญี่ปุ่น–เกาหลี | ESL" },
    { slug: "mk-education-iloilo", name: "MK Education Iloilo",                                     nameTh: "เอ็มเค เอดูเคชั่น อิโลอิโล",   city: "Mandurriao, Iloilo City", rating: 4.4, studentsCount: "150+", nationalityCount: "6+ ชาติ",  foundedYear: 2012, isFeatured: false, sortOrder: 43, tags: ["Family Program","Business English","IELTS"],           accentClass: "from-amber-500 to-orange-500",   tagline: "Family Program | Business English | Mandurriao",    taglineTh: "Family Program | Business English" },
    { slug: "pia-iloilo",          name: "PIA (Polyglot International Academy) Iloilo",             nameTh: "พีไอเอ อิโลอิโล",             city: "Mandurriao, Iloilo City", rating: 4.5, studentsCount: "150+", nationalityCount: "8+ ชาติ",  foundedYear: 2018, isFeatured: false, sortOrder: 44, tags: ["Modern","Small Class","ESL","Speaking"],               accentClass: "from-purple-500 to-violet-600",  tagline: "โรงเรียนรุ่นใหม่ | ห้องเรียนเล็ก | Mandurriao",   taglineTh: "รุ่นใหม่ | ห้องเรียนเล็ก | อิโลอิโล" },
    { slug: "columbus-english",    name: "Columbus English Academy",                                nameTh: "โคลัมบัส อิงลิช อคาเดมี",     city: "Jaro, Iloilo City",       rating: 4.4, studentsCount: "80+",  nationalityCount: "5+ ชาติ",  foundedYear: 2014, isFeatured: false, sortOrder: 45, tags: ["Small School","ESL","Family Atmosphere"],              accentClass: "from-rose-500 to-pink-500",      tagline: "โรงเรียนขนาดเล็ก | ดูแลแบบครอบครัว | Jaro",       taglineTh: "โรงเรียนเล็ก | ครอบครัว | อิโลอิโล" },
  ];

  for (const school of schools) {
    await db.insert(schoolsTable).values({ ...school, country: "Philippines" }).onConflictDoNothing();
  }
  console.log(`✅ ${schools.length} schools seeded (onConflictDoNothing — existing rows preserved)`);

  // ─── Courses ─────────────────────────────────────────────────
  const courses = [
    { slug: "general-english", title: "General English (ESL)", titleTh: "ภาษาอังกฤษทั่วไป", duration: "4-24 สัปดาห์", priceDisplay: "เริ่มต้น 35,000 บาท/เดือน", colorClass: "bg-blue-100 text-blue-600", iconName: "BookOpen", isActive: true, sortOrder: 1 },
    { slug: "ielts-preparation", title: "IELTS Preparation", titleTh: "เตรียมสอบ IELTS", duration: "8-12 สัปดาห์", priceDisplay: "เริ่มต้น 42,000 บาท/เดือน", colorClass: "bg-red-100 text-red-600", iconName: "GraduationCap", isActive: true, sortOrder: 2 },
    { slug: "toeic-preparation", title: "TOEIC Preparation", titleTh: "เตรียมสอบ TOEIC", duration: "4-12 สัปดาห์", priceDisplay: "เริ่มต้น 38,000 บาท/เดือน", colorClass: "bg-orange-100 text-orange-600", iconName: "GraduationCap", isActive: true, sortOrder: 3 },
    { slug: "business-english", title: "Business English", titleTh: "ภาษาอังกฤษเพื่อธุรกิจ", duration: "4-8 สัปดาห์", priceDisplay: "เริ่มต้น 45,000 บาท/เดือน", colorClass: "bg-purple-100 text-purple-600", iconName: "Briefcase", isActive: true, sortOrder: 4 },
    { slug: "junior-camp", title: "Junior Camp", titleTh: "แคมป์เยาวชน (ปิดเทอม)", duration: "3-4 สัปดาห์", priceDisplay: "เริ่มต้น 65,000 บาท/โปรแกรม", colorClass: "bg-green-100 text-green-600", iconName: "Baby", isActive: true, sortOrder: 5 },
    { slug: "family-program", title: "Family Program", titleTh: "หลักสูตรครอบครัว", duration: "4-12 สัปดาห์", priceDisplay: "เริ่มต้น 80,000 บาท/ครอบครัว/เดือน", colorClass: "bg-pink-100 text-pink-600", iconName: "Users", isActive: true, sortOrder: 6 },
    { slug: "online-english", title: "Online English", titleTh: "เรียนภาษาออนไลน์", duration: "ตามต้องการ", priceDisplay: "เริ่มต้น 250 บาท/คลาส", colorClass: "bg-sky-100 text-sky-600", iconName: "Monitor", isActive: true, sortOrder: 7 },
    { slug: "university-pathway", title: "University Pathway", titleTh: "เรียนต่อมหาวิทยาลัย", duration: "12-24 สัปดาห์", priceDisplay: "เริ่มต้น 45,000 บาท/เดือน", colorClass: "bg-yellow-100 text-yellow-600", iconName: "Map", isActive: true, sortOrder: 8 },
    { slug: "ielts-guarantee", title: "IELTS Score Guarantee", titleTh: "IELTS Guarantee", duration: "12-24 สัปดาห์", priceDisplay: "เริ่มต้น 95,000 บาท", colorClass: "bg-emerald-100 text-emerald-700", iconName: "Shield", badge: "การันตีคะแนน!", isActive: true, sortOrder: 9 },
    { slug: "online-business-english", title: "Online Business English", titleTh: "Online Business English", duration: "4-12 สัปดาห์ (ออนไลน์)", priceDisplay: "เริ่มต้น 350 บาท/คลาส", colorClass: "bg-violet-100 text-violet-700", iconName: "Laptop", isActive: true, sortOrder: 10 },
    { slug: "callan-method", title: "Callan Intensive Speaking", titleTh: "Callan Method", duration: "4-16 สัปดาห์", priceDisplay: "เริ่มต้น 32,000 บาท/เดือน", colorClass: "bg-cyan-100 text-cyan-700", iconName: "Globe2", isActive: true, sortOrder: 11 },
    { slug: "sparta-intensive", title: "Intensive Sparta Program", titleTh: "Intensive Sparta", duration: "4-24 สัปดาห์", priceDisplay: "เริ่มต้น 38,000 บาท/เดือน", colorClass: "bg-red-100 text-red-700", iconName: "Clock", isActive: true, sortOrder: 12 },
  ];

  for (const course of courses) {
    await db.insert(coursesTable).values(course).onConflictDoNothing();
  }
  console.log(`✅ ${courses.length} courses seeded`);

  // ─── FAQs ─────────────────────────────────────────────────────
  const faqs = [
    { question: "Do I need visa to study in Philippines?", questionTh: "ต้องทำวีซ่าเพื่อไปเรียนที่ฟิลิปปินส์ไหม?", answer: "Thai citizens can enter Philippines visa-free for up to 30 days. For longer stays, we help arrange a Student Visa (SSP).", answerTh: "คนไทยไม่ต้องทำวีซ่าเพื่อเข้าฟิลิปปินส์ได้นานถึง 30 วัน หากเรียนนานกว่านั้น Philingo จะช่วยจัดการ Student Visa (SSP) ให้", category: "วีซ่า", sortOrder: 1 },
    { question: "What is the cost of living in Philippines?", questionTh: "ค่าครองชีพที่ฟิลิปปินส์เป็นอย่างไร?", answer: "Living costs are lower than Thailand. Food, transportation, and entertainment are affordable.", answerTh: "ค่าครองชีพที่ฟิลิปปินส์โดยรวมถูกกว่าไทย ค่าอาหาร ค่าเดินทาง และค่าบันเทิงราคาย่อมเยา", category: "ทั่วไป", sortOrder: 2 },
    { question: "Is Philippines safe for Thai students?", questionTh: "ฟิลิปปินส์ปลอดภัยสำหรับนักเรียนไทยไหม?", answer: "Yes, major study destinations like Cebu and Baguio are safe tourist cities with many Thai students.", answerTh: "ปลอดภัยครับ เมืองเซบูและบาเกียวที่นักเรียนไทยนิยมไปเรียนเป็นเมืองท่องเที่ยวที่ปลอดภัยและมีนักเรียนไทยจำนวนมาก", category: "ความปลอดภัย", sortOrder: 3 },
    { question: "How long should I study?", questionTh: "ควรเรียนนานเท่าไหร่?", answer: "4-8 weeks for basic improvement, 12+ weeks for significant IELTS/TOEIC score gains. We recommend 3 months minimum.", answerTh: "หากต้องการพัฒนาพื้นฐาน 4-8 สัปดาห์ก็เพียงพอ แต่ถ้าต้องการคะแนน IELTS/TOEIC ที่ชัดเจน แนะนำ 12 สัปดาห์ขึ้นไป", category: "หลักสูตร", sortOrder: 4 },
    { question: "What is included in the package price?", questionTh: "ราคาแพ็กเกจรวมอะไรบ้าง?", answer: "Packages typically include: tuition, dormitory, 3 meals/day, airport transfer, and orientation.", answerTh: "แพ็กเกจโดยทั่วไปรวม: ค่าเรียน ที่พัก อาหาร 3 มื้อ รถรับส่งสนามบิน และปฐมนิเทศ", category: "ราคา", sortOrder: 5 },
    { question: "Can I work part-time while studying?", questionTh: "เรียนไปทำงาน Part-time ได้ไหม?", answer: "No, student visa does not allow part-time work in Philippines.", answerTh: "ไม่ได้ครับ วีซ่านักเรียนไม่อนุญาตให้ทำงาน Part-time ที่ฟิลิปปินส์", category: "ทั่วไป", sortOrder: 6 },
    { question: "How do I apply?", questionTh: "สมัครเรียนอย่างไร?", answer: "Contact Philingo via LINE or fill the Apply form on our website. We'll guide you through the entire process.", answerTh: "ติดต่อ Philingo ผ่าน LINE หรือกรอกแบบฟอร์มสมัครบนเว็บไซต์ เราจะดูแลทุกขั้นตอนให้ครบ", category: "การสมัคร", sortOrder: 7 },
    { question: "Do you help with accommodation?", questionTh: "ช่วยเรื่องที่พักด้วยไหม?", answer: "Yes, all partner schools have on-campus dormitories. We also assist with off-campus options.", answerTh: "ใช่ครับ โรงเรียนพาร์ทเนอร์ทุกแห่งมีหอพักในโรงเรียน เราช่วยจัดการที่พักนอกโรงเรียนได้เช่นกัน", category: "ที่พัก", sortOrder: 8 },
  ];

  for (const faq of faqs) {
    await db.insert(faqsTable).values(faq).onConflictDoNothing();
  }
  console.log(`✅ ${faqs.length} FAQs seeded`);

  // ─── Testimonials ─────────────────────────────────────────────
  const testimonials = [
    { name: "สมหญิง ใจดี", school: "PINES International Academy", program: "Sparta IELTS", scoreBefore: "4.5", scoreAfter: "6.5", content: "เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!", contentTh: "เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!", initials: "สจ", rating: 5, isFeatured: true, sortOrder: 1 },
    { name: "วีรชัย นพรัตน์", school: "QQ English", program: "Callan General English", content: "Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน", contentTh: "Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน", initials: "วน", rating: 5, isFeatured: true, sortOrder: 2 },
    { name: "ปณิตา เรืองเดช", school: "CIA Cebu International Academy", program: "Semi-Sparta TOEIC", scoreBefore: "500", scoreAfter: "785", content: "Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก", contentTh: "Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก", initials: "ปร", rating: 5, isFeatured: true, sortOrder: 3 },
    { name: "กิตติพงษ์ สุขสวัสดิ์", school: "SMEAG Global School", program: "Classic English", content: "เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ", contentTh: "เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ", initials: "กส", rating: 5, sortOrder: 4 },
    { name: "นภัสสร จันทร์สว่าง", school: "Philinter Academy", program: "Business English", content: "Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน", contentTh: "Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน", initials: "นจ", rating: 4, sortOrder: 5 },
    { name: "ธีระ วงษ์สุวรรณ", school: "EV Academy", program: "IELTS Preparation", content: "EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ", contentTh: "EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ", initials: "ธว", rating: 5, sortOrder: 6 },
  ];

  for (const t of testimonials) {
    await db.insert(testimonialsTable).values(t).onConflictDoNothing();
  }
  console.log(`✅ ${testimonials.length} testimonials seeded`);

  // ─── Banners ─────────────────────────────────────────────────
  const { bannersTable } = await import('@workspace/db');
  const existingBanners = await db.select().from(bannersTable).limit(1);
  if (!existingBanners.length) {
    await db.insert(bannersTable).values([
      {
        titleTh: 'งาน Cebu Education Fair 2026',
        title: 'Cebu Education Fair 2026',
        subtitleTh: 'พบกับตัวแทน 10+ โรงเรียนชั้นนำ ปรึกษาฟรี ไม่มีค่าใช้จ่าย',
        subtitle: 'Meet 10+ top schools. Free consultation, no cost.',
        ctaTextTh: 'ลงทะเบียนฟรี',
        ctaText: 'Register Free',
        ctaUrl: '/seminars',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=450&fit=crop',
        isActive: true, sortOrder: 1,
      },
      {
        titleTh: 'เรียนภาษาอังกฤษที่ฟิลิปปินส์',
        title: 'Study English in the Philippines',
        subtitleTh: 'ราคาคุ้มกว่าไทย · ครูเจ้าของภาษา · 44 สถาบันให้เลือก',
        subtitle: 'Better value than Thailand · Native teachers · 44 schools to choose',
        ctaTextTh: 'เลือกโรงเรียน',
        ctaText: 'Choose a School',
        ctaUrl: '/schools',
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=450&fit=crop',
        isActive: true, sortOrder: 2,
      },
    ]);
    console.log('✅ 2 banners seeded');
  } else {
    console.log('ℹ️ Banners already exist, skipping.');
  }

  // ─── Partners ────────────────────────────────────────────────
  const partners = [
    { name: "CIA (Cebu International Academy)", websiteUrl: "https://www.cia-school.com", type: "school", isActive: true, sortOrder: 1 },
    { name: "QQ English", websiteUrl: "https://www.qq-english.com", type: "school", isActive: true, sortOrder: 2 },
    { name: "Philinter Academy", websiteUrl: "https://www.philinter.com", type: "school", isActive: true, sortOrder: 3 },
    { name: "CPILS", websiteUrl: "https://www.cpils.com", type: "school", isActive: true, sortOrder: 4 },
    { name: "EV Academy", websiteUrl: "https://www.evacademy.com", type: "school", isActive: true, sortOrder: 5 },
    { name: "PINES International Academy", websiteUrl: "https://www.pinesinternational.com", type: "school", isActive: true, sortOrder: 6 },
    { name: "SMEAG Global School", websiteUrl: "https://www.smeag.com", type: "school", isActive: true, sortOrder: 7 },
    { name: "B'Cebu Language School", websiteUrl: "https://www.bcebu.com", type: "school", isActive: true, sortOrder: 8 },
    { name: "CG Education Center", websiteUrl: "https://www.cgeducation.com", type: "school", isActive: true, sortOrder: 9 },
    { name: "ACEC", websiteUrl: "https://www.acec-english.com", type: "school", isActive: true, sortOrder: 10 },
    { name: "OIA Baguio", type: "school", isActive: true, sortOrder: 11 },
    { name: "We Academy Iloilo", type: "school", isActive: true, sortOrder: 12 },
    { name: "GITC Cebu", type: "school", isActive: true, sortOrder: 13 },
  ];
  for (const p of partners) {
    await db.insert(partnersTable).values(p).onConflictDoNothing();
  }
  console.log(`✅ ${partners.length} partners seeded`);

  // ─── Promotions ───────────────────────────────────────────────
  const now = new Date();
  const promotions = [
    {
      title: "Early Bird Cebu Summer Package",
      titleTh: "โปรแกรมเซบูซัมเมอร์ Early Bird",
      description: "Book 12 weeks ESL + accommodation at CIA or QQ English before the deadline and get exclusive discounts",
      descriptionTh: "จองล่วงหน้า 12 สัปดาห์ ESL + ที่พัก ที่ CIA หรือ QQ English รับส่วนลดพิเศษ",
      discountText: "Save ฿15,000",
      discountTextTh: "ประหยัด ฿15,000",
      originalPriceTh: "฿135,000",
      discountPriceTh: "฿120,000",
      bonusTh: "ฟรีค่าสมัคร + กระเป๋าเป้ Philingo",
      seatsRemaining: 8,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      expiresAt: new Date(now.getFullYear(), now.getMonth() + 2, 28),
    },
    {
      title: "IELTS Guarantee Package — PINES Baguio",
      titleTh: "แพ็คเกจ IELTS รับประกันผล — PINES บาเกียว",
      description: "Study IELTS at PINES International Academy, Baguio. Score guarantee or free extra weeks",
      descriptionTh: "เรียน IELTS ที่ PINES International Academy เมืองบาเกียว รับประกันคะแนน หรือเรียนฟรีเพิ่ม",
      discountText: "Score Guarantee",
      discountTextTh: "รับประกันคะแนน",
      originalPriceTh: "฿160,000",
      discountPriceTh: "฿149,000",
      bonusTh: "รับประกันคะแนน IELTS 6.0+ หรือเรียนต่อฟรี 4 สัปดาห์",
      seatsRemaining: 5,
      isFeatured: true,
      isActive: true,
      sortOrder: 2,
      expiresAt: new Date(now.getFullYear(), now.getMonth() + 3, 31),
    },
    {
      title: "Iloilo Intro Package — New Destination",
      titleTh: "โปรแกรม Iloilo แนะนำ — จุดหมายใหม่",
      description: "First-time Iloilo students get special introductory rates at We Academy or GITC Iloilo",
      descriptionTh: "นักเรียนใหม่ที่เลือก Iloilo รับราคาพิเศษที่ We Academy หรือ GITC Iloilo",
      discountText: "฿8,000 off",
      discountTextTh: "ลด ฿8,000",
      originalPriceTh: "฿95,000",
      discountPriceTh: "฿87,000",
      bonusTh: "ฟรีค่าสมัคร + บริการรับส่งสนามบิน",
      seatsRemaining: 10,
      isFeatured: false,
      isActive: true,
      sortOrder: 3,
      expiresAt: new Date(now.getFullYear(), now.getMonth() + 4, 30),
    },
  ];
  for (const p of promotions) {
    await db.insert(promotionsTable).values(p).onConflictDoNothing();
  }
  console.log(`✅ ${promotions.length} promotions seeded`);

  console.log("\n🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
