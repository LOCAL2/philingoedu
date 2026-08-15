# Philingo — Full Project Audit
**Date:** 2026-07-31  
**Mode:** READ-ONLY — Zero code changes made  
**Purpose:** Stability recovery — identify root causes before any fix

---

## CRITICAL FINDINGS (Read First)

| # | Severity | Issue | Affected Area |
|---|----------|-------|---------------|
| ⚠️ C-1 | 🔴 HIGH | Admin panel has `<html lang="en">` but contains Thai content | Microsoft Edge Read Aloud breaks on ALL Thai text in admin |
| ⚠️ C-2 | 🔴 HIGH | Admin panel loads ONLY `Inter` font — NO Thai fonts (Prompt/Sarabun) loaded | Thai text in admin renders with OS system font only |
| ⚠️ C-3 | 🟡 MED | Admin CSS has zero Thai font fallback chain | Thai display inconsistent across OS/browsers in admin |
| ⚠️ C-4 | 🟡 MED | Bilingual system uses TWO different approaches mixed across pages | Fixing one breaks the other; no single source of truth |
| ⚠️ C-5 | 🟢 LOW | `t()` translation function only covers: nav, common, home, footer | Most page content bypasses the i18n system entirely |

---

## 1. Framework & Build System

| Artifact | Framework | Build Tool | Entry Point | Base Path |
|----------|-----------|------------|-------------|-----------|
| `artifacts/philingo` | React 18 | Vite 6 | `src/main.tsx` | `/` |
| `artifacts/admin` | React 18 | Vite 6 | `src/main.tsx` | `/admin/` |
| `artifacts/api-server` | Express 5 | esbuild (via tsx) | `src/app.ts` | `/api/` |

**NOT Next.js. NOT Remix. NOT SSR.** — Pure client-side SPA for both frontends.

**Implication for SEO:** All HTML is rendered by JavaScript in the browser. Search engines and social crawlers must execute JS to see content. `index.html` contains static meta tags and JSON-LD to compensate.

---

## 2. TypeScript Configuration

### Base (`tsconfig.base.json`) — applies to all artifacts
```json
{
  "target": "es2022",
  "module": "esnext",
  "moduleResolution": "bundler",
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictBindCallApply": true,
  "alwaysStrict": true,
  "noImplicitReturns": true,
  "useUnknownInCatchVariables": true,
  "skipLibCheck": true
}
```

### Per-artifact overrides
| Artifact | Key Overrides |
|----------|---------------|
| philingo | `noEmit: true`, `jsx: preserve`, `paths: {"@/*": ["./src/*"]}` |
| admin | same as philingo |
| api-server | `outDir: dist`, `rootDir: src`, incremental build |

**Status:** TypeScript configuration is sound. `strictFunctionTypes: false` is intentional (relaxed). No issues found.

---

## 3. Package Dependencies

### Frontend (philingo & admin — shared catalog)
| Category | Packages | Version |
|----------|---------|---------|
| Core | react, react-dom | catalog (18.x) |
| Build | vite, @vitejs/plugin-react, @tailwindcss/vite | catalog |
| Routing | wouter | catalog |
| Data fetching | @tanstack/react-query | catalog (v5) |
| Forms | react-hook-form, @hookform/resolvers, zod | catalog |
| UI primitives | 20+ @radix-ui/* packages | various |
| Animation | framer-motion | catalog |
| Icons | lucide-react, react-icons | catalog |
| Charts | recharts | ^2.15.2 |
| Carousel | embla-carousel-react | ^8.6.0 |
| Date | date-fns | ^3.6.0 |
| Theme | next-themes | ^0.4.6 |
| Notifications | sonner | ^2.0.7 |

### Backend (api-server)
| Category | Packages | Version |
|----------|---------|---------|
| Server | express | ^5.2.1 |
| ORM | drizzle-orm | catalog |
| Database driver | pg (node-postgres) | catalog |
| Auth | jsonwebtoken, bcryptjs | latest |
| Email | resend, nodemailer | latest |
| File storage | @google-cloud/storage | ^7.21.0 |
| Excel parsing | xlsx | ^0.18.5 |
| PDF parsing | pdf-parse | ^2.4.5 |
| Logging | pino, pino-http, pino-pretty | latest |
| Security | helmet, express-rate-limit, cors | latest |
| Validation | zod | catalog |

**No missing dependencies detected.** All packages resolved in `node_modules`.

---

## 4. Routing Structure

### Public Website (`artifacts/philingo`)
Router: **Wouter** with `base={import.meta.env.BASE_URL}`

| Route | Component | Dynamic |
|-------|-----------|---------|
| `/` | `Home.tsx` | No |
| `/about` | `About.tsx` | No |
| `/why-philippines` | `WhyPhilippines.tsx` | No |
| `/courses` | `Courses.tsx` | No |
| `/schools` | `Schools.tsx` | No |
| `/schools/city/:city` | `CityPage.tsx` | Yes — `:city` param |
| `/schools/:slug` | `SchoolDetail.tsx` | Yes — `:slug` param |
| `/promotions` | `Promotions.tsx` | No |
| `/seminars` | `Seminars.tsx` | No |
| `/activities` | `Activities.tsx` | No |
| `/reviews` | `Reviews.tsx` | No |
| `/blog` | `Blog.tsx` | No |
| `/faq` | `FAQ.tsx` | No |
| `/contact` | `Contact.tsx` | No |
| `/services` | `Services.tsx` | No |
| `/posts/:id` | `PostDetail.tsx` | Yes — `:id` param |
| `/register` | `Register.tsx` | No |
| `/thank-you` | `ThankYou.tsx` | No |
| `*` | `not-found.tsx` | Catch-all |

### Admin Panel (`artifacts/admin`)
Router: **Wouter** with `base={import.meta.env.BASE_URL}`  
Auth guard: `ProtectedRoute` → redirects to `/` (Login) if no JWT

| Route | Component |
|-------|-----------|
| `/` | LoginPage → redirects to /dashboard if auth |
| `/dashboard` | Dashboard |
| `/schools` | Schools |
| `/courses` | Courses |
| `/blog` | Blog |
| `/reviews` | Reviews |
| `/banners` | Banners |
| `/gallery` | Gallery |
| `/promotions` | Promotions |
| `/events` | Events |
| `/faqs` | FAQs |
| `/forms` | Forms |
| `/contacts` | Contacts |
| `/newsletter` | Newsletter |
| `/partners` | Partners |
| `/team` | Team |
| `/testimonials` | Testimonials |
| `/settings` | Settings |

---

## 5. Component Structure

### Public Website
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx         # Top nav + language switcher
│   │   ├── Footer.tsx         # Footer with links + contact
│   │   ├── MobileNav.tsx      # Mobile bottom navigation
│   │   └── FloatingButtons.tsx # LINE / Messenger floating CTAs
│   ├── ui/                    # Radix UI wrappers (40+ files)
│   ├── PriceCalculator.tsx    # School pricing widget
│   ├── QuotationModal.tsx     # Quotation form modal
│   ├── PromoCardGrid.tsx      # Promotion card
│   └── SchoolCard.tsx         # School listing card
├── pages/                     # 19 page files (see routing above)
├── hooks/
│   ├── use-language.ts        # Language context hook
│   ├── use-countdown.ts       # Countdown timer (seminars)
│   └── use-mobile.tsx         # Mobile breakpoint detection
├── lib/
│   ├── language-context.tsx   # i18n system (CRITICAL — see §7)
│   ├── api.ts                 # API client with typed fetchers
│   └── queryClient.ts         # TanStack Query client config
└── data/
    ├── content.ts             # Translation strings (116 lines)
    ├── posts.ts               # Static blog post data (fallback)
    ├── schoolsCebu2.ts        # Static Cebu school data
    ├── schoolsBaguio2.ts      # Static Baguio school data
    ├── schoolsMeta.ts         # School metadata
    └── schoolsOther.ts        # Other school data
```

### Admin Panel
```
src/
├── components/
│   ├── ui/                    # Custom admin UI components
│   │   ├── Table.tsx          # Paginated, sortable table
│   │   ├── AdminLayout.tsx    # Sidebar + main layout
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Modal.tsx          # Dialog wrapper
│   │   ├── ImageUpload.tsx    # Single image upload
│   │   ├── MultiImageUpload.tsx # Bulk image upload
│   │   ├── Toast.tsx          # Notification toasts
│   │   └── ...
│   └── TimetableEditor.tsx    # Complex schedule editor (Courses page)
├── pages/                     # 18 page files
├── hooks/
│   └── use-crud.ts            # Generic CRUD operations hook
└── lib/
    ├── api.ts                 # API client (Bearer JWT)
    └── auth-context.tsx       # JWT auth context
```

---

## 6. Translation / i18n System

### System Type: Custom React Context (NOT react-i18next, NOT next-intl)
**File:** `artifacts/philingo/src/lib/language-context.tsx`

### How It Works
```
1. LanguageProvider wraps entire app (App.tsx)
2. Language stored in localStorage ('philingo_lang') 
3. Default: 'th' (Thai) — falls back gracefully on Safari private mode
4. Switching: setLanguage() → updates state + localStorage + document.lang
5. t(key) function: looks up key in content.ts[language]
6. content.ts: 116-line object with th:{} and en:{} keys
```

### What the t() System Covers (SMALL subset)
```
content.ts covers:
  - nav.*          (navigation labels)
  - common.*       (buttons: submit, apply now, etc.)
  - home.*         (hero title, section headers)
  - footer.*       (footer text, copyright)
```

### ⚠️ What the t() System Does NOT Cover
**Most page content is bilingual through a different approach:**
- All DB records have `title` (EN) + `titleTh` (TH) fields
- Pages directly choose: `language === 'th' ? school.nameTh : school.name`
- This means bilingual stability depends on DB records having both fields filled
- Pages using this pattern: Schools, SchoolDetail, Courses, Blog, Promotions, Events, FAQs, Testimonials, Gallery, Partners, Team

### Two-System Summary
| System | Used For | Stability |
|--------|---------|-----------|
| `t(key)` from content.ts | UI chrome (nav, buttons, headers) | Stable — static file |
| `item.titleTh` / `item.title` inline | All DB-driven content | Depends on DB data quality |

### Language Switching Flow
```
User clicks EN/TH toggle
→ setLanguage('en' or 'th')
→ localStorage.setItem('philingo_lang', lang)
→ document.documentElement.lang = lang   ← CSS [lang=th] selector activates
→ React re-renders all components that read language/t()
→ DB-driven bilingual components re-select correct field
```

---

## 7. Font Configuration

### Public Website (philingo) — ✅ CORRECT

**index.html (static, loads immediately):**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800
  &family=Prompt:wght@400;500;600;700;800
  &family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**index.css (CSS variables + fallback chain):**
```css
/* When lang=th (default), uses Thai-optimized chain */
[lang="th"] .app, html[lang="th"] {
  --app-font-sans: 'Prompt', 'Sarabun', 'Leelawadee UI', 'Leelawadee', 'Tahoma', 'Arial Unicode MS', sans-serif;
}
/* When lang=en, uses English-optimized chain */
[lang="en"] .app, html[lang="en"] {
  --app-font-sans: 'Inter', 'Prompt', 'Sarabun', 'Leelawadee UI', sans-serif;
}
```

**Fallback chain explanation:**
- `Prompt` / `Sarabun` → Google Fonts (loaded from network)
- `Leelawadee UI` → Windows 10/11 built-in Thai font (Edge, IE11)
- `Leelawadee` → Older Windows Thai font
- `Tahoma` → Has Thai glyphs, widely available
- `Arial Unicode MS` → Mac fallback with Thai
- `sans-serif` → OS default

**Assessment: ✅ Robust. Works even when Google Fonts fails.**

---

### 🔴 Admin Panel (admin) — BROKEN

**index.html:**
```html
<html lang="en">   ← WRONG — contains Thai content
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<!-- NO Prompt, NO Sarabun loaded -->
```

**index.css (admin):**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
/* Only Inter. No Thai font import. No fallback chain. */
```

**Result:**
1. `lang="en"` → Microsoft Edge Read Aloud treats ALL text as English → mispronounces Thai
2. No Prompt/Sarabun → Thai text renders with Windows "Tahoma" or "Leelawadee" (system default) — spacing/weight inconsistent
3. No Leelawadee UI in font-family → Microsoft Edge may select wrong Thai font automatically

---

## 8. Encoding Settings

| Item | Philingo | Admin | API Server | Status |
|------|---------|-------|-----------|--------|
| `<meta charset="UTF-8">` | ✅ Present | ✅ Present | N/A | OK |
| `<html lang="">` | ✅ `lang="th"` | ❌ `lang="en"` | N/A | Admin broken |
| `<meta name="language">` | ✅ `content="Thai"` | ❌ Missing | N/A | Admin missing |
| Database charset | PostgreSQL UTF-8 (Replit managed) | — | ✅ | OK |
| Express response | Default UTF-8 JSON | — | ✅ | OK |
| Email (Resend) | UTF-8 HTML via Resend API | — | ✅ | OK |
| File uploads | Object Storage binary safe | — | ✅ | OK |

**No UTF-8 corruption issues found in data layer.** Issues are presentation-layer only (font selection, lang attribute).

---

## 9. Database Connection

**Driver:** `node-postgres` (pg)  
**ORM:** Drizzle ORM  
**Config:** `lib/db/src/index.ts`

```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

**Connection:** Pool-based, single `DATABASE_URL` env var  
**Error handling:** Throws at startup if `DATABASE_URL` missing  
**Status:** ✅ Working — all API endpoints confirmed live

### Schema Location
`lib/db/src/schema/` — 16 files, 21 tables

**Full table list:**
`admin_users`, `banners`, `blog_posts`, `contact_submissions`, `form_submissions`, `seminar_registrations`, `newsletter_subscribers`, `newsletter_campaigns`, `courses`, `event_registrations`, `events`, `faqs`, `gallery_items`, `partners`, `promotions`, `schools`, `site_settings`, `team_members`, `testimonials`

---

## 10. API Routes

**Base:** `http://[host]/api`  
**Auth:** JWT Bearer token (httpOnly cookie OR Authorization header)  
**Rate limiting:** `express-rate-limit` applied globally  
**Security:** `helmet` headers, CORS configured

### Route Files → Mount Points
| File | Mount | Auth Required |
|------|-------|--------------|
| `auth.ts` | `/api/auth` | POST /login public; rest protected |
| `schools.ts` | `/api/schools` | GET public; POST/PATCH/DELETE admin |
| `courses.ts` | `/api/courses` | GET public; POST/PATCH/DELETE admin |
| `blog.ts` | `/api/blog` | GET public; POST/PATCH/DELETE admin |
| `banners.ts` | `/api/banners` | GET public; POST/PATCH/DELETE admin |
| `promotions.ts` | `/api/promotions` | GET public; POST/PATCH/DELETE admin |
| `faqs.ts` | `/api/faqs` | GET public; POST/PATCH/DELETE admin |
| `gallery.ts` | `/api/gallery` | GET public; POST/PATCH/DELETE admin |
| `partners.ts` | `/api/partners` | GET public; POST/PATCH/DELETE admin |
| `testimonials.ts` | `/api/testimonials` | GET public; POST/PATCH/DELETE admin |
| `team.ts` | `/api/team` | GET public; POST/PATCH/DELETE admin |
| `events.ts` | `/api/events` | GET public; POST/PATCH/DELETE admin |
| `event-registrations.ts` | `/api/events/:id` | GET registrations admin; POST public |
| `forms.ts` | `/api/forms` | POST /submit /seminar public; GET admin |
| `contacts.ts` | `/api/contacts` | POST /contact public; GET admin |
| `settings.ts` | `/api/settings` | GET public; PUT admin |
| `newsletter.ts` | `/api/newsletter` | All admin |
| `dashboard.ts` | `/api/dashboard` | All admin |
| `analytics.ts` | `/api/analytics` | POST track public; GET summary public |
| `admin-users.ts` | `/api/admin-users` | All admin |
| `upload.ts` | `/api/uploads` | POST/DELETE admin |
| `storage.ts` | `/api/storage` | Signed URL admin; public files public |
| `health.ts` | `/api/healthz` | Public |
| `sitemap.ts` | (custom handler) | Public — see §13 |
| `parse-price.ts` | `/api/schools/:id/parse-price` | Admin |
| `parse-promo.ts` | `/api/schools/:id/parse-promo` | Admin |
| `scrape-images.ts` | `/api/schools/:id/scrape-images` | Admin |
| `batch-scrape.ts` | `/api/admin/batch-scrape-banners` | Admin |

---

## 11. Authentication

**Type:** JWT (HS256)  
**Secret:** `JWT_SECRET` env var (96-char hex, set via Replit Secrets)  
**Storage:** httpOnly cookie + Authorization Bearer header (both supported)  
**Session:** Stateless — no session table; tokens expire per `jsonwebtoken` config  
**Roles:** `superadmin`, `admin`, `editor` (enum in DB)  
**Admin accounts:** Seeded via `artifacts/api-server/src/seed.ts`

**Default admin:** `admin@philingo.com` / `Admin@2024!`

**Status:** ✅ Working — login confirmed in regression tests

---

## 12. SEO Configuration

### Public Website
| Element | Status | Details |
|---------|--------|---------|
| `<title>` | ✅ | Thai + English in title |
| `<meta description>` | ✅ | Thai description |
| `<meta keywords>` | ✅ | Thai + English keywords |
| Open Graph tags | ✅ | og:title, og:description, og:image, og:locale=th_TH |
| Twitter Card | ✅ | summary_large_image |
| JSON-LD: TravelAgency | ✅ | In index.html, static |
| JSON-LD: LocalBusiness | ✅ | In index.html, static |
| JSON-LD: Article | ✅ | In PostDetail.tsx, dynamic per article |
| Canonical URL | ✅ | `https://philingo.co.th/` |
| `og:locale:alternate` | ✅ | en_US listed |
| Sitemap | ⚠️ | Exists in code, **route mount not found in index.ts** |
| Robots.txt | ⚠️ | Inline in routes (app.get('/robots.txt')), confirms sitemap |
| `lang` dynamic update | ✅ | `document.documentElement.lang` changes on language switch |

### Sitemap Status
The `sitemap.ts` handler exists and generates XML with schools + blog slugs.  
However, `GET /sitemap.xml` returned no response in testing — route may not be mounted in `routes/index.ts`.  
This is a **pre-existing issue**, not caused by any recent change.

### Admin Panel
| Element | Status | Details |
|---------|--------|---------|
| `meta robots` | ✅ | `content="index, follow"` — **should be noindex** (admin panel should not be indexed) |
| OG tags | ⚠️ | Generic boilerplate ("built on Replit") — not updated |

---

## 13. Accessibility Settings

### Public Website
| Check | Status | Notes |
|-------|--------|-------|
| `<html lang="th">` | ✅ | Correct for screen readers |
| Dynamic `lang` update | ✅ | Updated via JS on language switch |
| `aria-label` usage | ✅ | 43 instances across pages |
| Missing `alt` on `<img>` | ✅ | No missing `alt` found in pages |
| Color contrast | ⚠️ | Not audited — requires browser tool |
| Focus management | ⚠️ | Not audited — requires browser tool |
| Skip navigation | ❌ | No "skip to main content" link |
| ARIA landmarks | ⚠️ | Partial — Header has nav, but main/footer not verified |

### Admin Panel — ⚠️ ACCESSIBILITY ISSUES
| Check | Status | Notes |
|-------|--------|-------|
| `<html lang="en">` | ❌ | **Wrong.** Admin has Thai content — screen readers/Edge Read Aloud will read Thai as English |
| Thai font for screen readers | ❌ | No Prompt/Sarabun loaded — browser must guess Thai font |
| `aria-label` | ⚠️ | Not audited |

---

## 14. Root Cause Analysis

### Root Cause 1: Thai Font / Display Issues

**In Admin Panel (confirmed broken):**
```
Problem: Thai text in /admin renders with system default font
Cause A: admin/index.html loads ONLY Inter (English font)
Cause B: admin/src/index.css has NO Thai font import
Cause C: No CSS font fallback chain for Thai
Result:  Browser picks OS Thai font (Tahoma/Leelawadee) randomly
         → inconsistent size, weight, line-height
```

**In Public Website (currently stable):**
```
Status: Working correctly since Leelawadee UI fallback was added
Risk:   If Google Fonts CDN is slow → 300-500ms Thai font flash (FOUT)
        Mitigated by: Leelawadee UI in fallback chain (instant OS font)
```

**Fix needed:** Admin panel — add Prompt/Sarabun to index.html + index.css

---

### Root Cause 2: UTF-8 Encoding Issues

**Current status: No active encoding issues in data layer**
```
✅ PostgreSQL: UTF-8 (Replit managed, always UTF-8)
✅ Express: Returns UTF-8 JSON by default
✅ HTML: charset="UTF-8" on both apps
✅ Resend email: UTF-8 HTML
```

**Historical risk (not currently breaking):**
```
If Thai text appears as ?????? or boxes:
→ Check browser Network tab → Response headers → Content-Type: application/json; charset=utf-8
→ Check DB connection: SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = current_database();
→ Most likely cause: font not loaded (display issue, not encoding issue)
```

**Key distinction:** What looks like "encoding broken" is usually "Thai font not loaded." These are different problems with different fixes.

---

### Root Cause 3: Browser Compatibility Issues

**Microsoft Edge — Read Aloud / Accessibility:**
```
Problem: Edge Read Aloud mispronounces Thai text in admin
Root cause: admin/index.html has lang="en"
Edge behavior: Uses English TTS engine for entire page when lang="en"
Fix: Change admin/index.html to lang="th"
Risk: LOW — single attribute change, no logic change
```

**Microsoft Edge — Font Rendering:**
```
Problem: Thai letters may look different in Edge vs Chrome
Root cause: Edge uses "Leelawadee UI" as Thai system font, Chrome uses different fallback
Status: FIXED in philingo (Leelawadee UI explicitly in chain)
Status: NOT FIXED in admin (no Thai font chain at all)
```

**Safari Private Mode:**
```
Problem: localStorage blocked → language preference lost
Status: FIXED — language-context.tsx has try-catch, defaults to Thai
```

---

### Root Cause 4: Bilingual Content Instability

**The "fixing one page breaks another" pattern comes from:**

```
Two separate bilingual systems exist side-by-side:

System A: t(key) from content.ts
  - Coverage: nav, common buttons, home section labels, footer
  - Language source: static file (content.ts, 116 lines)
  - Weakness: t() returns the raw key string if key not found
              → shows "home.hero_title" instead of text
              → easy to miss during development

System B: item.titleTh / item.title inline
  - Coverage: all DB-driven content (schools, blog, courses, etc.)
  - Language source: database records
  - Weakness: if DB record has empty titleTh → shows empty string
              or shows English title with no Thai equivalent

Cross-contamination risk:
  When a developer edits a page and changes how language is read
  (e.g., switches from System B to System A), content in the OTHER
  language disappears silently.
```

**Stable pattern (no changes needed):**
- System A for UI chrome → correct, working
- System B for DB content → correct, working
- Do NOT mix them on the same component

---

## 15. Known Bugs (Complete Registry)

| # | Sev | Bug | File | Status |
|---|-----|-----|------|--------|
| B-01 | 🔴 | `publishedAt` string → DB crash creating blog/review | `blog.ts` | ✅ Fixed |
| B-02 | 🔴 | Admin `/reviews` silently fails on create | `blog.ts` | ✅ Fixed |
| B-03 | 🟡 | Form crash without email | `forms.ts` | ✅ Fixed |
| B-04 | 🟡 | Contact crash without email | `contacts.ts` | ✅ Fixed |
| B-05 | 🟡 | Auto-reply to fake `08xxx@noemail.com` address | `Contact.tsx` | ✅ Fixed |
| B-06 | 🟡 | Email showed no submitted data | `forms.ts`, `contacts.ts` | ✅ Fixed |
| B-07 | 🟢 | localStorage crash Safari private mode | `language-context.tsx` | ✅ Fixed |
| B-08 | 🟡 | LINE ID not sent to API | `Contact.tsx` | ✅ Fixed |
| B-09 | 🟡 | No thank-you state after contact submit | `Contact.tsx` | ✅ Fixed |
| **B-10** | 🔴 | **Admin `lang="en"` — Edge Read Aloud broken** | `admin/index.html` | ❌ **NOT FIXED** |
| **B-11** | 🔴 | **Admin loads no Thai fonts** | `admin/index.html`, `admin/index.css` | ❌ **NOT FIXED** |
| B-12 | 🟡 | Quotation shows ฿0 with no pricingConfig | `SchoolDetail.tsx` | ❌ Pending |
| B-13 | 🟡 | Sitemap not accessible at /sitemap.xml | `routes/index.ts` | ❌ Pending |
| B-14 | 🟢 | Admin `meta robots: index,follow` (should be noindex) | `admin/index.html` | ❌ Pending |
| B-15 | 🟢 | 1 hardcoded promo card in Promotions.tsx | `Promotions.tsx` | ❌ Pending |
| B-16 | 🟢 | LINE URL hardcoded in 6+ places | Multiple | ❌ Pending (Task #24) |

---

## 16. Proposed Minimum Fixes (Requires Approval)

**Listed by priority. No changes made yet.**

### Fix 1 — Admin `lang="en"` → `lang="th"` [HIGH PRIORITY]
```
File:    artifacts/admin/index.html  
Change:  <html lang="en">  →  <html lang="th">
Risk:    ZERO — attribute change only, no logic
Impact:  Fixes Edge Read Aloud for all Thai text in admin
```

### Fix 2 — Add Thai fonts to Admin [HIGH PRIORITY]  
```
File A:  artifacts/admin/index.html
Change:  Add Prompt + Sarabun to Google Fonts link
Risk:    LOW — adds a font, changes nothing else
Impact:  Thai text in admin renders correctly

File B:  artifacts/admin/src/index.css
Change:  Add Thai font fallback chain to body/root font-family
Risk:    LOW — CSS only, no layout change expected
Impact:  Consistent Thai rendering across OS/browsers
```

### Fix 3 — Admin `meta robots: noindex` [LOW PRIORITY]
```
File:    artifacts/admin/index.html
Change:  content="index, follow"  →  content="noindex, nofollow"
Risk:    ZERO — admin panel should never be indexed by Google
Impact:  Prevents admin pages from appearing in search results
```

**All three fixes are isolated to `artifacts/admin/index.html` and `artifacts/admin/src/index.css`.  
They do not touch any logic, components, API, or database.  
They can be applied in one small edit.**

---

*Audit complete — zero code changes made. Awaiting approval to proceed with fixes.*
