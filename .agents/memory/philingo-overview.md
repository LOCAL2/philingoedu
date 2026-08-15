---
name: Philingo Project Overview
description: Key facts about the Philingo CMS stack — credentials, routes, seed commands, env vars.
---

# Philingo Project Overview

## Stack
- Frontend: `artifacts/philingo` (React+Vite+Tailwind, preview path `/`)
- API: `artifacts/api-server` (Express 5+ESM, preview path `/api-server`, serves at `/api`)
- Admin: `artifacts/admin` (React+Vite+TanStack Query, preview path `/admin`)
- DB: Drizzle ORM + PostgreSQL (`lib/db`)

## Seeded credentials
- Admin login: `admin@philingo.com` / `Admin@2024!`
- JWT_SECRET: set via setEnvVars (shared env) — auto-generated 96-char hex

## Seed commands
```bash
/home/runner/workspace/node_modules/.pnpm/node_modules/.bin/tsx artifacts/api-server/src/seed.ts
/home/runner/workspace/node_modules/.pnpm/node_modules/.bin/tsx artifacts/api-server/src/seed-content.ts
```
Note: seed-content.ts must NOT have `import 'dotenv/config'` — env vars come from process.env.

## Key env vars needed
- `JWT_SECRET` — required, already set
- `ADMIN_EMAIL` — set to info@thaistudyabroad.com
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — for email (optional, falls back to console.log)

## Philingo frontend — Phase 3 incomplete
- `src/lib/api.ts` and `src/lib/queryClient.ts` are written
- `main.tsx` wraps with QueryClientProvider
- BUT: Schools.tsx, Courses.tsx, FAQs.tsx, Testimonials.tsx still use hardcoded data
- Need to swap hardcoded data arrays for `useQuery` hooks calling the API

## Contact/Seminar forms
- Contact.tsx: now POSTs to `/api/contacts/contact` ✅
- Seminars.tsx: now POSTs to `/api/forms/seminar` ✅ (email field added to formData)

**Why:** Hardcoded data was intentional for initial build; API integration is the next phase.
