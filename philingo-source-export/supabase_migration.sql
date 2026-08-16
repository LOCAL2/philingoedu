-- =============================================================================
-- Philingo — Supabase Migration
-- Generated: 2026-08-15
--
-- วิธีใช้:
--   1. ไปที่ Supabase Dashboard → SQL Editor
--   2. วาง SQL ทั้งหมดนี้แล้วกด Run
--   หรือใช้ supabase db push หากใช้ Supabase CLI
--
-- หมายเหตุ:
--   - id ทุกตารางใช้ bigint generated always as identity (Supabase best practice)
--   - timestamp ทั้งหมดแปลงเป็น timestamptz
--   - เพิ่ม updated_at trigger อัตโนมัติ
--   - RLS เปิดทุกตาราง (ตั้ง policy เพิ่มเติมตาม use case)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions (Supabase เปิด uuid-ossp ไว้แล้วโดย default)
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------------
create type public.form_type as enum (
    'contact',
    'apply',
    'consult',
    'quotation',
    'scholarship',
    'seminar'
);

create type public.submission_status as enum (
    'new',
    'in_progress',
    'replied',
    'closed'
);

create type public.user_role as enum (
    'superadmin',
    'admin',
    'editor'
);

-- ---------------------------------------------------------------------------
-- 2. UTILITY: updated_at auto-trigger
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. TABLES
-- ---------------------------------------------------------------------------

-- admin_users
create table public.admin_users (
    id             bigint generated always as identity primary key,
    email          text        not null unique,
    password_hash  text        not null,
    name           text        not null,
    role           public.user_role not null default 'editor',
    is_active      boolean     not null default true,
    last_login_at  timestamptz,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);
create trigger trg_admin_users_updated_at
    before update on public.admin_users
    for each row execute function public.handle_updated_at();

-- banners
create table public.banners (
    id               bigint generated always as identity primary key,
    title            text,
    title_th         text,
    subtitle         text,
    subtitle_th      text,
    cta_text         text,
    cta_text_th      text,
    cta_url          text,
    image_url        text,
    mobile_image_url text,
    is_active        boolean not null default true,
    sort_order       integer not null default 0,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);
create trigger trg_banners_updated_at
    before update on public.banners
    for each row execute function public.handle_updated_at();

-- blog_posts
create table public.blog_posts (
    id              bigint generated always as identity primary key,
    slug            text        not null unique,
    title           text        not null,
    title_th        text        not null,
    excerpt         text,
    excerpt_th      text,
    content         text,
    content_th      text,
    cover_image_url text,
    category        text,
    author          text,
    author_th       text,
    tags            jsonb       not null default '[]',
    seo_title       text,
    seo_description text,
    seo_keywords    text,
    views           integer     not null default 0,
    is_featured     boolean     not null default false,
    is_published    boolean     not null default false,
    published_at    timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create trigger trg_blog_posts_updated_at
    before update on public.blog_posts
    for each row execute function public.handle_updated_at();

-- contact_submissions
create table public.contact_submissions (
    id           bigint generated always as identity primary key,
    name         text        not null,
    email        text        not null,
    phone        text,
    subject      text,
    message      text,
    utm_source   text,
    utm_medium   text,
    utm_campaign text,
    ip_address   text,
    status       public.submission_status not null default 'new',
    admin_notes  text,
    created_at   timestamptz not null default now()
);

-- courses
create table public.courses (
    id                  bigint generated always as identity primary key,
    slug                text        not null unique,
    title               text        not null,
    title_th            text        not null,
    subtitle            text,
    subtitle_th         text,
    icon_name           text,
    description         text,
    description_th      text,
    duration            text,
    duration_th         text,
    suitable_for        text,
    suitable_for_th     text,
    price_display       text,
    price_display_th    text,
    color_class         text,
    badge               text,
    badge_th            text,
    features            jsonb       not null default '[]',
    is_featured         boolean     not null default false,
    is_active           boolean     not null default true,
    sort_order          integer     not null default 0,
    school_slug         text,
    timetable_config    jsonb,
    meta_title          text,
    meta_description    text,
    hero_banner_url     text,
    curriculum_details  jsonb,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);
create trigger trg_courses_updated_at
    before update on public.courses
    for each row execute function public.handle_updated_at();

-- events
create table public.events (
    id              bigint generated always as identity primary key,
    title_th        text        not null,
    title           text,
    description_th  text,
    description     text,
    event_date      text,
    event_time      text,
    venue_th        text,
    venue           text,
    meet_url        text,
    image_url       text,
    event_type      text        not null default 'seminar',
    cta_text_th     text,
    cta_url         text,
    seats_total     integer,
    seats_remaining integer,
    is_featured     boolean     default false,
    is_active       boolean     default true,
    sort_order      integer     default 0,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create trigger trg_events_updated_at
    before update on public.events
    for each row execute function public.handle_updated_at();

-- event_registrations
create table public.event_registrations (
    id           bigint generated always as identity primary key,
    event_id     bigint      not null references public.events(id) on delete cascade,
    name         text        not null,
    email        text,
    phone        text,
    line_id      text,
    note         text,
    email_sent   boolean     default false,
    registered_at timestamptz not null default now()
);

-- faqs
create table public.faqs (
    id          bigint generated always as identity primary key,
    question    text        not null,
    question_th text        not null,
    answer      text        not null,
    answer_th   text        not null,
    category    text,
    is_active   boolean     not null default true,
    sort_order  integer     not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
create trigger trg_faqs_updated_at
    before update on public.faqs
    for each row execute function public.handle_updated_at();

-- form_submissions
create table public.form_submissions (
    id               bigint generated always as identity primary key,
    type             public.form_type not null,
    name             text        not null,
    email            text        not null,
    phone            text,
    school_interest  text,
    program_interest text,
    start_date       text,
    duration         text,
    budget           text,
    message          text,
    utm_source       text,
    utm_medium       text,
    utm_campaign     text,
    status           public.submission_status not null default 'new',
    admin_notes      text,
    created_at       timestamptz not null default now()
);

-- gallery_items
create table public.gallery_items (
    id          bigint generated always as identity primary key,
    title       text,
    title_th    text,
    image_url   text        not null,
    category    text,
    caption     text,
    caption_th  text,
    is_active   boolean     not null default true,
    sort_order  integer     not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
create trigger trg_gallery_items_updated_at
    before update on public.gallery_items
    for each row execute function public.handle_updated_at();

-- newsletter_campaigns
create table public.newsletter_campaigns (
    id               bigint generated always as identity primary key,
    subject          text        not null,
    body             text        not null,
    sent_at          timestamptz,
    recipient_count  integer     not null default 0,
    status           text        not null default 'draft',
    created_by       text,
    created_at       timestamptz not null default now()
);

-- newsletter_subscribers
create table public.newsletter_subscribers (
    id               bigint generated always as identity primary key,
    email            text        not null unique,
    name             text,
    phone            text,
    line_id          text,
    source           text        not null default 'manual',
    is_active        boolean     not null default true,
    created_at       timestamptz not null default now(),
    unsubscribed_at  timestamptz
);
-- หมายเหตุ: is_active เดิมเป็น text('true'/'false') แก้เป็น boolean แล้ว

-- partners
create table public.partners (
    id          bigint generated always as identity primary key,
    name        text        not null,
    logo_url    text,
    website_url text,
    type        text        not null default 'school',
    is_active   boolean     not null default true,
    sort_order  integer     not null default 0,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);
create trigger trg_partners_updated_at
    before update on public.partners
    for each row execute function public.handle_updated_at();

-- promotions
create table public.promotions (
    id                  bigint generated always as identity primary key,
    title               text        not null,
    title_th            text        not null,
    description         text,
    description_th      text,
    terms               text,
    terms_th            text,
    image_url           text,
    discount_text       text,
    discount_text_th    text,
    original_price_th   text,
    discount_price_th   text,
    bonus_th            text,
    seats_remaining     integer,
    expires_at          timestamptz,
    is_featured         boolean     not null default false,
    is_active           boolean     not null default true,
    sort_order          integer     not null default 0,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);
create trigger trg_promotions_updated_at
    before update on public.promotions
    for each row execute function public.handle_updated_at();

-- schools
create table public.schools (
    id                  bigint generated always as identity primary key,
    slug                text        not null unique,
    name                text        not null,
    name_th             text        not null,
    tagline             text,
    tagline_th          text,
    city                text        not null,
    country             text        not null default 'Philippines',
    logo_url            text,
    cover_image_url     text,
    rating              real        not null default 4.5,
    students_count      text,
    nationality_count   text,
    founded_year        integer,
    description         text,
    description_th      text,
    highlights          jsonb       not null default '[]',
    facilities          jsonb       not null default '[]',
    programs            jsonb       not null default '[]',
    photos              jsonb       not null default '[]',
    youtube_id          text,
    website_url         text,
    map_url             text,
    accent_class        text,
    tags                jsonb       not null default '[]',
    is_featured         boolean     not null default false,
    is_active           boolean     not null default true,
    sort_order          integer     not null default 0,
    pricing_config      jsonb,
    timetable_config    jsonb,
    seo_title           text,
    seo_description     text,
    seo_keywords        text,
    seo_h1_override     text,
    seo_marketing_meta  text,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);
create trigger trg_schools_updated_at
    before update on public.schools
    for each row execute function public.handle_updated_at();

-- seminar_registrations
create table public.seminar_registrations (
    id               bigint generated always as identity primary key,
    event_name       text        not null,
    name             text        not null,
    email            text        not null,
    phone            text        not null,
    school_interest  text,
    program_interest text,
    num_participants text,
    special_requests text,
    utm_source       text,
    utm_medium       text,
    utm_campaign     text,
    status           public.submission_status not null default 'new',
    admin_notes      text,
    created_at       timestamptz not null default now()
);

-- site_settings
create table public.site_settings (
    id         bigint generated always as identity primary key,
    key        text        not null unique,
    value      text,
    "group"    text        not null default 'general',
    label      text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger trg_site_settings_updated_at
    before update on public.site_settings
    for each row execute function public.handle_updated_at();

-- team_members
create table public.team_members (
    id         bigint generated always as identity primary key,
    name       text        not null,
    name_th    text,
    role       text        not null,
    role_th    text,
    bio        text,
    bio_th     text,
    avatar_url text,
    is_active  boolean     not null default true,
    sort_order integer     not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create trigger trg_team_members_updated_at
    before update on public.team_members
    for each row execute function public.handle_updated_at();

-- testimonials
create table public.testimonials (
    id           bigint generated always as identity primary key,
    name         text        not null,
    name_th      text,
    school       text,
    school_th    text,
    program      text,
    score_before text,
    score_after  text,
    content      text        not null,
    content_th   text,
    avatar_url   text,
    initials     text,
    rating       real        not null default 5,
    is_featured  boolean     not null default false,
    is_active    boolean     not null default true,
    sort_order   integer     not null default 0,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);
create trigger trg_testimonials_updated_at
    before update on public.testimonials
    for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (เปิดไว้ — เพิ่ม policy ตาม use case ทีหลัง)
-- ---------------------------------------------------------------------------
alter table public.admin_users          enable row level security;
alter table public.banners              enable row level security;
alter table public.blog_posts           enable row level security;
alter table public.contact_submissions  enable row level security;
alter table public.courses              enable row level security;
alter table public.events               enable row level security;
alter table public.event_registrations  enable row level security;
alter table public.faqs                 enable row level security;
alter table public.form_submissions     enable row level security;
alter table public.gallery_items        enable row level security;
alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.partners             enable row level security;
alter table public.promotions           enable row level security;
alter table public.schools              enable row level security;
alter table public.seminar_registrations enable row level security;
alter table public.site_settings        enable row level security;
alter table public.team_members         enable row level security;
alter table public.testimonials         enable row level security;

-- Policy สาธารณะสำหรับตารางที่ frontend อ่านได้ (read-only public access)
-- ปรับ/ลบตามความต้องการด้านความปลอดภัย
create policy "public_read" on public.banners              for select using (true);
create policy "public_read" on public.blog_posts           for select using (is_published = true);
create policy "public_read" on public.courses              for select using (is_active = true);
create policy "public_read" on public.events               for select using (is_active = true);
create policy "public_read" on public.faqs                 for select using (is_active = true);
create policy "public_read" on public.gallery_items        for select using (is_active = true);
create policy "public_read" on public.partners             for select using (is_active = true);
create policy "public_read" on public.promotions           for select using (is_active = true);
create policy "public_read" on public.schools              for select using (is_active = true);
create policy "public_read" on public.site_settings        for select using (true);
create policy "public_read" on public.team_members         for select using (is_active = true);
create policy "public_read" on public.testimonials         for select using (is_active = true);

-- Policy สำหรับ insert จาก public (form submissions ต่างๆ)
create policy "public_insert" on public.contact_submissions    for insert with check (true);
create policy "public_insert" on public.form_submissions       for insert with check (true);
create policy "public_insert" on public.seminar_registrations  for insert with check (true);
create policy "public_insert" on public.event_registrations    for insert with check (true);
create policy "public_insert" on public.newsletter_subscribers for insert with check (true);

-- ---------------------------------------------------------------------------
-- 5. SEED DATA
-- ---------------------------------------------------------------------------

-- admin_users
-- หมายเหตุ: password_hash เดิม ($2b$12$...) ยังใช้ได้กับ bcrypt
-- แต่ถ้าใช้ Supabase Auth ควรย้ายไปใช้ auth.users แทนในอนาคต
insert into public.admin_users
    (id, email, password_hash, name, role, is_active, last_login_at, created_at, updated_at)
overriding system value
values
    (1, 'admin@philingo.com', '$2b$12$.ZDSkHLbWT6JMfYeQT7PjONf1UCtYv8qydcM7js4397fRhYO/M34W',
     'Philingo Admin', 'superadmin', true,
     '2026-08-09 15:53:18.576+00',
     '2026-07-28 05:50:56.61102+00',
     '2026-07-30 04:11:38.068+00');

-- banners
insert into public.banners
    (id, title, title_th, subtitle, subtitle_th, cta_text, cta_text_th, cta_url,
     image_url, mobile_image_url, is_active, sort_order, created_at, updated_at)
overriding system value
values
    (1, 'Philingo Cebu Online Education Fair 2026', 'งาน Cebu Online Education Fair 2026',
     null, 'สัมมนาออนไลน์ที่รวบรวมโรงเรียนชั้นนำจากเมืองเซบูมาไว้ในงานเดียว ให้คุณได้พูดคุยกับตัวแทนโรงเรียนโดยตรง พร้อมรับข้อมูลล่าสุดเกี่ยวกับหลักสูตร ค่าเรียน ที่พัก และชีวิตการเรียนในเซบู',
     'Register Free', '🎟️ ลงทะเบียนเข้าร่วมงานฟรี', '/seminars',
     '/api/storage/objects/uploads/ecef0246-a0b6-4e20-9fda-6b00e99ae43c', null,
     true, 1,
     '2026-07-29 16:25:34.318731+00', '2026-08-06 14:55:13.431+00');

-- newsletter_subscribers
insert into public.newsletter_subscribers
    (id, email, name, source, is_active, created_at, unsubscribed_at, phone, line_id)
overriding system value
values
    (1, 'philingoedu@gmail.com', 'ทดสอบระบบ', 'contact', true,
     '2026-07-31 07:27:44.781761+00', null, '061-656-4159', null),
    (2, 'info@thaistudyabroad.com', 'อภิชยา มะโนลา', 'contact', true,
     '2026-07-31 07:28:44.221297+00', null, '0956362445', null),
    (6, 'test-seminar-reg@philingo.co.th', 'ทดสอบ ระบบ', 'seminar', true,
     '2026-08-02 04:32:45.064164+00', null, '0812345678', null);

-- form_submissions
insert into public.form_submissions
    (id, type, name, email, phone, message, status, created_at)
overriding system value
values
    (1, 'consult', 'ทดสอบ', '', '0816564159',
     E'LINE ID: @testline\nทดสอบส่งฟอร์มปรึกษา', 'new',
     '2026-07-31 07:37:41.924053+00'),
    (2, 'consult', 'RegrTest', '', '08000',
     null, 'new',
     '2026-07-31 08:01:22.822263+00');

-- ---------------------------------------------------------------------------
-- 6. RESET SEQUENCES (ให้ auto-increment ต่อจาก id สูงสุดที่ insert ไป)
-- ---------------------------------------------------------------------------
select setval(pg_get_serial_sequence('public.admin_users',         'id'), coalesce((select max(id) from public.admin_users),         1));
select setval(pg_get_serial_sequence('public.banners',             'id'), coalesce((select max(id) from public.banners),             1));
select setval(pg_get_serial_sequence('public.blog_posts',          'id'), coalesce((select max(id) from public.blog_posts),          1));
select setval(pg_get_serial_sequence('public.contact_submissions', 'id'), coalesce((select max(id) from public.contact_submissions), 1));
select setval(pg_get_serial_sequence('public.courses',             'id'), coalesce((select max(id) from public.courses),             1));
select setval(pg_get_serial_sequence('public.events',              'id'), coalesce((select max(id) from public.events),              1));
select setval(pg_get_serial_sequence('public.event_registrations', 'id'), coalesce((select max(id) from public.event_registrations), 1));
select setval(pg_get_serial_sequence('public.faqs',                'id'), coalesce((select max(id) from public.faqs),                1));
select setval(pg_get_serial_sequence('public.form_submissions',    'id'), coalesce((select max(id) from public.form_submissions),    1));
select setval(pg_get_serial_sequence('public.gallery_items',       'id'), coalesce((select max(id) from public.gallery_items),       1));
select setval(pg_get_serial_sequence('public.newsletter_campaigns','id'), coalesce((select max(id) from public.newsletter_campaigns),1));
select setval(pg_get_serial_sequence('public.newsletter_subscribers','id'), coalesce((select max(id) from public.newsletter_subscribers),1));
select setval(pg_get_serial_sequence('public.partners',            'id'), coalesce((select max(id) from public.partners),            1));
select setval(pg_get_serial_sequence('public.promotions',          'id'), coalesce((select max(id) from public.promotions),          1));
select setval(pg_get_serial_sequence('public.schools',             'id'), coalesce((select max(id) from public.schools),             1));
select setval(pg_get_serial_sequence('public.seminar_registrations','id'), coalesce((select max(id) from public.seminar_registrations),1));
select setval(pg_get_serial_sequence('public.site_settings',       'id'), coalesce((select max(id) from public.site_settings),       1));
select setval(pg_get_serial_sequence('public.team_members',        'id'), coalesce((select max(id) from public.team_members),        1));
select setval(pg_get_serial_sequence('public.testimonials',        'id'), coalesce((select max(id) from public.testimonials),        1));
