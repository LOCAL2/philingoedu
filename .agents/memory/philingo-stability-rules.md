---
name: Philingo Stability Rules & Fix Registry
description: Critical rules and verified fix registry — must read before any change to Philingo project
---

# Philingo Stability Rules & Fix Registry

## Core Rules (from project owner)
- แก้เฉพาะที่สั่ง — แตะแค่ที่ user บอก ห้ามแก้ส่วนอื่น
- ห้าม rebuild / ห้าม regenerate / ห้าม reset DB
- ห้าม drop table / ห้าม delete records / ห้าม reset settings
- Patch existing code only — never replace working code

## Thai Language Requirements (permanent)
- `<html lang="th">` — set in `artifacts/philingo/index.html`
- `<meta charset="UTF-8">` — set in `artifacts/philingo/index.html`
- Font stack: Prompt → Sarabun → Leelawadee UI → Leelawadee → Tahoma → Arial Unicode MS → sans-serif
- Google Fonts loaded: Inter, Prompt, Sarabun (via preconnect in index.html AND @import in index.css)
- Leelawadee UI fallback added for Edge/Microsoft browsers (Thai built-in Windows font)

**Why:** User reported Thai unreadable in Edge when Google Fonts fails to load. Leelawadee UI is the Windows system Thai font and always available.

## Verified Fix Registry (all confirmed present as of 2026-07-31)

| Fix | File | What it does |
|-----|------|-------------|
| localStorage try-catch | `artifacts/philingo/src/lib/language-context.tsx` | Safari private mode — defaults to Thai on failure |
| email optional (submit form) | `artifacts/api-server/src/routes/forms.ts` | `safeEmail = email?.trim() \|\| ''` — no crash if no email |
| LINE ID extraction | `artifacts/api-server/src/routes/forms.ts` | Extracts from message `LINE ID: @xxx\n...` pattern |
| Email shows all fields | `artifacts/api-server/src/routes/forms.ts` | Both admin notification + user auto-reply show full data |
| Seminar email with LINE ID | `artifacts/api-server/src/routes/forms.ts` | `/seminar` endpoint includes lineId in email |
| email optional (contact) | `artifacts/api-server/src/routes/contacts.ts` | `if (!name)` only — email no longer required |
| Contact email shows all fields | `artifacts/api-server/src/routes/contacts.ts` | Admin + user auto-reply show name/phone/LINE/subject/message |
| blog publishedAt Date fix | `artifacts/api-server/src/routes/blog.ts` | `normalizePost()` converts ISO string → Date before DB insert |
| Contact thank-you page | `artifacts/philingo/src/pages/Contact.tsx` | After submit: shows submitted data + LINE add button |
| LINE ID sent correctly | `artifacts/philingo/src/pages/Contact.tsx` | Prepends `LINE ID: @xxx\n` to message before API call |
| Activities done state | `artifacts/philingo/src/pages/Activities.tsx` | FairRegistrationForm + RegisterModal: shows data + LINE button |
| Seminars countdown | `artifacts/philingo/src/pages/Seminars.tsx` | `useCountdown(FIRST_EVENT)` — black bar bottom of banner |
| Seminars schoolInterest | `artifacts/philingo/src/pages/Seminars.tsx` | Maps `schools[]` → comma-joined string for API |
| Thai font Edge fallback | `artifacts/philingo/src/index.css` | `--app-font-sans` includes Leelawadee UI chain |

## Regression Checklist (run before saving changes)
- [ ] `GET /api/settings` → 200
- [ ] `GET /api/promotions` → total > 0
- [ ] `GET /api/blog?category=review` → no crash
- [ ] `POST /api/forms/submit` with no email → 200
- [ ] `POST /api/forms/seminar` with no email → 200
- [ ] `POST /api/contacts/contact` with no email → should 400 (name required)
- [ ] `POST /api/blog` with ISO publishedAt string → 201 (no crash)
- [ ] Seminars page: countdown visible
- [ ] Contact page: success state shows submitted data + LINE button
- [ ] Activities page: registration done state shows LINE button
- [ ] `<html lang="th">` present in index.html
- [ ] `<meta charset="UTF-8">` present in index.html
- [ ] `Leelawadee UI` in --app-font-sans CSS variable
