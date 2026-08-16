# Philingo — Rebuild Prompt (Clean Project)

> **เป้าหมาย:** สร้าง project ใหม่จาก scratch ด้วย stack ที่รันได้ง่าย  
> รัน dev ด้วยคำสั่งเดียว: `bun run dev`  
> ไม่ต้องเปิดหลาย terminal, ไม่มี monorepo complexity  
> **ไม่มี Replit dependency ใดๆ ทั้งสิ้น**

---

## Stack ที่ต้องใช้

| Layer | Technology |
|-------|-----------|
| Runtime | **Bun** |
| Frontend (หน้าหลัก) | Vite + React 19 + TypeScript |
| Frontend (Admin) | Vite + React 19 + TypeScript |
| Backend (API) | **Hono** (runs on Bun natively) |
| Database | **Supabase** (PostgreSQL) + **Drizzle ORM** |
| File Storage | **Supabase Storage** |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Email | Resend |

---

## โครงสร้าง Project

```
philingo/
├── frontend/          ← หน้าเว็บหลัก (Vite React)
│   ├── src/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── admin/             ← Admin Panel (Vite React, base path /admin/)
│   ├── src/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/           ← API Server (Hono on Bun)
│   ├── src/
│   │   ├── index.ts   ← entry point
│   │   ├── db/        ← Drizzle schema
│   │   ├── routes/    ← API routes
│   │   ├── middleware/ ← auth, validate
│   │   └── lib/       ← jwt, email, logger
│   └── package.json
├── package.json       ← root (dev script รัน 3 process)
└── .env               ← env vars
```

---

## Root package.json (รัน `bun run dev` เดียว)

```json
{
  "name": "philingo",
  "private": true,
  "scripts": {
    "dev": "bun run --cwd backend dev & bun run --cwd frontend dev & bun run --cwd admin dev & wait",
    "build": "bun run --cwd backend build & bun run --cwd frontend build & bun run --cwd admin build",
    "start": "bun run --cwd backend start"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

> ใช้ `concurrently` แทนถ้าต้องการ log ที่สวยงามกว่า:
> ```json
> "dev": "concurrently -n API,WEB,ADM -c cyan,green,yellow \"bun run --cwd backend dev\" \"bun run --cwd frontend dev\" \"bun run --cwd admin dev\""
> ```

---

## .env (ใส่ที่ root หรือ backend/)

```env
# Database — Supabase Transaction Pooler
DATABASE_URL=postgresql://postgres.srxteomobjamicmpetwj:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Supabase API
SUPABASE_URL=https://srxteomobjamicmpetwj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # หาได้จาก Dashboard → Settings → API

# Supabase Storage
SUPABASE_STORAGE_BUCKET=uploads   # bucket ที่สร้างไว้ใน Supabase Storage

# Auth
JWT_SECRET=your-strong-secret-here

# App
NODE_ENV=development
PORT=8080
SITE_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email (Resend)
RESEND_API_KEY=re_xxxx
RESEND_FROM=noreply@philingo.co.th
ADMIN_EMAIL=admin@philingo.com

# AI (Anthropic) — optional
ANTHROPIC_API_KEY=sk-ant-xxxx
```

---

## Backend — `backend/src/index.ts`

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { schoolsRoutes } from './routes/schools'
import { blogRoutes } from './routes/blog'
import { bannersRoutes } from './routes/banners'
import { coursesRoutes } from './routes/courses'
import { faqsRoutes } from './routes/faqs'
import { formsRoutes } from './routes/forms'
import { contactsRoutes } from './routes/contacts'
import { testimonialsRoutes } from './routes/testimonials'
import { promotionsRoutes } from './routes/promotions'
import { partnersRoutes } from './routes/partners'
import { galleryRoutes } from './routes/gallery'
import { teamRoutes } from './routes/team'
import { settingsRoutes } from './routes/settings'
import { dashboardRoutes } from './routes/dashboard'
import { newsletterRoutes } from './routes/newsletter'
import { eventsRoutes } from './routes/events'
import { adminUsersRoutes } from './routes/admin-users'
import { uploadRoutes } from './routes/upload'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('/api/*', cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['*'],
  credentials: true,
}))

// Routes
app.route('/api/auth', authRoutes)
app.route('/api/admin-users', adminUsersRoutes)
app.route('/api/schools', schoolsRoutes)
app.route('/api/blog', blogRoutes)
app.route('/api/banners', bannersRoutes)
app.route('/api/courses', coursesRoutes)
app.route('/api/faqs', faqsRoutes)
app.route('/api/forms', formsRoutes)
app.route('/api/contacts', contactsRoutes)
app.route('/api/testimonials', testimonialsRoutes)
app.route('/api/promotions', promotionsRoutes)
app.route('/api/partners', partnersRoutes)
app.route('/api/gallery', galleryRoutes)
app.route('/api/team', teamRoutes)
app.route('/api/settings', settingsRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/newsletter', newsletterRoutes)
app.route('/api/events', eventsRoutes)
app.route('/api/upload', uploadRoutes)

// Health
app.get('/api/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

export default {
  port: Number(process.env.PORT) || 8080,
  fetch: app.fetch,
}
```

---

## Backend — Database Connection (`backend/src/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

// postgres-js handles SSL natively — no rejectUnauthorized issues
const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10,
})

export const db = drizzle(client, { schema })
export * from './schema'
```

> **สำคัญ:** ใช้ `postgres` (postgres-js) แทน `pg` เพราะ handle SSL กับ Supabase ได้ดีกว่ามาก ไม่มีปัญหา `rejectUnauthorized`

---

## Backend — DB Schema

### `backend/src/db/schema/users.ts`
```typescript
import { pgTable, serial, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'editor'])

export const adminUsersTable = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('editor'),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type AdminUser = typeof adminUsersTable.$inferSelect
```

### `backend/src/db/schema/schools.ts`
```typescript
import { pgTable, serial, text, boolean, timestamp, integer, real, jsonb } from 'drizzle-orm/pg-core'

export const schoolsTable = pgTable('schools', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  nameTh: text('name_th').notNull(),
  tagline: text('tagline'),
  taglineTh: text('tagline_th'),
  city: text('city').notNull(),
  country: text('country').notNull().default('Philippines'),
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),
  rating: real('rating').notNull().default(4.5),
  studentsCount: text('students_count'),
  nationalityCount: text('nationality_count'),
  foundedYear: integer('founded_year'),
  description: text('description'),
  descriptionTh: text('description_th'),
  highlights: jsonb('highlights').$type<string[]>().default([]),
  facilities: jsonb('facilities').$type<string[]>().default([]),
  programs: jsonb('programs').$type<any[]>().default([]),
  photos: jsonb('photos').$type<string[]>().default([]),
  youtubeId: text('youtube_id'),
  websiteUrl: text('website_url'),
  mapUrl: text('map_url'),
  accentClass: text('accent_class'),
  tags: jsonb('tags').$type<string[]>().default([]),
  pricingConfig: jsonb('pricing_config'),
  timetableConfig: jsonb('timetable_config'),
  isFeatured: boolean('is_featured').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  seoH1Override: text('seo_h1_override'),
  seoMarketingMeta: text('seo_marketing_meta'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export type School = typeof schoolsTable.$inferSelect
```

> สร้าง schema เดียวกันสำหรับตารางอื่น:
> - `blog_posts`, `banners`, `courses`, `faqs`, `testimonials`
> - `promotions`, `partners`, `gallery_items`, `team_members`
> - `contact_submissions`, `form_submissions`, `seminar_registrations`
> - `newsletter_subscribers`, `newsletter_campaigns`
> - `site_settings`, `events`, `event_registrations`

---

## Backend — Auth Middleware (`backend/src/middleware/auth.ts`)

```typescript
import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { jwt } from 'hono/jwt'

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  const cookie = getCookie(c, 'auth_token')
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : cookie

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = await verifyJwt(token)
    c.set('user', payload)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET!
  // use jose or jsonwebtoken
  import { verify } from 'jsonwebtoken'
  return new Promise((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded)
    })
  })
}
```

---

## Backend — Auth Route (`backend/src/routes/auth.ts`)

```typescript
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { db, adminUsersTable } from '../db'
import { requireAuth } from '../middleware/auth'

export const authRoutes = new Hono()

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400)
  }

  const [user] = await db.select().from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase().trim()))
    .limit(1)

  if (!user || !user.isActive) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401)

  const payload = { id: user.id, email: user.email, name: user.name, role: user.role }
  const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 7 * 24 * 60 * 60,
  })

  return c.json({ token, user: payload })
})

// GET /api/auth/me
authRoutes.get('/me', requireAuth, async (c) => {
  const user = c.get('user') as any
  const [row] = await db.select({
    id: adminUsersTable.id,
    email: adminUsersTable.email,
    name: adminUsersTable.name,
    role: adminUsersTable.role,
  }).from(adminUsersTable).where(eq(adminUsersTable.id, user.id)).limit(1)
  
  if (!row) return c.json({ error: 'Not found' }, 404)
  return c.json(row)
})

// POST /api/auth/logout
authRoutes.post('/logout', (c) => {
  setCookie(c, 'auth_token', '', { maxAge: 0 })
  return c.json({ ok: true })
})
```

---

## Backend — Generic CRUD Route Pattern

ทุก route ใช้ pattern เดียวกัน เช่น `schools`, `blog`, `faqs`, `banners`, `promotions` ฯลฯ:

```typescript
import { Hono } from 'hono'
import { eq, and, asc, count, ilike, or } from 'drizzle-orm'
import { db, schoolsTable } from '../db'
import { requireAuth } from '../middleware/auth'

export const schoolsRoutes = new Hono()

// GET / — list with pagination + filters
schoolsRoutes.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const limit = Math.min(100, Number(c.req.query('limit') ?? 20))
  const offset = (page - 1) * limit
  const conditions = []

  if (c.req.query('isActive') !== undefined)
    conditions.push(eq(schoolsTable.isActive, c.req.query('isActive') === 'true'))
  if (c.req.query('search')) {
    const s = `%${c.req.query('search')}%`
    conditions.push(or(ilike(schoolsTable.name, s), ilike(schoolsTable.nameTh, s)))
  }

  const where = conditions.length ? and(...conditions) : undefined
  const [{ total }] = await db.select({ total: count() }).from(schoolsTable).where(where)
  const data = await db.select().from(schoolsTable).where(where)
    .orderBy(asc(schoolsTable.sortOrder)).limit(limit).offset(offset)

  return c.json({ data, total: Number(total), page, limit })
})

// GET /:id — single by id or slug
schoolsRoutes.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const bySlug = isNaN(id)
  const [item] = bySlug
    ? await db.select().from(schoolsTable).where(eq(schoolsTable.slug, c.req.param('id')!)).limit(1)
    : await db.select().from(schoolsTable).where(eq(schoolsTable.id, id)).limit(1)
  if (!item) return c.json({ error: 'Not found' }, 404)
  return c.json(item)
})

// POST / — create (auth required)
schoolsRoutes.post('/', requireAuth, async (c) => {
  const body = await c.req.json()
  const [created] = await db.insert(schoolsTable).values(body).returning()
  return c.json(created, 201)
})

// PATCH /:id — update
schoolsRoutes.patch('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const [updated] = await db.update(schoolsTable)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(schoolsTable.id, id)).returning()
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(updated)
})

// DELETE /:id — soft delete
schoolsRoutes.delete('/:id', requireAuth, async (c) => {
  const id = Number(c.req.param('id'))
  const [updated] = await db.update(schoolsTable)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(schoolsTable.id, id)).returning({ id: schoolsTable.id })
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})
```

---

## Backend — Email (`backend/src/lib/email.ts`)

```typescript
import { Resend } from 'resend'

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] not configured — skipping:', opts.subject)
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM ?? 'Philingo <onboarding@resend.dev>'
  await resend.emails.send({ from, ...opts })
}
```

---

## Frontend Vite Config — หน้าหลัก (`frontend/vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
      '/admin': { target: 'http://localhost:3001', changeOrigin: true },
    }
  }
})
```

---

## Frontend Vite Config — Admin (`admin/vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 3001,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    }
  }
})
```

---

## Admin — Authentication (`admin/src/lib/auth.tsx`)

```typescript
import { createContext, useContext, useState, useEffect } from 'react'

interface User { id: number; email: string; name: string; role: string }
interface AuthCtx { user: User | null; login: (email: string, password: string) => Promise<void>; logout: () => void; loading: boolean }

const AuthContext = createContext<AuthCtx>(null!)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    if (!r.ok) throw new Error((await r.json()).error ?? 'Login failed')
    const { user } = await r.json()
    setUser(user)
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
```

---

## Admin — Default Credentials

| Field | Value |
|-------|-------|
| Email | `admin@philingo.com` |
| Password | `Admin@2024!` |

เพิ่ม user ใน Supabase SQL Editor:
```sql
INSERT INTO public.admin_users (email, password_hash, name, role, is_active)
VALUES (
  'admin@philingo.com',
  '$2b$12$sXwE5smMV4BksEcNQGhr1OjFnDwn9DdnOJ.5pTk5rlNkl2A0tWg.S',
  'Philingo Admin',
  'superadmin',
  true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;
```

---

## Pages ที่ต้องสร้าง

### Frontend หน้าหลัก (19 pages)
| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | หน้าแรก — banners, featured schools, promotions, testimonials |
| `/schools` | `Schools` | รายการโรงเรียนทั้งหมด พร้อม filter city |
| `/schools/:slug` | `SchoolDetail` | รายละเอียดโรงเรียน + pricing calculator |
| `/courses` | `Courses` | รายการหลักสูตร |
| `/courses/:schoolSlug/:courseSlug` | `CourseDetail` | รายละเอียดหลักสูตร |
| `/blog` | `Blog` | รายการบทความ |
| `/blog/:slug` | `BlogPost` | อ่านบทความ |
| `/promotions` | `Promotions` | โปรโมชั่น |
| `/seminars` | `Seminars` | งานสัมมนา + ลงทะเบียน |
| `/contact` | `Contact` | ติดต่อเรา |
| `/apply` | `Apply` | สมัครเรียน |
| `/consult` | `Consult` | ปรึกษาฟรี |
| `/about` | `About` | เกี่ยวกับเรา |
| `/faq` | `FAQ` | คำถามที่พบบ่อย |
| `/gallery` | `Gallery` | แกลเลอรี่รูปภาพ |

### Admin Panel (19 pages)
| Route | Component |
|-------|-----------|
| `/admin/` | Dashboard |
| `/admin/schools` | Schools list + CRUD |
| `/admin/courses` | Courses list + CRUD |
| `/admin/blog` | Blog posts list + editor |
| `/admin/banners` | Banners manager |
| `/admin/promotions` | Promotions manager |
| `/admin/faqs` | FAQs manager |
| `/admin/testimonials` | Testimonials manager |
| `/admin/partners` | Partners manager |
| `/admin/gallery` | Gallery manager |
| `/admin/team` | Team members |
| `/admin/events` | Events + registrations |
| `/admin/forms` | Form submissions |
| `/admin/contacts` | Contact submissions |
| `/admin/newsletter` | Newsletter |
| `/admin/settings` | Site settings |
| `/admin/users` | Admin users |
| `/admin/login` | Login page |

---

## API Endpoints ทั้งหมด

```
GET/POST   /api/auth/login
POST       /api/auth/logout
GET        /api/auth/me

GET/POST   /api/schools
GET/PATCH/DELETE /api/schools/:id

GET/POST   /api/blog
GET/PATCH/DELETE /api/blog/:id
POST       /api/blog/generate-content  (AI - Claude)
POST       /api/blog/generate-seo      (AI - Claude)

GET/POST   /api/banners
PATCH/DELETE /api/banners/:id

GET/POST   /api/courses
GET/PATCH/DELETE /api/courses/:id

GET/POST   /api/faqs
PATCH/DELETE /api/faqs/:id

GET/POST   /api/testimonials
PATCH/DELETE /api/testimonials/:id

GET/POST   /api/promotions
PATCH/DELETE /api/promotions/:id

GET/POST   /api/partners
PATCH/DELETE /api/partners/:id

GET/POST   /api/gallery
PATCH/DELETE /api/gallery/:id

GET/POST   /api/team
PATCH/DELETE /api/team/:id

GET/POST   /api/events
PATCH/DELETE /api/events/:id

GET        /api/event-registrations
POST       /api/events/:id/register

POST       /api/contacts/contact       (public form)
GET        /api/contacts               (admin)
PATCH      /api/contacts/:id/status

POST       /api/forms/submit           (public - apply/consult/quotation)
POST       /api/forms/seminar          (public - seminar registration)
GET        /api/forms                  (admin)
GET        /api/forms/seminars         (admin)

GET/POST   /api/newsletter/subscribers
GET/POST   /api/newsletter/campaigns

GET/POST   /api/settings
PATCH      /api/settings/:key

GET        /api/dashboard              (admin stats)

GET        /api/admin-users            (superadmin)
POST       /api/admin-users
PATCH      /api/admin-users/:id

POST       /api/upload                 (image upload → Supabase Storage)
```

---

## Admin useCrud Hook Pattern

Admin ทุกหน้าใช้ pattern นี้:

```typescript
// admin/src/hooks/useCrud.ts
import { useState, useEffect } from 'react'

export function useCrud<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const fetchAll = async (params?: Record<string, string>) => {
    setLoading(true)
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    const r = await fetch(`/api/${endpoint}${query}`, { credentials: 'include' })
    const json = await r.json()
    setData(json.data ?? json)
    setTotal(json.total ?? json.length)
    setLoading(false)
  }

  const create = async (body: Partial<T>) => {
    const r = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(await r.text())
    await fetchAll()
    return r.json()
  }

  const update = async (id: number, body: Partial<T>) => {
    const r = await fetch(`/api/${endpoint}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(await r.text())
    await fetchAll()
    return r.json()
  }

  const remove = async (id: number) => {
    await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE', credentials: 'include' })
    await fetchAll()
  }

  useEffect(() => { fetchAll() }, [endpoint])

  return { data, loading, total, fetchAll, create, update, remove }
}
```

---

## Frontend API Client Pattern

```typescript
// frontend/src/lib/api.ts
const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const r = await fetch(BASE + path)
  if (!r.ok) throw new Error(`${r.status} ${path}`)
  return r.json()
}

export const api = {
  schools: {
    list: (params?: Record<string, string>) => 
      get<{ data: School[]; total: number }>('/schools?' + new URLSearchParams(params)),
    get: (slug: string) => get<School>(`/schools/${slug}`),
  },
  blog: {
    list: (params?: Record<string, string>) => 
      get<{ data: BlogPost[]; total: number }>('/blog?' + new URLSearchParams(params)),
    get: (slug: string) => get<BlogPost>(`/blog/${slug}`),
  },
  // ... etc
}
```

---

## File Storage — Supabase Storage (แทน GCS และ Replit ทั้งหมด)

ใช้ Supabase Storage เป็น object storage เพียงที่เดียว — ไม่มี GCS, ไม่มี Replit `/api/uploads`

### ขั้นตอน Setup Supabase Storage

1. ไปที่ [Supabase Dashboard → Storage](https://supabase.com/dashboard/project/srxteomobjamicmpetwj/storage/buckets)
2. สร้าง bucket ชื่อ `uploads`
3. ตั้งเป็น **Public** bucket (ให้ทุกคนอ่านได้ ไม่ต้อง auth)
4. ใน Dashboard → Storage → Policies เพิ่ม policy:
   - **SELECT** (public read): `true`
   - **INSERT** (authenticated upload): ใช้ service_role key จาก backend

### Upload Route (`backend/src/routes/upload.ts`)

```typescript
import { Hono } from 'hono'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '../middleware/auth'

export const uploadRoutes = new Hono()

// Supabase client ใช้ service_role key สำหรับ upload (bypass RLS)
function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'uploads'

// POST /api/upload — อัปโหลดรูปภาพ (admin only)
uploadRoutes.post('/', requireAuth, async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null

  if (!file) return c.json({ error: 'No file provided' }, 400)

  // Validate type
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return c.json({ error: 'Only JPG, PNG, WebP, GIF allowed' }, 400)
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: 'File too large (max 5MB)' }, 400)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const supabase = getSupabase()
  const buffer = await file.arrayBuffer()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      cacheControl: '31536000', // 1 year cache
      upsert: false,
    })

  if (error) {
    console.error('[upload] Supabase error:', error)
    return c.json({ error: error.message }, 500)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path)

  return c.json({ url: publicUrl, path: data.path, filename })
})

// DELETE /api/upload — ลบรูปภาพ (admin only)
uploadRoutes.delete('/', requireAuth, async (c) => {
  const { path } = await c.req.json()
  if (!path) return c.json({ error: 'path required' }, 400)

  const supabase = getSupabase()
  const { error } = await supabase.storage.from(BUCKET).remove([path])

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// GET /api/upload/list — list files (admin only)
uploadRoutes.get('/list', requireAuth, async (c) => {
  const supabase = getSupabase()
  const { data, error } = await supabase.storage.from(BUCKET).list('', {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  if (error) return c.json({ error: error.message }, 500)
  
  const files = (data ?? []).map(f => ({
    name: f.name,
    path: f.name,
    url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
    size: f.metadata?.size,
    createdAt: f.created_at,
  }))

  return c.json({ files })
})
```

### ImageUpload Component (`admin/src/components/ui/ImageUpload.tsx`)

```tsx
import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  accept?: string
  maxSizeMB?: number
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`ไฟล์ต้องไม่เกิน ${maxSizeMB}MB`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: form,
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error ?? 'Upload failed')
      }

      const { url } = await res.json()
      onChange(url)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="uploaded" className="h-32 w-auto rounded-lg object-cover border" />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">คลิกเพื่ออัปโหลดรูปภาพ</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (max {maxSizeMB}MB)</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
```

### URL Format ของรูปที่อัปโหลด

รูปทุกรูปจะมี URL รูปแบบนี้:
```
https://srxteomobjamicmpetwj.supabase.co/storage/v1/object/public/uploads/[filename]
```

เก็บ URL นี้ตรงๆ ใน database ไม่ต้องแปลงอะไร ใช้ได้เลย

### ย้ายรูปจากโปรเจกต์เก่า

รูปเดิมมี URL รูปแบบ `/api/storage/objects/uploads/[uuid]` ต้องดาวน์โหลดจาก Supabase เดิมแล้วอัปโหลดใหม่ หรือ update URL ใน DB ให้ชี้ไป Supabase Storage URL ใหม่
```

---

## รูปภาพโรงเรียน (School Photos)

ใช้รูปจาก `/attached_assets/city-photos/` ตามเมืองของโรงเรียน — **ไม่ใช้ picsum, unsplash หรือ URL ภายนอกใดๆ**

### Mapping เมือง → รูป (ใช้ตามนี้เป๊ะ)

| เมือง | ไฟล์รูป |
|-------|---------|
| เซบู (Cebu, Mactan, IT Park, Cebu City) | `/attached_assets/city-photos/cebu.jpg` |
| บาเกียว (Baguio City) | `/attached_assets/city-photos/baguio.jpg` |
| คลาร์ก (Clark, Clark Freeport Zone) | `/attached_assets/city-photos/clark.jpg` |
| มะนิลา (Manila, BGC, Makati) | `/attached_assets/city-photos/manila.jpg` |
| อิโลอิโล (Iloilo City, Jaro) | `/attached_assets/city-photos/iloilo.jpg` |

### Helper Function

```typescript
// frontend/src/lib/school-image.ts
export function getSchoolCoverImage(city: string): string {
  const c = city.toLowerCase()
  if (c.includes('cebu') || c.includes('mactan'))   return '/assets/city-photos/cebu.jpg'
  if (c.includes('baguio'))                          return '/assets/city-photos/baguio.jpg'
  if (c.includes('clark'))                           return '/assets/city-photos/clark.jpg'
  if (c.includes('iloilo'))                          return '/assets/city-photos/iloilo.jpg'
  if (c.includes('manila') || c.includes('bgc'))     return '/assets/city-photos/manila.jpg'
  return '/assets/city-photos/cebu.jpg' // default fallback
}
```

ใช้ในทุกที่ที่แสดงรูปโรงเรียน:
```tsx
const coverSrc = school.coverImageUrl || getSchoolCoverImage(school.city)
<img src={coverSrc} alt={school.nameTh} />
```

### ไฟล์รูปอื่นที่มี

- `facility-classroom.jpg`, `facility-cafeteria.jpg`, `facility-library.jpg`, `facility-pool.jpg`
- `room-single.jpg`, `room-twin.jpg`, `room-triple.jpg`, `room-quad.jpg`
- `review-1.jpg` ถึง `review-6.jpg`
- `generated_images/cebu-1.jpg`, `baguio-1.jpg`, `campus-1.jpg`, `classroom-1.jpg`
- `philingo_logo_transparent.png`

### Copy ไฟล์ไปใน project ใหม่

```bash
cp -r attached_assets/city-photos frontend/public/assets/city-photos
cp attached_assets/facility-*.jpg frontend/public/assets/
cp attached_assets/room-*.jpg frontend/public/assets/
cp attached_assets/review-*.jpg frontend/public/assets/
cp -r attached_assets/generated_images frontend/public/assets/
cp attached_assets/philingo_logo_transparent.png frontend/public/assets/
```

Project Reference: `srxteomobjamicmpetwj`  
URL: `https://srxteomobjamicmpetwj.supabase.co`

**Schema ถูก migrate ไปแล้ว** ดูไฟล์ `supabase_migration.sql` ในโปรเจกต์เก่า

Admin user SQL:
```sql
INSERT INTO public.admin_users (email, password_hash, name, role, is_active)
VALUES (
  'admin@philingo.com',
  '$2b$12$sXwE5smMV4BksEcNQGhr1OjFnDwn9DdnOJ.5pTk5rlNkl2A0tWg.S',
  'Philingo Admin', 'superadmin', true
)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
```

---

## ขั้นตอน Scaffold Project ใหม่

```bash
# 1. สร้าง root folder
mkdir philingo && cd philingo

# 2. Frontend หน้าหลัก
bun create vite frontend --template react-ts
cd frontend && bun add -D @vitejs/plugin-react @tailwindcss/vite tailwindcss
bun add wouter @tanstack/react-query framer-motion lucide-react

# 3. Admin Panel
cd ..
bun create vite admin --template react-ts
cd admin && bun add -D @vitejs/plugin-react @tailwindcss/vite tailwindcss
bun add wouter @tanstack/react-query lucide-react

# 4. Backend
cd ..
mkdir backend && cd backend
bun init -y
bun add hono drizzle-orm postgres bcryptjs jsonwebtoken resend @supabase/supabase-js
bun add -D drizzle-kit @types/bcryptjs @types/jsonwebtoken typescript

# 5. Root package.json
cd ..
bun add -D concurrently
```

---

## หมายเหตุสำคัญ

1. **ทำไม Hono แทน Express?** — Hono รันบน Bun native ไม่ต้องแปลง, type-safe by default, เร็วกว่า 3x
2. **ทำไม postgres-js แทน pg?** — Handle SSL กับ Supabase pooler ได้ดีกว่า ไม่มีปัญหา `rejectUnauthorized`  
3. **เข้า Admin** — `http://localhost:3000/admin/` (proxy ผ่าน frontend)
4. **เข้า API** — `http://localhost:3000/api/` (proxy ผ่าน frontend)
5. **รัน dev** — `bun run dev` ที่ root เดียวพอ

---

## AI Features (ถ้าต้องการ)

โปรเจกต์เดิมใช้ **Anthropic Claude** สำหรับ:
- สร้างเนื้อหาบทความ blog ภาษาไทย (1000-1500 คำ)
- สร้าง SEO metadata
- สร้าง description โรงเรียน

```bash
bun add @anthropic-ai/sdk
```

```typescript
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
```

---

*Generated: 2026-08-15 | Source: philingoedu project export*
