--
-- PostgreSQL database dump
--

\restrict z36hxjdxKacfDQw24mqLqa66nPnzwAahkzoSurrQqKT4Ta9BN0abhqFbDuFyaFc

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

-- Started on 2026-08-06 17:20:40 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 881 (class 1247 OID 16394)
-- Name: form_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.form_type AS ENUM (
    'contact',
    'apply',
    'consult',
    'quotation',
    'scholarship',
    'seminar'
);


--
-- TOC entry 884 (class 1247 OID 16408)
-- Name: submission_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.submission_status AS ENUM (
    'new',
    'in_progress',
    'replied',
    'closed'
);


--
-- TOC entry 878 (class 1247 OID 16386)
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'superadmin',
    'admin',
    'editor'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16418)
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    name text NOT NULL,
    role public.user_role DEFAULT 'editor'::public.user_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 16417)
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3709 (class 0 OID 0)
-- Dependencies: 215
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- TOC entry 228 (class 1259 OID 16518)
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id integer NOT NULL,
    title text,
    title_th text,
    subtitle text,
    subtitle_th text,
    cta_text text,
    cta_text_th text,
    cta_url text,
    image_url text,
    mobile_image_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16517)
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3710 (class 0 OID 0)
-- Dependencies: 227
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- TOC entry 222 (class 1259 OID 16473)
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    title_th text NOT NULL,
    excerpt text,
    excerpt_th text,
    content text,
    content_th text,
    cover_image_url text,
    category text,
    author text,
    author_th text,
    tags jsonb DEFAULT '[]'::jsonb,
    seo_title text,
    seo_description text,
    views integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    seo_keywords text
);


--
-- TOC entry 221 (class 1259 OID 16472)
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3711 (class 0 OID 0)
-- Dependencies: 221
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- TOC entry 238 (class 1259 OID 16585)
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text,
    message text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    ip_address text,
    status public.submission_status DEFAULT 'new'::public.submission_status NOT NULL,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 237 (class 1259 OID 16584)
-- Name: contact_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3712 (class 0 OID 0)
-- Dependencies: 237
-- Name: contact_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_submissions_id_seq OWNED BY public.contact_submissions.id;


--
-- TOC entry 220 (class 1259 OID 16456)
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    title_th text NOT NULL,
    subtitle text,
    subtitle_th text,
    icon_name text,
    description text,
    description_th text,
    duration text,
    duration_th text,
    suitable_for text,
    suitable_for_th text,
    price_display text,
    price_display_th text,
    color_class text,
    badge text,
    badge_th text,
    features jsonb DEFAULT '[]'::jsonb,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    school_slug text,
    timetable_config jsonb DEFAULT 'null'::jsonb,
    meta_title text,
    meta_description text,
    hero_banner_url text,
    curriculum_details jsonb DEFAULT 'null'::jsonb
);


--
-- TOC entry 219 (class 1259 OID 16455)
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3713 (class 0 OID 0)
-- Dependencies: 219
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- TOC entry 253 (class 1259 OID 16676)
-- Name: event_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_registrations (
    id integer NOT NULL,
    event_id integer NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    line_id text,
    note text,
    email_sent boolean DEFAULT false,
    registered_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 252 (class 1259 OID 16675)
-- Name: event_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3714 (class 0 OID 0)
-- Dependencies: 252
-- Name: event_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_registrations_id_seq OWNED BY public.event_registrations.id;


--
-- TOC entry 251 (class 1259 OID 16661)
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title_th text NOT NULL,
    title text,
    description_th text,
    description text,
    event_date text,
    event_time text,
    venue_th text,
    venue text,
    meet_url text,
    image_url text,
    event_type text DEFAULT 'seminar'::text,
    cta_text_th text,
    cta_url text,
    seats_total integer,
    seats_remaining integer,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 16660)
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3715 (class 0 OID 0)
-- Dependencies: 250
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- TOC entry 224 (class 1259 OID 16490)
-- Name: faqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faqs (
    id integer NOT NULL,
    question text NOT NULL,
    question_th text NOT NULL,
    answer text NOT NULL,
    answer_th text NOT NULL,
    category text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16489)
-- Name: faqs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faqs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3716 (class 0 OID 0)
-- Dependencies: 223
-- Name: faqs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faqs_id_seq OWNED BY public.faqs.id;


--
-- TOC entry 240 (class 1259 OID 16596)
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_submissions (
    id integer NOT NULL,
    type public.form_type NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    school_interest text,
    program_interest text,
    start_date text,
    duration text,
    budget text,
    message text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    status public.submission_status DEFAULT 'new'::public.submission_status NOT NULL,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 239 (class 1259 OID 16595)
-- Name: form_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3717 (class 0 OID 0)
-- Dependencies: 239
-- Name: form_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_submissions_id_seq OWNED BY public.form_submissions.id;


--
-- TOC entry 234 (class 1259 OID 16559)
-- Name: gallery_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_items (
    id integer NOT NULL,
    title text,
    title_th text,
    image_url text NOT NULL,
    category text,
    caption text,
    caption_th text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 16558)
-- Name: gallery_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gallery_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3718 (class 0 OID 0)
-- Dependencies: 233
-- Name: gallery_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gallery_items_id_seq OWNED BY public.gallery_items.id;


--
-- TOC entry 247 (class 1259 OID 16633)
-- Name: newsletter_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_campaigns (
    id integer NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    sent_at timestamp without time zone,
    recipient_count integer NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 245 (class 1259 OID 16631)
-- Name: newsletter_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletter_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3719 (class 0 OID 0)
-- Dependencies: 245
-- Name: newsletter_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletter_campaigns_id_seq OWNED BY public.newsletter_campaigns.id;


--
-- TOC entry 246 (class 1259 OID 16632)
-- Name: newsletter_campaigns_recipient_count_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletter_campaigns_recipient_count_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3720 (class 0 OID 0)
-- Dependencies: 246
-- Name: newsletter_campaigns_recipient_count_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletter_campaigns_recipient_count_seq OWNED BY public.newsletter_campaigns.recipient_count;


--
-- TOC entry 249 (class 1259 OID 16645)
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id integer NOT NULL,
    email text NOT NULL,
    name text,
    source text DEFAULT 'manual'::text NOT NULL,
    is_active text DEFAULT 'true'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    unsubscribed_at timestamp without time zone,
    phone text,
    line_id text
);


--
-- TOC entry 248 (class 1259 OID 16644)
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.newsletter_subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3721 (class 0 OID 0)
-- Dependencies: 248
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNED BY public.newsletter_subscribers.id;


--
-- TOC entry 232 (class 1259 OID 16545)
-- Name: partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    name text NOT NULL,
    logo_url text,
    website_url text,
    type text DEFAULT 'school'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 16544)
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3722 (class 0 OID 0)
-- Dependencies: 231
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- TOC entry 230 (class 1259 OID 16531)
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id integer NOT NULL,
    title text NOT NULL,
    title_th text NOT NULL,
    description text,
    description_th text,
    terms text,
    terms_th text,
    image_url text,
    discount_text text,
    discount_text_th text,
    expires_at timestamp without time zone,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    original_price_th text,
    discount_price_th text,
    seats_remaining integer,
    bonus_th text
);


--
-- TOC entry 229 (class 1259 OID 16530)
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3723 (class 0 OID 0)
-- Dependencies: 229
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;


--
-- TOC entry 218 (class 1259 OID 16433)
-- Name: schools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schools (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    name_th text NOT NULL,
    tagline text,
    tagline_th text,
    city text NOT NULL,
    country text DEFAULT 'Philippines'::text NOT NULL,
    logo_url text,
    cover_image_url text,
    rating real DEFAULT 4.5 NOT NULL,
    students_count text,
    nationality_count text,
    founded_year integer,
    description text,
    description_th text,
    highlights jsonb DEFAULT '[]'::jsonb,
    facilities jsonb DEFAULT '[]'::jsonb,
    programs jsonb DEFAULT '[]'::jsonb,
    photos jsonb DEFAULT '[]'::jsonb,
    youtube_id text,
    website_url text,
    map_url text,
    accent_class text,
    tags jsonb DEFAULT '[]'::jsonb,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    pricing_config jsonb DEFAULT 'null'::jsonb,
    timetable_config jsonb DEFAULT 'null'::jsonb,
    seo_title text,
    seo_description text,
    seo_keywords text,
    seo_h1_override text,
    seo_marketing_meta text
);


--
-- TOC entry 217 (class 1259 OID 16432)
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3724 (class 0 OID 0)
-- Dependencies: 217
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- TOC entry 242 (class 1259 OID 16607)
-- Name: seminar_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seminar_registrations (
    id integer NOT NULL,
    event_name text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    school_interest text,
    program_interest text,
    num_participants text,
    special_requests text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    status public.submission_status DEFAULT 'new'::public.submission_status NOT NULL,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 16606)
-- Name: seminar_registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seminar_registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3725 (class 0 OID 0)
-- Dependencies: 241
-- Name: seminar_registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seminar_registrations_id_seq OWNED BY public.seminar_registrations.id;


--
-- TOC entry 244 (class 1259 OID 16618)
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text,
    "group" text DEFAULT 'general'::text NOT NULL,
    label text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 243 (class 1259 OID 16617)
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3726 (class 0 OID 0)
-- Dependencies: 243
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- TOC entry 236 (class 1259 OID 16572)
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    name text NOT NULL,
    name_th text,
    role text NOT NULL,
    role_th text,
    bio text,
    bio_th text,
    avatar_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 16571)
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3727 (class 0 OID 0)
-- Dependencies: 235
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- TOC entry 226 (class 1259 OID 16503)
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id integer NOT NULL,
    name text NOT NULL,
    name_th text,
    school text,
    school_th text,
    program text,
    score_before text,
    score_after text,
    content text NOT NULL,
    content_th text,
    avatar_url text,
    initials text,
    rating real DEFAULT 5 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 16502)
-- Name: testimonials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.testimonials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 3728 (class 0 OID 0)
-- Dependencies: 225
-- Name: testimonials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.testimonials_id_seq OWNED BY public.testimonials.id;


--
-- TOC entry 3365 (class 2604 OID 16421)
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- TOC entry 3413 (class 2604 OID 16521)
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- TOC entry 3394 (class 2604 OID 16476)
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- TOC entry 3440 (class 2604 OID 16588)
-- Name: contact_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions ALTER COLUMN id SET DEFAULT nextval('public.contact_submissions_id_seq'::regclass);


--
-- TOC entry 3385 (class 2604 OID 16459)
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- TOC entry 3468 (class 2604 OID 16679)
-- Name: event_registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations ALTER COLUMN id SET DEFAULT nextval('public.event_registrations_id_seq'::regclass);


--
-- TOC entry 3461 (class 2604 OID 16664)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 3401 (class 2604 OID 16493)
-- Name: faqs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs ALTER COLUMN id SET DEFAULT nextval('public.faqs_id_seq'::regclass);


--
-- TOC entry 3443 (class 2604 OID 16599)
-- Name: form_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_submissions ALTER COLUMN id SET DEFAULT nextval('public.form_submissions_id_seq'::regclass);


--
-- TOC entry 3430 (class 2604 OID 16562)
-- Name: gallery_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items ALTER COLUMN id SET DEFAULT nextval('public.gallery_items_id_seq'::regclass);


--
-- TOC entry 3453 (class 2604 OID 16636)
-- Name: newsletter_campaigns id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_campaigns ALTER COLUMN id SET DEFAULT nextval('public.newsletter_campaigns_id_seq'::regclass);


--
-- TOC entry 3454 (class 2604 OID 16637)
-- Name: newsletter_campaigns recipient_count; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_campaigns ALTER COLUMN recipient_count SET DEFAULT nextval('public.newsletter_campaigns_recipient_count_seq'::regclass);


--
-- TOC entry 3457 (class 2604 OID 16648)
-- Name: newsletter_subscribers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscribers_id_seq'::regclass);


--
-- TOC entry 3424 (class 2604 OID 16548)
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- TOC entry 3418 (class 2604 OID 16534)
-- Name: promotions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);


--
-- TOC entry 3370 (class 2604 OID 16436)
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- TOC entry 3446 (class 2604 OID 16610)
-- Name: seminar_registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seminar_registrations ALTER COLUMN id SET DEFAULT nextval('public.seminar_registrations_id_seq'::regclass);


--
-- TOC entry 3449 (class 2604 OID 16621)
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- TOC entry 3435 (class 2604 OID 16575)
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- TOC entry 3406 (class 2604 OID 16506)
-- Name: testimonials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials ALTER COLUMN id SET DEFAULT nextval('public.testimonials_id_seq'::regclass);


--
-- TOC entry 3666 (class 0 OID 16418)
-- Dependencies: 216
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, password_hash, name, role, is_active, last_login_at, created_at, updated_at) FROM stdin;
1	admin@philingo.com	$2b$12$.ZDSkHLbWT6JMfYeQT7PjONf1UCtYv8qydcM7js4397fRhYO/M34W	Philingo Admin	superadmin	t	2026-08-06 14:55:13.384	2026-07-28 05:50:56.61102	2026-07-30 04:11:38.068
\.


--
-- TOC entry 3678 (class 0 OID 16518)
-- Dependencies: 228
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id, title, title_th, subtitle, subtitle_th, cta_text, cta_text_th, cta_url, image_url, mobile_image_url, is_active, sort_order, created_at, updated_at) FROM stdin;
1	Philingo Cebu Online Education Fair 2026	งาน Cebu Online Education Fair 2026		สัมมนาออนไลน์ที่รวบรวมโรงเรียนชั้นนำจากเมืองเซบูมาไว้ในงานเดียว ให้คุณได้พูดคุยกับตัวแทนโรงเรียนโดยตรง พร้อมรับข้อมูลล่าสุดเกี่ยวกับหลักสูตร ค่าเรียน ที่พัก และชีวิตการเรียนในเซบู	Register Free	🎟️ ลงทะเบียนเข้าร่วมงานฟรี	/seminars	/api/storage/objects/uploads/ecef0246-a0b6-4e20-9fda-6b00e99ae43c	\N	t	1	2026-07-29 16:25:34.318731	2026-08-06 14:55:13.431
\.


--
-- TOC entry 3672 (class 0 OID 16473)
-- Dependencies: 222
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, slug, title, title_th, excerpt, excerpt_th, content, content_th, cover_image_url, category, author, author_th, tags, seo_title, seo_description, views, is_featured, is_published, published_at, created_at, updated_at, seo_keywords) FROM stdin;
2	ielts-vs-toefl-which-is-right	IELTS vs TOEFL: Which Exam is Right for You?	IELTS vs TOEFL: การสอบใดเหมาะกับคุณ?	A comprehensive comparison of IELTS and TOEFL to help you choose the right exam.	การเปรียบเทียบ IELTS และ TOEFL อย่างครอบคลุมเพื่อช่วยคุณเลือกการสอบที่ถูกต้อง	# IELTS vs TOEFL\n\nBoth IELTS and TOEFL are internationally recognized English proficiency tests...	# IELTS vs TOEFL\n\nทั้ง IELTS และ TOEFL เป็นการทดสอบความสามารถภาษาอังกฤษที่ได้รับการยอมรับในระดับสากล...	/api/gallery/image/fetched-1785686060697-rgbhgmt7g09.jpg	Exam Prep	Philingo Team	ทีม Philingo	["IELTS", "TOEFL", "Exam Prep"]			0	t	f	2024-02-01 00:00:00	2026-07-28 05:53:14.688377	2026-08-06 16:00:09.872	
3	cebu-vs-baguio-which-city	Cebu vs Baguio: Which City Should You Study In?	เซบู vs บาเกียว: ควรเรียนที่เมืองไหนดี?	Compare the two most popular cities for English study in the Philippines.	เปรียบเทียบสองเมืองยอดนิยมสำหรับการเรียนภาษาอังกฤษในฟิลิปปินส์	# Cebu vs Baguio\n\nWhen choosing where to study English in the Philippines...	# เซบู vs บาเกียว\n\nเมื่อเลือกที่จะเรียนภาษาอังกฤษในฟิลิปปินส์...	/api/gallery/image/fetched-1785686058056-dso5xbxrqkv.jpg	Destinations	Philingo Team	ทีม Philingo	["Cebu", "Baguio", "Philippines", "Study Abroad"]			0	f	f	2024-02-15 00:00:00	2026-07-28 05:53:14.688377	2026-08-06 16:00:24.453	
1	why-study-english-in-philippines	ทำไมเลือกเรียนต่อเซบู	ทำไมต้องเรียนภาษาอังกฤษในฟิลิปปินส์?	Discover why the Philippines is the top destination for English language learning in Asia.	ค้นพบว่าทำไมฟิลิปปินส์จึงเป็นจุดหมายสูงสุดสำหรับการเรียนภาษาอังกฤษในเอเชีย	# Why Study English in the Philippines?\n\nThe Philippines is one of the top English-speaking countries in Asia...	```html\n<p>เซบูคือจุดหมายอันดับหนึ่งของคนไทยที่อยากพัฒนาภาษาอังกฤษอย่างจริงจัง ด้วยค่าใช้จ่ายรวมค่าเรียนและที่พักเฉลี่ยเพียง <strong>35,000–65,000 บาทต่อเดือน</strong> ถูกกว่าประเทศที่ใช้ภาษาอังกฤษเป็นเจ้าของภาษาอย่างออสเตรเลียหรืออังกฤษถึง 3–5 เท่า และยังได้ฝึกพูดกับครูแบบตัวต่อตัว (One-on-One) มากกว่า 4–6 ชั่วโมงต่อวัน ซึ่งหาไม่ได้จากที่ไหนในโลก</p>\n\n<h2>ทำไมเซบูถึงเป็นตัวเลือกยอดนิยมสำหรับคนไทย?</h2>\n\n<p>เซบู (Cebu) เป็นเมืองใหญ่อันดับสองของฟิลิปปินส์ ตั้งอยู่ทางภาคกลางของประเทศ มีโรงเรียนสอนภาษาอังกฤษสำหรับชาวต่างชาติมากกว่า <strong>50 แห่ง</strong> กระจายอยู่ทั่วเมืองและพื้นที่ใกล้เคียง ทั้งในตัวเมืองเซบู (Cebu City), มันดาอูเอ (Mandaue) และเกาะมักตัน (Mactan Island) นักเรียนชาวเกาหลีและญี่ปุ่นรู้จักเซบูมาก่อนคนไทยมากกว่า 20 ปี แต่ปัจจุบันจำนวนคนไทยที่เดินทางมาเรียนที่เซบูเพิ่มขึ้นต่อเนื่องทุกปี โดยเฉพาะหลังปี 2022 ที่ฟิลิปปินส์เปิดประเทศอีกครั้ง</p>\n\n<p>จุดแข็งที่ทำให้เซบูแตกต่างจากประเทศอื่นคือ <strong>ระบบการเรียนแบบ ESL (English as a Second Language)</strong> ที่ถูกออกแบบมาเพื่อชาวเอเชียโดยเฉพาะ ครูผู้สอนทุกคนเป็นชาวฟิลิปปินส์ที่ผ่านการอบรมการสอนมาเป็นอย่างดี สำเนียงภาษาอังกฤษชัดเจน ฟังง่าย และไม่ดูดกลืนจนเกินไปสำหรับผู้เริ่มต้น</p>\n\n<h2>เรียนที่เซบูค่าใช้จ่ายเท่าไหร่?</h2>\n\n<p>นี่คือคำถามที่คนถามมากที่สุด และคำตอบก็ทำให้หลายคนประหลาดใจเพราะถูกกว่าที่คิดมาก โดยทั่วไปค่าใช้จ่ายแบ่งออกเป็น 2 ส่วนหลัก ได้แก่</p>\n\n<ul>\n  <li><strong>ค่าเรียน (Tuition Fee):</strong> เฉลี่ย 18,000–30,000 บาทต่อ 4 สัปดาห์ ขึ้นอยู่กับโรงเรียนและโปรแกรมที่เลือก</li>\n  <li><strong>ค่าที่พักในโรงเรียน (Dormitory):</strong> รวมอยู่ในแพ็กเกจของหลายโรงเรียน หากแยกคิดจะอยู่ที่ประมาณ 8,000–15,000 บาทต่อเดือน</li>\n  <li><strong>ค่าอาหาร:</strong> หากรวมมื้ออาหาร 3 มื้อในโรงเรียน จะไม่มีค่าใช้จ่ายเพิ่ม แต่หากทานนอกโรงเรียนบ้าง คาดการณ์ไว้ที่ 3,000–6,000 บาทต่อเดือน</li>\n  <li><strong>ค่าใช้จ่ายส่วนตัวและท่องเที่ยว:</strong> ประมาณ 3,000–8,000 บาทต่อเดือน</li>\n  <li><strong>ค่าตั๋วเครื่องบิน:</strong> กรุงเทพฯ–เซบู ราคาตั้งแต่ 4,000–12,000 บาท ขึ้นอยู่กับช่วงเวลาและสายการบิน</li>\n</ul>\n\n<p>รวมทั้งหมดสำหรับการเรียน 1 เดือน คาดการณ์งบประมาณไว้ที่ <strong>35,000–65,000 บาท</strong> หากเรียน 3 เดือน (ซึ่งเป็นระยะที่แนะนำมากที่สุด) จะอยู่ที่ประมาณ <strong>90,000–180,000 บาท</strong> รวมตั๋วเครื่องบินแล้ว ซึ่งยังถูกกว่าเรียนภาษาอังกฤษในออสเตรเลียหรือแคนาดาเพียง 1 เดือนด้วยซ้ำ</p>\n\n<h2>เรียนที่เซบูได้ผลจริงไหม? แตกต่างจากเรียนในไทยอย่างไร?</h2>\n\n<p>คำถามนี้สำคัญมาก และคำตอบคือ <strong>"ได้ผลกว่าอย่างมีนัยสำคัญ"</strong> ด้วยเหตุผลหลักๆ ดังนี้</p>\n\n<ul>\n  <li><strong>Immersion เต็มรูปแบบ:</strong> คุณจะอยู่ในสภาพแวดล้อมที่ต้องใช้ภาษาอังกฤษตลอด 24 ชั่วโมง ตั้งแต่ในห้องเรียน ในโรงอาหาร ไปจนถึงตอนพูดคุยกับเจ้าหน้าที่และเพื่อนร่วมชั้นจากหลากหลายประเทศ</li>\n  <li><strong>One-on-One สูงมาก:</strong> โรงเรียนในเซบูส่วนใหญ่มีคาบเรียนแบบตัวต่อตัวถึง <strong>4–8 คาบต่อวัน</strong> (คาบละ 50 นาที) ซึ่งบังคับให้คุณพูดตลอดเวลา ไม่มีที่ซ่อน</li>\n  <li><strong>ความก้าวหน้าวัดได้:</strong> นักเรียนส่วนใหญ่ที่เรียน 4 สัปดาห์รายงานว่าคะแนน IELTS เพิ่มขึ้นเฉลี่ย 0.5–1.0 band และความมั่นใจในการพูดเพิ่มขึ้นอย่างชัดเจน</li>\n  <li><strong>ไม่มีภาษาไทยล่อแหลม:</strong> เมื่ออยู่ในต่างประเทศโดยไม่มีเพื่อนคนไทยรอบข้าง สมองถูกบังคับให้ประมวลผลด้วยภาษาอังกฤษโดยอัตโนมัติ</li>\n</ul>\n\n<h2>โรงเรียนสอนภาษาในเซบูที่ได้รับความนิยมมีอะไรบ้าง?</h2>\n\n<p>เซบูมีโรงเรียนให้เลือกหลากหลายสไตล์ ตั้งแต่โรงเรียนขนาดเล็กแบบส่วนตัว ไปจนถึงสถาบันขนาดใหญ่ที่มีนักเรียนนับร้อยคน โรงเรียนที่ได้รับความนิยมในกลุ่มคนไทย ได้แก่</p>\n\n<ul>\n  <li><strong>PINES (Philippine International English School):</strong> หนึ่งในโรงเรียนที่ใหญ่และเก่าแก่ที่สุดในเซบู มีนักเรียนมากกว่า 500 คนในแต่ละเดือน เหมาะสำหรับคนที่อยากสังคมและพบเพื่อนจากหลายประเทศ</li>\n  <li><strong>Baguio JIC / Cebu JIC:</strong> โรงเรียนสัญชาติเกาหลีที่มีชื่อเสียงด้านความเข้มงวดและคุณภาพการสอน</li>\n  <li><strong>CIA (Center for International Arts):</strong> เน้นโปรแกรมเตรียมสอบ IELTS และ TOEFL โดยเฉพาะ</li>\n  <li><strong>Lexis English Cebu:</strong> โรงเรียนสัญชาติออสเตรเลียที่มีสไตล์การเรียนแบบตะวันตกมากกว่า เหมาะสำหรับคนที่ต้องการต่อยอดไปออสเตรเลีย</li>\n</ul>\n\n<p>การเลือกโรงเรียนที่ใช่นั้นขึ้นอยู่กับเป้าหมายของแต่ละคนซึ่งแตกต่างกันมาก การปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจจะช่วยให้คุณไม่เสียเงินและเสียเวลาโดยเปล่าประโยชน์</p>\n\n<h2>เซบูปลอดภัยและน่าอยู่แค่ไหน?</h2>\n\n<p>เซบูเป็นเมืองที่มีความปลอดภัยระดับดีสำหรับนักเรียนต่างชาติ โดยเฉพาะในพื้นที่แถบ <strong>IT Park, Cebu Business Park และ Mandaue</strong> ที่มีโรงเรียนภาษาส่วนใหญ่ตั้งอยู่ พื้นที่เหล่านี้มีห้างสรรพสินค้า ร้านอาหาร คาเฟ่ และสิ่งอำนวยความสะดวกครบครัน</p>\n\n<p>สภาพอากาศเซบูอยู่ในช่วง <strong>24–34 องศาเซลเซียส</strong> ตลอดทั้งปี คล้ายกับเมืองไทย ทำให้คนไทยปรับตัวได้ง่าย และยังมีหาดทรายสวยงามอย่าง <strong>Mactan Island</strong> ให้ผ่อนคลายในวันหยุดสุดสัปดาห์ด้วย สายการบินหลายสายมีเที่ยวบินตรงจากกรุงเทพฯ (สุวรรณภูมิ/ดอนเมือง) ไปเซบูใช้เวลาเพียง <strong>3.5–4 ชั่วโมง</strong></p>\n\n<h2>สรุป: เซบูตอบโจทย์ใครบ้าง?</h2>\n\n<p>เซบูเหมาะสมอย่างยิ่งสำหรับคนที่ต้องการพัฒนาภาษาอังกฤษอย่างเข้มข้นในระยะเวลาสั้น ด้วยงบประมาณที่จัดการได้ ไม่ว่าจะเป็นนักศึกษาที่กำลังเตรียมสอบ IELTS เพื่อเรียนต่อต่างประเทศ, คนทำงานที่ต้องการอัปสกิลด้านภาษาอังกฤษธุรกิจ หรือใครก็ตามที่อยากได้ประสบการณ์ต่างแดนในราคาที่ไม่ต้องกู้ธนาคาร ทางเลือกที่ดีที่สุดคือการวางแผนให้ดีตั้งแต่ต้น เลือกโรงเรียนให้ตรงกับเป้าหมาย และเตรียมตัวให้พร้อมก่อนเดินทาง</p>\n\n<p>หากคุณยังไม่แน่ใจว่าควรเรียนที่ไหน นานแค่ไหน หรือโรงเรียนไหนเหมาะกับคุณ <strong>Philingo by Thai Study Abroad Consultant</strong> พร้อมให้คำปรึกษาฟรีโดยทีมผู้เชี่ยวชาญที่มีประสบการณ์ส่งนักเรียนไทยไปเซบูมามากกว่า 500 คน ติดต่อได้เลยวันนี้เพื่อรับแผนการเรียนที่ออกแบบมาเฉพาะสำหรับคุณ</p>\n```\n\n---\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: เรียนภาษาอังกฤษที่เซบูใช้เวลานานแค่ไหนถึงจะเห็นผล?\n\nA: ระยะเวลาขั้นต่ำที่แนะนำคือ 4 สัปดาห์ แต่ระยะที่เห็นผลชัดเจนที่สุดคือ 8–12 สัปดาห์ เนื่องจากสมองต้องการเวลาปรับตัวกับสภาพแวดล้อมภาษาอังกฤษเต็มรูปแบบในช่วง 1–2 สัปดาห์แรก และจะเริ่มพัฒนาอย่างก้าวกระโดดในสัปดาห์ที่ 3 เป็นต้นไป นักเรียนส่วนใหญ่ที่เรียน 3 เดือนรายงานว่าความมั่นใจในการสื่อสารเพิ่มขึ้นมากกว่า 70%\n\nQ: ต้องมีพื้นฐานภาษาอังกฤษก่อนไหมถึงจะไปเรียนที่เซบูได้?\n\nA: ไม่จำเป็นต้องมีพื้นฐานสูง โรงเรียนในเซบูรับนักเรียนทุกระดับตั้งแต่ Beginner จนถึง Advanced โดยจะมีการทดสอบระดับ (Placement Test) ในวันแรกเพื่อจัดห้องเรียนให้เหมาะสมกับแต่ละคน แม้แต่ผู้ที่แทบไม่เคยพูดภาษาอังกฤษก็สามารถเรียนได้และเห็นพัฒนาการอย่างชัดเจนภายใน 4–8 สัปดาห์\n\nQ: เซบูกับบาเกียว (Baguio) ต่างกันอย่างไร ควรเลือกที่ไหน?\n\nA: เซบูเป็นเมืองชายทะเลที่ใหญ่กว่า อากาศร้อนคล้ายไทย มีความบันเทิงและสิ่งอำนวยความสะดวกมากกว่า เหมาะกับคนที่อยากมีประสบการณ์เมืองและชอบท่องเที่ยวในวันหยุด ส่วนบาเกียวเป็นเมืองบนภูเขาที่เงียบสงบ อากาศเย็นกว่า (18–24 องศา) เหมาะกับคนที่ต้องการโฟกัสการเรียนอย่างเดียวโดยไม่มีสิ่งรบกวน การเลือกขึ้นอยู่กับสไตล์ชีวิตและเป้าหมายส่วนตัว\n\nQ: วีซ่าเรียนภาษาที่ฟิลิปปินส์ต้องทำอะไรบ้าง?\n\nA: คนไทยสามารถเข้าฟิลิปปินส์ได้โดยไม่ต้องขอวีซ่าล่วงหน้า (Visa-on-Arrival) ได้สูงสุด 30 วัน หากต้องการเรียนนานกว่านั้น สามารถต่ออายุวีซ่าได้ที่ Bureau of Immigration ในเซบู ครั้งละ 1–2 เดือน ค่าธรรมเนียมประมาณ 1,500–3,000 บาทต่อครั้ง หรือโรงเรียนบางแห่งจะช่วยดำเนินการขอ SSP (Special Study Permit) ให้โดยอัตโนมัติ	/api/storage/objects/uploads/2963a0d8-b6c0-467a-920b-befac9af1db3	other	Philingo Team	ทีม Philingo	["Philippines", "English Learning", "Study Abroad"]	ทำไมเลือกเรียนต่อเซบู? ค่าใช้จ่ายและข้อดีครบ	เรียนภาษาอังกฤษที่เซบู ฟิลิปปินส์ ค่าใช้จ่ายเพียง 35,000–65,000 บาท/เดือน เรียนแบบตัวต่อตัวมากกว่า 4–6 ชั่วโมง/วัน ถูกกว่าออสเตรเลีย 3–5 เท่า เริ่มต้นวางแผนได้เลย	0	t	t	2024-01-15 00:00:00	2026-07-28 05:53:14.688377	2026-08-06 16:04:53.594	เรียนต่อเซบู, เรียนภาษาอังกฤษฟิลิปปินส์, เรียนภาษาอังกฤษเซบู, ESL เซบู, ค่าเรียนเซบู, โรงเรียนภาษาอังกฤษเซบู, เรียนต่อฟิลิปปินส์, เรียนภาษาอังกฤษต่างประเทศ, เรียน one on one เซบู, ค่าใช้จ่ายเรียนเซบู, ภาษาอังกฤษราคาถูก, เรียนภาษาอังกฤษคนไทย
7	review-cia-cebu-4-weeks	รีวิวเรียน CIA Cebu 4 สัปดาห์ ได้ผลจริงไหม?	รีวิวเรียน CIA Cebu 4 สัปดาห์ ได้ผลจริงไหม?		ประสบการณ์เรียน CIA 4 สัปดาห์ IELTS เพิ่มขึ้น 1 band		<p><strong>เรียน CIA Cebu 4 สัปดาห์ได้ผลจริงไหม?</strong> คำตอบสั้นๆ คือ <strong>ได้ผลดีมาก</strong> โดยเฉพาะถ้าคุณเข้าคอร์สแบบ Intensive 1-on-1 ที่มีชั่วโมงเรียนตัวต่อตัวสูงถึง 4–6 ชั่วโมงต่อวัน งบประมาณรวมค่าเรียน ที่พักในหอ และค่าอาหารอยู่ที่ประมาณ <strong>55,000–75,000 บาท</strong> สำหรับ 4 สัปดาห์ ซึ่งถือว่าคุ้มค่าเมื่อเทียบกับผลลัพธ์ที่ได้รับ โดยเฉพาะสำหรับคนที่ต้องการพัฒนาภาษาอังกฤษแบบก้าวกระโดดในเวลาจำกัด</p>\n\n<h2>CIA Cebu คืออะไร และทำไมคนไทยถึงนิยมเรียนที่นี่?</h2>\n\n<p>CIA Cebu หรือชื่อเต็มว่า <strong>Center for Intensive English Studies</strong> ตั้งอยู่ที่ <strong>เมืองเซบู ประเทศฟิลิปปินส์</strong> เป็นหนึ่งในโรงเรียนสอนภาษาอังกฤษที่ได้รับความนิยมสูงสุดในฟิลิปปินส์ โรงเรียนแห่งนี้โดดเด่นด้วยระบบการสอนแบบ <strong>Filipino ESL</strong> ซึ่งเน้นการเรียนตัวต่อตัว (1-on-1 Class) สูงมากกว่าโรงเรียนทั่วไปในเกาหลีหรือญี่ปุ่น</p>\n\n<p>สาเหตุที่คนไทยนิยมมาเรียนที่ CIA Cebu มีหลายอย่าง ได้แก่</p>\n\n<ul>\n  <li>ค่าใช้จ่ายถูกกว่าการเรียนในประเทศตะวันตกถึง <strong>60–70%</strong></li>\n  <li>อาจารย์ชาวฟิลิปปินส์มีสำเนียงที่ฟังง่าย เหมาะสำหรับผู้เริ่มต้น</li>\n  <li>มีระบบ <strong>No Korean Policy</strong> บางช่วง ทำให้บรรยากาศในห้องเรียนหลากหลาย</li>\n  <li>ตารางเรียนแน่น แต่มีวินัยสูง เหมาะกับคนที่อยากเห็นผลเร็ว</li>\n  <li>สภาพแวดล้อมดี มีสิ่งอำนวยความสะดวกครบครัน รวมถึงสระว่ายน้ำและห้องออกกำลังกาย</li>\n</ul>\n\n<h2>ตารางเรียน 4 สัปดาห์ที่ CIA Cebu เป็นอย่างไร?</h2>\n\n<p>หนึ่งในสิ่งที่ทำให้ CIA Cebu โดดเด่นคือ <strong>ชั่วโมงเรียนที่หนักมาก</strong> วันธรรมดานักเรียนจะเรียนเฉลี่ย <strong>8–10 ชั่วโมงต่อวัน</strong> โดยแบ่งเป็นการเรียนแบบตัวต่อตัวและแบบกลุ่ม ตารางโดยทั่วไปเป็นดังนี้</p>\n\n<ul>\n  <li><strong>07:00–08:00 น.</strong> — อาหารเช้า</li>\n  <li><strong>08:00–12:00 น.</strong> — เรียน 1-on-1 (ประมาณ 4 คาบ คาบละ 50 นาที)</li>\n  <li><strong>12:00–13:00 น.</strong> — พักกลางวัน</li>\n  <li><strong>13:00–17:00 น.</strong> — เรียนแบบกลุ่ม Group Class และ Activity</li>\n  <li><strong>19:00–21:00 น.</strong> — Self-Study หรือ Evening Program</li>\n</ul>\n\n<p>ใน 4 สัปดาห์ คุณจะได้ชั่วโมงเรียนรวมทั้งหมดไม่ต่ำกว่า <strong>160–200 ชั่วโมง</strong> ซึ่งเทียบเท่ากับการเรียนภาษาอังกฤษในประเทศไทยมากกว่า 6 เดือนถ้าเรียนแบบสัปดาห์ละ 2–3 ชั่วโมง</p>\n\n<h2>ค่าใช้จ่ายเรียน CIA Cebu 4 สัปดาห์ รวมกันเท่าไหร่?</h2>\n\n<p>นี่คือส่วนที่คนไทยถามมากที่สุด ขอแจกแจงค่าใช้จ่ายทั้งหมดแบบละเอียดเลย</p>\n\n<ul>\n  <li><strong>ค่าเรียน (คอร์ส Intensive 1-on-1)</strong> — ประมาณ <strong>28,000–35,000 บาท</strong> ต่อ 4 สัปดาห์</li>\n  <li><strong>ค่าที่พักในหอพักโรงเรียน (รวมอาหาร 3 มื้อ)</strong> — ประมาณ <strong>15,000–20,000 บาท</strong> ต่อ 4 สัปดาห์</li>\n  <li><strong>ค่าตั๋วเครื่องบิน ไทย–เซบู (ไป-กลับ)</strong> — ประมาณ <strong>8,000–12,000 บาท</strong></li>\n  <li><strong>ค่าใช้จ่ายส่วนตัว, ท่องเที่ยว, ช้อปปิ้ง</strong> — ประมาณ <strong>5,000–8,000 บาท</strong></li>\n  <li><strong>ค่า VISA (30 วันฟรีสำหรับคนไทย)</strong> — <strong>0 บาท</strong></li>\n</ul>\n\n<p><strong>รวมทั้งหมดประมาณ 56,000–75,000 บาท</strong> สำหรับ 4 สัปดาห์ ซึ่งถือว่าอยู่ในระดับกลางเมื่อเทียบกับโรงเรียนอื่นในเซบู และยังถูกกว่าการเรียนภาษาที่ออสเตรเลียหรืออังกฤษหลายเท่าตัว</p>\n\n<h2>ได้ผลจริงไหม? รีวิวจากผู้เรียนชาวไทย</h2>\n\n<p>จากประสบการณ์ของนักเรียนไทยหลายร้อยคนที่ผ่านโปรแกรม CIA Cebu สามารถสรุปผลได้ดังนี้</p>\n\n<ul>\n  <li><strong>ทักษะการพูดและฟัง</strong> — พัฒนาชัดเจนที่สุด เพราะเรียนตัวต่อตัวทุกวัน หลายคนรายงานว่าฟังสำเนียงต่างๆ ได้คล่องขึ้นมากภายใน <strong>2–3 สัปดาห์</strong></li>\n  <li><strong>ทักษะการเขียนและไวยากรณ์</strong> — พัฒนาปานกลาง ต้องใช้เวลามากกว่า 4 สัปดาห์เพื่อเห็นผลลัพธ์ที่ชัดเจน</li>\n  <li><strong>คะแนน IELTS/TOEIC</strong> — นักเรียนหลายคนรายงานว่าคะแนน TOEIC เพิ่มขึ้น <strong>50–150 คะแนน</strong> หลังเรียน 4 สัปดาห์ ขึ้นอยู่กับพื้นฐานเดิม</li>\n  <li><strong>ความมั่นใจในการสื่อสาร</strong> — เกือบ <strong>90%</strong> ของนักเรียนบอกว่ากล้าพูดภาษาอังกฤษมากขึ้นอย่างเห็นได้ชัด</li>\n</ul>\n\n<p>อย่างไรก็ตาม ผลลัพธ์ขึ้นอยู่กับ <strong>ความตั้งใจของผู้เรียนเป็นอย่างมาก</strong> โรงเรียนมีกฎห้ามพูดภาษาแม่ในพื้นที่ส่วนกลาง (English Only Zone) เพื่อบังคับให้นักเรียนฝึกภาษาอังกฤษตลอดเวลา คนที่ปฏิบัติตามกฎอย่างเคร่งครัดมักได้ผลดีกว่าคนที่หลีกเลี่ยงกฎอย่างชัดเจน</p>\n\n<h2>CIA Cebu เหมาะกับใคร และไม่เหมาะกับใคร?</h2>\n\n<p><strong>เหมาะกับ:</strong></p>\n<ul>\n  <li>คนที่ต้องการพัฒนาภาษาอังกฤษแบบเข้มข้นในเวลาสั้น</li>\n  <li>คนที่เตรียมสอบ IELTS, TOEIC, TOEFL และต้องการ Intensive Practice</li>\n  <li>คนทำงานที่มีวันหยุดจำกัดแต่อยากเห็นผลเร็ว</li>\n  <li>นักเรียน/นักศึกษาที่ต้องการเตรียมตัวก่อนเรียนต่อต่างประเทศ</li>\n  <li>คนที่มีงบ <strong>55,000–75,000 บาท</strong> และพร้อมลงทุนกับตัวเอง</li>\n</ul>\n\n<p><strong>ไม่เหมาะกับ:</strong></p>\n<ul>\n  <li>คนที่ต้องการไปพักผ่อนเป็นหลัก เพราะตารางเรียนหนักมาก</li>\n  <li>คนที่ไม่มีวินัยในตัวเอง เพราะผลลัพธ์จะน้อยกว่าที่หวัง</li>\n  <li>คนที่คาดหวังว่าภาษาจะดีขึ้น 100% ใน 4 สัปดาห์ ต้องใช้เวลามากกว่านั้นสำหรับ Fluency เต็มรูปแบบ</li>\n</ul>\n\n<h2>สรุป: เรียน CIA Cebu 4 สัปดาห์คุ้มค่าแค่ไหน?</h2>\n\n<p>สรุปแล้ว <strong>CIA Cebu เป็นตัวเลือกที่ดีมากสำหรับคนไทยที่ต้องการพัฒนาภาษาอังกฤษอย่างจริงจัง</strong> ในราคาที่จับต้องได้ ด้วยงบประมาณรวมประมาณ <strong>56,000–75,000 บาท</strong> คุณจะได้ชั่วโมงเรียนกว่า <strong>160–200 ชั่วโมง</strong> ในระยะเวลาเพียง 4 สัปดาห์ ซึ่งสั้นกว่าแต่เข้มข้นกว่าการเรียนแบบปกติในไทยหลายเท่า ผลลัพธ์ที่คุณจะได้รับแน่นอนคือความมั่นใจในการสื่อสาร ทักษะการฟังที่ดีขึ้น และ Mindset ในการใช้ภาษาอังกฤษที่เปลี่ยนไปอย่างถาวร</p>\n\n<p>หากคุณสนใจเรียนที่ CIA Cebu หรืออยากเปรียบเทียบกับโรงเรียนอื่นในเซบู สามารถติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> เพื่อขอคำปรึกษาฟรีได้เลย ทีมงานของเรามีประสบการณ์ส่งนักเรียนไทยไปฟิลิปปินส์มาแล้วกว่า <strong>500+ คน</strong> พร้อมช่วยเลือกโรงเรียน คอร์ส และวางแผนงบประมาณให้เหมาะกับคุณโดยเฉพาะ ไม่มีค่าใช้จ่ายในการปรึกษา</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: เรียน CIA Cebu 4 สัปดาห์ค่าใช้จ่ายรวมเท่าไหร่?\nA: ค่าใช้จ่ายรวมทั้งหมดสำหรับ 4 สัปดาห์อยู่ที่ประมาณ 56,000–75,000 บาท รวมค่าเรียน ค่าที่พักพร้อมอาหาร 3 มื้อ และตั๋วเครื่องบินไป-กลับ ส่วนค่าใช้จ่ายส่วนตัวและท่องเที่ยวอีกประมาณ 5,000–8,000 บาท คนไทยไม่ต้องทำวีซ่าสำหรับการพำนักไม่เกิน 30 วัน\n\nQ: CIA Cebu เรียนหนักแค่ไหน เหมาะกับมือใหม่ไหม?\nA: CIA Cebu มีตารางเรียนเฉลี่ย 8–10 ชั่วโมงต่อวัน ถือว่าหนักมากเมื่อเทียบกับโรงเรียนทั่วไป แต่มีคอร์สสำหรับทุกระดับตั้งแต่ Beginner ถึง Advanced ดังนั้นมือใหม่สามารถเข้าเรียนได้เลย โดยจะได้รับการทดสอบระดับ (Placement Test) ก่อนเริ่มเรียนเสมอ\n\nQ: เรียนที่ CIA Cebu 4 สัปดาห์ คะแนน TOEIC จะขึ้นไหม?\nA: หลายคนรายงานว่าคะแนน TOEIC เพิ่มขึ้น 50–150 คะแนนหลังเรียน 4 สัปดาห์ ขึ้นอยู่กับพื้นฐานเดิมและความพยายามของผู้เรียน หากต้องการเตรียมสอบโดยเฉพาะ ควรแจ้งโรงเรียนเพื่อเลือกคอร์ส TOEIC Preparation ที่เน้น Test Strategy โดยตรง\n\nQ: ที่พักของ CIA Cebu เป็นอย่างไร รวมอาหารไหม?\nA: ที่พักภายในหอพักของโรงเรียนรวมอาหาร 3 มื้อต่อวัน มีทั้งห้องพักเดี่ยวและห้องพักคู่ ค่าที่พักรวมอาหารอยู่ที่ประมาณ 15,000–20,000 บาทต่อ 4 สัปดาห์ โรงเรียนยังมีสิ่งอำนวยความสะดวกเพิ่มเติม เช่น สระว่ายน้ำ ห้องออกกำลังกาย และร้านสะดวกซื้อในบริเวณโรงเรียน	/api/storage/objects/uploads/704367ef-cdd5-4140-b1e9-dfa6300151d7	review	Philingo Team	น้องฟ้า · CIA 4 สัปดาห์	["CIA", "IELTS", "Cebu"]			0	f	t	2026-08-03 06:34:10.497	2026-07-31 07:50:38.459464	2026-08-03 06:34:11.55	
11	review-ibreeze-cebu-8-weeks	Review I.BREEZE Cebu 8 Weeks — Hidden Gem?	รีวิวเรียน I.BREEZE เซบู 8 สัปดาห์ สถาบันซ่อนเร้นที่น่าสนใจ		รีวิว I.BREEZE เซบู 8 สัปดาห์ สถาบันเล็กๆ ที่นักเรียนไทยชื่นชอบ		<h2>ทำไมเลือก I.BREEZE?</h2><p>I.BREEZE ไม่ค่อยดังเท่าสถาบันใหญ่ แต่ได้รับคำแนะนำจากรุ่นพี่หลายคน จุดเด่นคือครูเป็นกันเอง บรรยากาศไม่เครียด และนักเรียนไทยเยอะทำให้ปรับตัวง่าย</p><h2>โปรแกรมและครู</h2><p>เรียน 6-8 ชั่วโมง/วัน คลาส Group เล็กมาก (3-5 คน) ครูอธิบายละเอียด ไม่รีบ ดีสำหรับคนที่กลัวพูดภาษาอังกฤษ</p><h2>ผลลัพธ์</h2><p>TOEIC เพิ่มจาก 450 → 620 คะแนน ความมั่นใจในการสนทนาเพิ่มขึ้นมาก ราคาถูกกว่าสถาบันใหญ่ประมาณ 20-30% แนะนำสำหรับมือใหม่</p>	/api/storage/objects/uploads/632ec127-61bf-416a-951e-8c28e4bdfaa6	review	Philingo Team	น้องตาล · I.BREEZE 8 สัปดาห์	["I.BREEZE", "TOEIC", "Cebu", "Beginner"]			0	f	t	2026-08-03 06:29:46.386	2026-08-01 02:43:09.861765	2026-08-03 06:29:47.442	
12	review-smeag-cebu-10-weeks	Review SMEAG Cebu 10 Weeks — Premium School	รีวิวเรียน SMEAG เซบู 10 สัปดาห์ โรงเรียน Premium คุ้มค่าไหม?		รีวิว SMEAG เซบู 10 สัปดาห์ สถาบันใหญ่ระดับ Premium ราคาสูงแต่ได้อะไรบ้าง?		<h2>ทำไมเลือก SMEAG?</h2><p>SMEAG เป็นสถาบันขนาดใหญ่มีนักเรียนหลายร้อยคน สิ่งอำนวยความสะดวกครบครัน มีสระว่ายน้ำ ฟิตเนส ร้านสะดวกซื้อในสถาบัน ตัดสินใจเลือกเพราะต้องการประสบการณ์ครบวงจร</p><h2>คลาสและระบบ</h2><p>ระบบจัดการดีมาก มีแอปติดตามความก้าวหน้า คลาส 1-on-1 กับครูฟิลิปปินส์ที่ผ่านการฝึกมาแล้ว Group class แบ่งตาม Level ชัดเจน</p><h2>ผลลัพธ์</h2><p>Grammar และ Writing ดีขึ้นมาก IELTS จาก 6.0 → 6.5 ราคาสูงแต่ได้คุณภาพตามที่จ่าย เหมาะกับคนที่ budget ไม่จำกัดและต้องการสิ่งอำนวยความสะดวกครบ</p>	/api/storage/objects/uploads/8006d52a-09c5-428d-8fd9-c4ed6ffe976b	review	Philingo Team	พี่เอิร์ธ · SMEAG 10 สัปดาห์	["SMEAG", "IELTS", "Cebu", "Premium"]			0	t	t	2026-08-03 06:33:17.759	2026-08-01 02:43:09.861765	2026-08-03 06:33:18.86	
27	airlines-thailand-to-cebu	สายการบินที่บินตรงจากไทยไปเซบู ฟิลิปปินส์ เปรียบเทียบราคาและเวลาบิน	สายการบินที่บินตรงจากไทยไปเซบู ฟิลิปปินส์ เปรียบเทียบราคาและเวลาบิน	อยากบินตรงจากไทยไปเซบู ฟิลิปปินส์ 	\N	\N	<p>ถ้าอยากบินตรงจากไทยไปเซบู ฟิลิปปินส์ ตอนนี้มีสายการบินที่ให้บริการเส้นทางนี้อยู่ <strong>2-3 สายการบินหลัก</strong> ได้แก่ Cebu Pacific, Philippines AirAsia และ Philippine Airlines โดยราคาตั๋วเริ่มต้นที่ประมาณ <strong>3,500–15,000 บาท</strong> ขึ้นอยู่กับช่วงเวลาจองและสายการบินที่เลือก ระยะเวลาบินอยู่ที่ราว <strong>2 ชั่วโมง 45 นาที ถึง 3 ชั่วโมง 10 นาที</strong> เหมาะอย่างยิ่งสำหรับใครที่วางแผนไปเรียนภาษาอังกฤษที่เซบูหรือท่องเที่ยวระยะสั้น</p>\n\n<h2>สายการบินไหนบินตรงกรุงเทพ–เซบูได้บ้าง?</h2>\n\n<p>เส้นทางบินตรงจากกรุงเทพฯ ไปเซบู (Mactan-Cebu International Airport, รหัส CEB) ในปัจจุบันให้บริการจากสนามบินสุวรรณภูมิ (BKK) เป็นหลัก มีสายการบินที่น่าสนใจดังนี้</p>\n\n<h3>1. Cebu Pacific (5J)</h3>\n<p>สายการบิน Low-Cost สัญชาติฟิลิปปินส์ที่คนไทยนิยมมากที่สุดสำหรับเส้นทางนี้ <strong>บินตรงสุวรรณภูมิ–เซบู</strong> ความถี่เที่ยวบินประมาณ <strong>7 เที่ยว/สัปดาห์</strong> ราคาตั๋วเริ่มต้นช่วงโปรโมชัน <strong>3,500–5,000 บาท (ไป-กลับ)</strong> และราคาปกติอยู่ที่ <strong>7,000–12,000 บาท</strong> ระยะเวลาบินประมาณ <strong>2 ชั่วโมง 55 นาที</strong> จุดเด่นคือราคาถูกและมีโปรฯ Flash Sale บ่อยมาก แต่ต้องระวังค่าน้ำหนักกระเป๋าและอาหารที่คิดแยกต่างหาก</p>\n\n<h3>2. Philippines AirAsia (Z2)</h3>\n<p>อีกหนึ่งตัวเลือก Low-Cost ที่ให้บริการเส้นทาง <strong>สุวรรณภูมิ–เซบู</strong> ความถี่ประมาณ <strong>5–7 เที่ยว/สัปดาห์</strong> ราคาตั๋วเริ่มต้นที่ <strong>4,000–6,500 บาท (ไป-กลับ)</strong> ช่วงโปรโมชัน ราคาปกติอยู่ที่ <strong>8,000–13,000 บาท</strong> ระยะเวลาบินประมาณ <strong>3 ชั่วโมง 5 นาที</strong> ข้อดีคืออินเทอร์เฟซการจองเชื่อมกับแอป AirAsia ที่คนไทยคุ้นเคยได้เลย</p>\n\n<h3>3. Philippine Airlines (PR)</h3>\n<p>สายการบินแห่งชาติฟิลิปปินส์ ให้บริการเส้นทาง <strong>สุวรรณภูมิ–เซบู</strong> ในระดับ Full-Service ราคาตั๋วสูงกว่าเล็กน้อย เริ่มต้นที่ <strong>8,000–15,000 บาท (ไป-กลับ)</strong> แต่รวมน้ำหนักกระเป๋า <strong>23–30 กก.</strong> และอาหารบนเครื่องไว้แล้ว ระยะเวลาบินประมาณ <strong>2 ชั่วโมง 50 นาที</strong> เหมาะสำหรับผู้ที่ต้องการพกกระเป๋าหนักไปเรียนระยะยาว เช่น หลักสูตร 8–12 สัปดาห์</p>\n\n<h2>เปรียบเทียบราคาและเวลาบินแต่ละสายการบินแบบชัดๆ</h2>\n\n<p>ตารางเปรียบเทียบด้านล่างนี้ช่วยให้คุณตัดสินใจได้ง่ายขึ้น โดยอ้างอิงราคาเฉลี่ยช่วงกลางปี (ไม่ใช่ช่วง Flash Sale และไม่ใช่ช่วง High Season)</p>\n\n<ul>\n  <li><strong>Cebu Pacific:</strong> ราคาไป-กลับเฉลี่ย 7,000–10,000 บาท | เวลาบิน ~2 ชั่วโมง 55 นาที | กระเป๋าซื้อเพิ่ม 20 กก. ราคา ~700–1,200 บาท</li>\n  <li><strong>Philippines AirAsia:</strong> ราคาไป-กลับเฉลี่ย 8,000–11,000 บาท | เวลาบิน ~3 ชั่วโมง 5 นาที | กระเป๋าซื้อเพิ่ม 20 กก. ราคา ~800–1,500 บาท</li>\n  <li><strong>Philippine Airlines:</strong> ราคาไป-กลับเฉลี่ย 10,000–15,000 บาท | เวลาบิน ~2 ชั่วโมง 50 นาที | รวมกระเป๋า 23 กก. + อาหารแล้ว</li>\n</ul>\n\n<p>หากคุณพกของน้อยและต้องการประหยัดสูงสุด <strong>Cebu Pacific</strong> คือคำตอบ แต่ถ้าแบกกระเป๋าหนักไปเรียนนาน 1–3 เดือน <strong>Philippine Airlines</strong> อาจคุ้มกว่าเมื่อรวมค่ากระเป๋าแล้ว</p>\n\n<h2>ช่วงเวลาไหนซื้อตั๋วถูกที่สุด?</h2>\n\n<p>ราคาตั๋วบินจากไทยไปเซบูแปรผันตามฤดูกาลและช่วงโปรโมชันค่อนข้างมาก ควรรู้จักจังหวะซื้อดังนี้</p>\n\n<ul>\n  <li><strong>ถูกที่สุด:</strong> ช่วง Low Season ของฟิลิปปินส์ คือ <strong>มิถุนายน–กันยายน</strong> (ฤดูฝน) ราคาตั๋วอาจลดลงได้ถึง <strong>30–40%</strong> เมื่อเทียบกับช่วง Peak Season</li>\n  <li><strong>ปานกลาง:</strong> ช่วง <strong>ตุลาคม–พฤศจิกายน</strong> และ <strong>มีนาคม–พฤษภาคม</strong> ราคาสมเหตุสมผล เหมาะสำหรับวางแผนล่วงหน้า 2–3 เดือน</li>\n  <li><strong>แพงที่สุด:</strong> ช่วง <strong>ธันวาคม–มกราคม</strong> และ <strong>เทศกาลสงกรานต์</strong> ราคาพุ่งสูงขึ้น 50–80% ควรจองล่วงหน้า <strong>อย่างน้อย 3–4 เดือน</strong></li>\n  <li><strong>Flash Sale:</strong> Cebu Pacific มักปล่อยโปรฯ เดือนละ 1–2 ครั้ง ราคาอาจเหลือแค่ <strong>1,500–2,500 บาท (เที่ยวเดียว)</strong> แนะนำให้ติดตาม Facebook Page และสมัครรับ Email Newsletter</li>\n</ul>\n\n<h2>เคล็ดลับจองตั๋วบินไปเซบูให้ได้ราคาดีที่สุด</h2>\n\n<p>นอกจากการเลือกสายการบินและช่วงเวลาที่เหมาะสมแล้ว ยังมีเทคนิคเพิ่มเติมที่ช่วยประหยัดได้อีกมาก</p>\n\n<ul>\n  <li><strong>จองล่วงหน้า 6–8 สัปดาห์:</strong> สถิติพบว่าราคาตั๋วเซบูจะถูกที่สุดในช่วง 45–60 วันก่อนเดินทาง</li>\n  <li><strong>เปรียบเทียบผ่าน Google Flights:</strong> ใช้ฟีเจอร์ "ปฏิทินราคา" เพื่อดูว่าวันไหนในสัปดาห์ราคาต่างกันแค่ไหน บางครั้งต่างกันได้ถึง <strong>1,500–3,000 บาท</strong></li>\n  <li><strong>บินวันธรรมดา:</strong> วันอังคาร–พุธ มักราคาต่ำกว่าวันศุกร์–อาทิตย์ ประมาณ <strong>10–20%</strong></li>\n  <li><strong>ระวังค่าธรรมเนียมแอบแฝง:</strong> Low-Cost Airlines มักคิดค่า Convenience Fee เมื่อจ่ายผ่านบัตรเครดิต อาจเพิ่มขึ้น <strong>200–500 บาท/เที่ยว</strong></li>\n  <li><strong>สมัครบัตรสมาชิก:</strong> Cebu Pacific มีโปรแกรม GetGo ที่สะสมคะแนนได้ เหมาะสำหรับนักเรียนที่ต้องบินหลายครั้ง</li>\n</ul>\n\n<h2>บินจากสนามบินไหน? สุวรรณภูมิ vs ดอนเมือง</h2>\n\n<p>ปัจจุบันเที่ยวบินตรงไปเซบูส่วนใหญ่ออกจาก <strong>สนามบินสุวรรณภูมิ (BKK)</strong> เป็นหลัก ทั้ง Cebu Pacific, Philippines AirAsia และ Philippine Airlines ล้วนใช้สนามบินสุวรรณภูมิ หากคุณอาศัยอยู่ในกรุงเทพฯ ฝั่งเหนือและสะดวกดอนเมืองมากกว่า อาจต้องบินต่อผ่าน Manila (MNL) ก่อน ซึ่งจะเพิ่มเวลาเดินทางรวมเป็น <strong>5–7 ชั่วโมง</strong> และราคาอาจสูงหรือต่ำกว่าบินตรงได้ขึ้นอยู่กับช่วงเวลา</p>\n\n<p>สำหรับผู้ที่มาจากต่างจังหวัด เช่น <strong>เชียงใหม่, ภูเก็ต, ขอนแก่น</strong> แนะนำให้บินมา Domestic ก่อนที่สุวรรณภูมิ แล้วต่อเที่ยวบินระหว่างประเทศไปเซบูในวันเดียวกัน โดยเผื่อเวลาต่อเครื่องอย่างน้อย <strong>3 ชั่วโมง</strong> เพื่อความปลอดภัย</p>\n\n<h2>สรุป</h2>\n\n<p>เส้นทางบินตรงจากไทยไปเซบูมีตัวเลือกที่ชัดเจน 3 สายการบิน ได้แก่ Cebu Pacific, Philippines AirAsia และ Philippine Airlines ราคารวมตั๋วไป-กลับอยู่ที่ <strong>7,000–15,000 บาท</strong> ขึ้นอยู่กับสายการบินและช่วงเวลา ระยะเวลาบินสั้นเพียง <strong>ไม่ถึง 3 ชั่วโมง</strong> ทำให้เซบูเป็นจุดหมายที่เข้าถึงได้ง่ายมากสำหรับคนไทย โดยเฉพาะนักเรียนที่วางแผนมาเรียนภาษาอังกฤษระยะสั้นหรือระยะยาว</p>\n\n<p>หากคุณกำลังวางแผนเดินทางมาเรียนภาษาอังกฤษที่เซบูและยังไม่รู้จะเริ่มต้นจากตรงไหน ติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> ได้เลย มีทีมที่ปรึกษาคนไทยพร้อมให้คำแนะนำฟรี ตั้งแต่เรื่องตั๋วเครื่องบิน ที่พัก ไปจนถึงการเลือกโรงเรียนที่เหมาะกับงบและเป้าหมายของคุณโดยเฉพาะ</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: มีสายการบินอะไรบ้างที่บินตรงจากกรุงเทพฯ ไปเซบู?\nA: ปัจจุบันมี 3 สายการบินหลักที่บินตรงจากสุวรรณภูมิไปเซบู ได้แก่ Cebu Pacific, Philippines AirAsia และ Philippine Airlines ทั้งหมดใช้สนามบิน Mactan-Cebu International Airport (CEB) เป็นจุดหมายปลายทาง ความถี่เที่ยวบินรวมกันอยู่ที่ประมาณ 14–20 เที่ยว/สัปดาห์\n\nQ: บินกรุงเทพฯ–เซบูใช้เวลานานเท่าไหร่?\nA: เที่ยวบินตรงจากสุวรรณภูมิไปเซบูใช้เวลาประมาณ 2 ชั่วโมง 45 นาที ถึง 3 ชั่วโมง 10 นาที ขึ้นอยู่กับสายการบินและสภาพอากาศ ถือเป็นเส้นทางที่สั้นมากเมื่อเทียบกับประเทศปลายทางอื่นในภูมิภาค\n\nQ: ราคาตั๋วบินไปเซบูราคาเท่าไหร่?\nA: ราคาตั๋วไป-กลับกรุงเทพฯ–เซบูอยู่ที่ประมาณ 7,000–15,000 บาทในราคาปกติ แต่ช่วง Flash Sale ของ Cebu Pacific ราคาอาจเหลือเพียง 3,500–5,000 บาท (ไป-กลับ) แนะนำให้ติดตามโปรโมชันและจองล่วงหน้า 6–8 สัปดาห์เพื่อได้ราคาดีที่สุด\n\nQ: ซื้อตั๋วบินไปเซบูช่วงไหนถูกที่สุด?\nA: ช่วงที่ตั๋วราคาถูกที่สุดคือ มิถุนายน–กันยายน ซึ่งเป็น Low Season ของฟิลิปปินส์ ราคาอาจลดลงได้ 30–40% เมื่อเทียบกับช่วง High Season ควรหลีกเลี่ยงการซื้อตั๋วช่วงธันวาคม–มกราคม และสงกรานต์ เพราะราคาสูงที่สุดในรอบปี	/api/storage/objects/uploads/e4beb095-35be-4560-9239-9392ba84cbc0	tips	Philingo Team	ทีม Philingo	[]	สายการบินบินตรงไทยไปเซบู เปรียบเทียบราคาและเวลาบิน	เปรียบเทียบสายการบินบินตรงจากไทยไปเซบู ฟิลิปปินส์ ครบ 3 สายการบิน Cebu Pacific, AirAsia, Philippine Airlines ราคาตั๋วเริ่ม 3,500 บาท เวลาบินและข้อดีแต่ละสายการบิน	0	f	t	\N	2026-08-02 09:00:06.492452	2026-08-06 13:51:04.157	บินตรงไทยไปเซบู, สายการบินไปเซบู, ตั๋วเครื่องบินกรุงเทพเซบู, Cebu Pacific ราคา, Philippines AirAsia เซบู, Philippine Airlines เซบู, เรียนภาษาอังกฤษเซบู, ราคาตั๋วเครื่องบินเซบู, บินตรงสุวรรณภูมิเซบู, เปรียบเทียบสายการบินเซบู
26	why-study-philippines-thai-students	เรียนต่อฟิลิปปินส์ ดีกว่าที่คิด	เรียนต่อฟิลิปปินส์ ดีกว่าที่คิด	ทำไมนักเรียนไทยหลายพันคนถึงเลือกเรียนภาษาอังกฤษที่ฟิลิปปินส์?	\N	\N	# เรียนต่อฟิลิปปินส์ ดีกว่าที่คิด — ทำไมนักเรียนไทยหลายพันคนถึงเลือก\n\nถ้าพูดถึงการเรียนภาษาอังกฤษต่างประเทศ หลายคนอาจนึกถึงอเมริกา อังกฤษ หรือออสเตรเลียก่อนเลย แต่รู้ไหมว่าในช่วงหลายปีที่ผ่านมา มีนักเรียนและคนทำงานชาวไทยหลายพันคนเลือกบินไปเรียนภาษาอังกฤษที่ **ฟิลิปปินส์** แทน แล้วกลับมาพร้อมกับภาษาที่ดีขึ้นอย่างเห็นได้ชัด — และที่สำคัญ ประหยัดเงินไปได้มหาศาล\n\nบทความนี้จะพาคุณไปรู้จักกับเหตุผลทั้งหมดที่ทำให้ฟิลิปปินส์กลายเป็นจุดหมายยอดนิยมสำหรับคนไทยที่อยากพัฒนาภาษาอังกฤษอย่างจริงจัง ไม่ว่าคุณจะเป็นนักเรียน นักศึกษา หรือคนทำงานที่อยากอัปเกรดตัวเอง บทความนี้มีคำตอบให้คุณครบ\n\n---\n\n## **ทำไมฟิลิปปินส์? ข้อได้เปรียบที่ไม่มีที่ไหนเหมือน**\n\n**1. ค่าใช้จ่ายต่ำกว่าประเทศอื่นหลายเท่า**\n\nนี่คือเหตุผลอันดับหนึ่งที่ทำให้คนไทยหันมาสนใจฟิลิปปินส์ เพราะถ้าเทียบกับประเทศที่ใช้ภาษาอังกฤษเป็นภาษาหลักอย่างสหรัฐอเมริกาหรืออังกฤษ ค่าใช้จ่ายโดยรวมที่ฟิลิปปินส์ถูกกว่าหลายเท่าตัวมาก\n\nโดยเฉลี่ยแล้ว ค่าเรียนภาษาอังกฤษที่ฟิลิปปินส์รวมที่พักและอาหาร 3 มื้อ อยู่ที่ประมาณ **35,000–70,000 บาทต่อเดือน** ขึ้นอยู่กับสถาบันและเมืองที่เลือก ในขณะที่ประเทศอื่น ๆ อย่างมอลตา แคนาดา หรือออสเตรเลีย ค่าใช้จ่ายอาจสูงถึง 100,000–200,000 บาทต่อเดือนโดยง่าย\n\nนอกจากนี้ ค่าครองชีพในฟิลิปปินส์ก็ไม่สูง ข้าวของเครื่องใช้ ค่าเดินทาง และอาหารนอกโรงเรียนก็ราคาเข้าถึงได้สบาย ๆ\n\n**2. ภาษาอังกฤษคือภาษาทางการของประเทศ**\n\nฟิลิปปินส์เป็นหนึ่งในไม่กี่ประเทศในเอเชียที่ใช้ภาษาอังกฤษเป็นภาษาทางการควบคู่กับภาษาฟิลิปิโน ป้าย ร้านค้า สื่อโทรทัศน์ เว็บไซต์ราชการ ทุกอย่างเป็นภาษาอังกฤษทั้งหมด ซึ่งหมายความว่าคุณจะได้ใช้ภาษาอังกฤษในชีวิตจริงตลอด 24 ชั่วโมง ไม่ใช่แค่ในห้องเรียน\n\nลองนึกภาพดูว่า เวลาคุณออกไปซื้อของ คุยกับคนขับรถ หรือสั่งอาหารที่ร้าน คุณต้องใช้ภาษาอังกฤษทั้งหมด นั่นคือการฝึกที่ดีที่สุดเท่าที่จะมีได้\n\n**3. ครูฝึกสอนแบบ 1 ต่อ 1 (One-on-One)**\n\nสิ่งที่ทำให้โรงเรียนภาษาอังกฤษในฟิลิปปินส์โดดเด่นมากคือ **ระบบการสอนแบบตัวต่อตัว** ซึ่งแทบไม่มีในประเทศอื่น โดยปกตินักเรียน 1 คนจะได้เรียนกับครูแบบส่วนตัวหลายชั่วโมงต่อวัน ทำให้ครูสามารถโฟกัสที่จุดอ่อนของแต่ละคนได้อย่างตรงจุด\n\nถ้าคุณอ่านได้แต่พูดไม่ออก หรือฟังแล้วไม่เข้าใจ ครูจะออกแบบการสอนให้ตรงกับความต้องการของคุณโดยเฉพาะ ซึ่งต่างจากการเรียนในห้องเรียนใหญ่ที่ครูต้องสอนทุกคนพร้อมกัน\n\n---\n\n## **เรียนที่ไหนดี? เมืองยอดนิยมสำหรับนักเรียนไทย**\n\n**เมืองเซบู (Cebu)**\n\nเซบูเป็นเมืองที่นักเรียนไทยเลือกมากที่สุด เพราะมีโรงเรียนภาษาอังกฤษคุณภาพสูงให้เลือกมากมาย บรรยากาศของเมืองเป็นมิตรกับนักท่องเที่ยวและนักเรียนต่างชาติ มีห้างสรรพสินค้า ร้านอาหาร และสิ่งอำนวยความสะดวกครบครัน อีกทั้งยังมีทะเลสวยที่คุณสามารถผ่อนคลายในวันหยุดสุดสัปดาห์ได้\n\n**เมืองบาเกียว (Baguio)**\n\nบาเกียวเป็นเมืองบนภูเขาที่อากาศเย็นสบายตลอดปี เหมาะสำหรับคนที่ไม่ชอบอากาศร้อน บรรยากาศเงียบสงบ เหมาะกับการตั้งใจเรียน โรงเรียนในบาเกียวหลายแห่งมีชื่อเสียงด้านการสอนที่เข้มข้นและมีวินัย\n\n**มะนิลา (Manila)**\n\nเมืองหลวงที่ทันสมัย เหมาะสำหรับคนที่ต้องการประสบการณ์เมืองใหญ่ มีโรงเรียนภาษาอังกฤษทั้งแบบทั่วไปและแบบเฉพาะทาง เช่น หลักสูตรเตรียมสอบ IELTS หรือ TOEIC โดยเฉพาะ\n\n---\n\n## **หลักสูตรที่เหมาะกับคนไทย มีอะไรบ้าง?**\n\n**หลักสูตรภาษาอังกฤษทั่วไป (General English)**\nเหมาะสำหรับผู้ที่ต้องการพัฒนาทักษะทั้ง 4 ด้าน ได้แก่ ฟัง พูด อ่าน เขียน ตั้งแต่ระดับพื้นฐานไปจนถึงขั้นสูง\n\n**หลักสูตรเตรียมสอบ IELTS / TOEIC / TOEFL**\nสำหรับคนทำงานหรือนักศึกษาที่ต้องการคะแนนภาษาเพื่อยื่นสมัครงาน เรียนต่อมหาวิทยาลัย หรือขอวีซ่า หลักสูตรเหล่านี้เข้มข้นและมีการจำลองการสอบจริง\n\n**หลักสูตรภาษาอังกฤษเพื่อธุรกิจ (Business English)**\nออกแบบมาสำหรับคนทำงานที่ต้องติดต่อสื่อสารกับต่างประเทศ เน้นการประชุม การเขียนอีเมล และการนำเสนองาน\n\n**หลักสูตรระยะสั้น 4–8 สัปดาห์**\nสำหรับคนที่มีเวลาจำกัดแต่อยากเห็นผลเร็ว เหมาะกับคนทำงานที่ใช้ลาพักร้อนมาเรียน\n\n---\n\n## **เคล็ดลับสำคัญสำหรับคนที่คิดจะเรียนต่อฟิลิปปินส์**\n\n**วางแผนล่วงหน้าอย่างน้อย 1–2 เดือน**\nโรงเรียนชื่อดังในฟิลิปปินส์มักมีนักเรียนสมัครเต็มเร็ว โดยเฉพาะในช่วงเดือนมีนาคม–พฤษภาคม และตุลาคม–ธันวาคม ควรวางแผนและจองที่พักล่วงหน้า\n\n**ตรวจสอบประเภทวีซ่าให้ถูกต้อง**\nสำหรับหลักสูตรที่เรียนนานกว่า 4 สัปดาห์ คุณอาจต้องขอวีซ่าประเภทนักเรียน (Special Study Permit) ซึ่งทางโรงเรียนมักช่วยดำเนินการให้ ควรเช็กให้ชัดเจนก่อนออกเดินทาง\n\n**เลือกโรงเรียนให้ตรงกับเป้าหมาย**\nอย่าเลือกแค่เพราะถูกหรือเพราะเพื่อนแนะนำ แต่ให้ดูว่าโรงเรียนนั้นแข็งแกร่งด้านไหน เช่น ถ้าต้องการสอบ IELTS ก็ควรเลือกโรงเรียนที่เชี่ยวชาญด้านนั้นโดยเฉพาะ\n\n**ตั้งใจพูดภาษาอังกฤษทั้งในและนอกห้องเรียน**\nหลายคนเสียโอกาสเพราะรวมกลุ่มกับคนไทยด้วยกันแล้วพูดภาษาไทยตลอด ลองตั้งกฎให้ตัวเองว่าจะพูดภาษาอังกฤษตลอดวัน แม้จะเป็นเรื่องเล็กน้อย นั่นคือวิธีที่ทำให้ภาษาพัฒนาเร็วที่สุด\n\n**เตรียมสุขภาพและประกันการเดินทาง**\nฟิลิปปินส์มีอากาศร้อนชื้น คนที่ไม่คุ้นอาจป่วยได้ง่ายในช่วงแรก ควรทำประกันสุขภาพ/เดินทางและพกยาติดไปด้วย\n\n---\n\n## **สรุป — ฟิลิปปินส์คือคำตอบที่ใช่สำหรับคุณ**\n\nถ้าคุณอยากพัฒนาภาษาอังกฤษอย่างจริงจัง โดยไม่ต้องบินไกลถึงอเมริกาหรือยุโรป และไม่ต้องเสียเงินหลักหลายแสน ฟิลิปปินส์คือตัวเลือกที่คุ้มค่าและได้ผลจริง ด้วยระบบการสอนแบบตัวต่อตัว สภาพแวดล้อมภาษาอังกฤษจริง ค่าใช้จ่ายที่เข้าถึงได้ และบรรยากาศที่เป็นมิตร ไม่แปลกเลยที่คนไทยหลายพันคนเลือกที่นี่ทุกปี\n\nแต่การเลือกโรงเรียน วางแผนเดินทาง และเตรียมเอกสารต่าง ๆ อาจดูซับซ้อนสำหรับคนที่ยังไม่เคยทำ — และนั่นคือจุดที่ **Philingo by Thai Study Abroad Consultant** พร้อมช่วยคุณทุกขั้นตอน\n\n**ปรึกษาฟรี ไม่มีค่าใช้จ่าย** ทีมที่ปรึกษาชาวไทยของเราพร้อมแนะนำโรงเรียนที่เหมาะกับเป้าหมายของคุณ ช่วยวางแผนงบประมาณ และดูแลทุกเรื่องตั้งแต่ต้นจนถึงวันที่คุณเหยียบแผ่นดินฟิลิปปินส์\n\n👉 **ติดต่อ Philingo วันนี้ได้เลย — เพราะการพัฒนาตัวเองไม่ควรรอ**\n	/api/storage/objects/uploads/8693cdb9-9582-4c13-ac8b-506e4a6aa3b4	tips	Philingo Team	\N	[]	เรียนต่อฟิลิปปินส์ ดีกว่าที่คิด ค่าใช้จ่ายและข้อดี	เรียนต่อฟิลิปปินส์ ทำไมนักเรียนไทยหลายพันคนถึงเลือก? ค่าใช้จ่าย 35,000-70,000 บาท/เดือน	0	f	f	\N	2026-08-02 08:15:34.160663	2026-08-06 12:38:14.22	เรียนต่อฟิลิปปินส์, เรียนภาษาอังกฤษฟิลิปปินส์, โรงเรียนภาษาเซบู, ค่าเรียนฟิลิปปินส์
32	cebu-city-guide-for-students	เมืองเซบู ฟิลิปปินส์ คืออะไร? ชีวิตนักเรียน สภาพแวดล้อม และทุกเรื่องที่ต้องรู้	เมืองเซบู ฟิลิปปินส์ คืออะไร? ชีวิตนักเรียน สภาพแวดล้อม และทุกเรื่องที่ต้องรู้	ทำไมเลือกเรียนต่อเซบู 	\N	\N	<p><strong>เซบู (Cebu) คือเมืองท่องเที่ยวและเมืองการศึกษาอันดับต้นๆ ของฟิลิปปินส์</strong> ที่นักเรียนไทยเลือกมาเรียนภาษาอังกฤษมากที่สุด เพราะค่าใช้จ่ายรวมค่าเรียน ค่าที่พัก และค่าอาหารอยู่ที่ประมาณ <strong>35,000–65,000 บาทต่อเดือน</strong> ถูกกว่าเรียนในประเทศอังกฤษหรืออเมริกาหลายเท่า บรรยากาศเมืองทันสมัย อากาศอบอุ่นตลอดปี และมีโรงเรียนภาษาอังกฤษให้เลือกมากกว่า 30 แห่งในพื้นที่เดียว ทำให้เซบูกลายเป็น "จุดหมายเรียนภาษาอังกฤษยอดนิยมของคนไทย" อย่างแท้จริง</p>\n\n<h2>เซบู ฟิลิปปินส์ คืออะไร? ทำไมถึงดังเรื่องเรียนภาษาอังกฤษ?</h2>\n\n<p>เซบูเป็นเมืองหลักของภาคกลางฟิลิปปินส์ (Visayas) มีประชากรในเขตมหานครกว่า <strong>3 ล้านคน</strong> ถือเป็นเมืองใหญ่อันดับ 2 ของประเทศรองจากมะนิลา เซบูมีประวัติศาสตร์ยาวนานกว่า 500 ปีในฐานะเมืองท่าแห่งแรกที่สเปนเข้ามาล่าอาณานิคม ทำให้วัฒนธรรมและสถาปัตยกรรมที่นี่ผสมผสานทั้งความเป็นเอเชียและยุโรปได้อย่างลงตัว</p>\n\n<p>สาเหตุที่เซบูเป็นเมืองยอดนิยมสำหรับการเรียนภาษาอังกฤษ มีหลายปัจจัยสำคัญ ได้แก่</p>\n\n<ul>\n  <li><strong>ภาษาอังกฤษเป็นภาษาทางการ</strong> ชาวฟิลิปปินส์ใช้ภาษาอังกฤษในชีวิตประจำวันจริงๆ ไม่ใช่แค่ในห้องเรียน</li>\n  <li><strong>สำเนียงชัดเจน</strong> ชาวเซบูมีสำเนียงภาษาอังกฤษที่เป็นกลาง ฟังง่ายสำหรับคนเอเชีย</li>\n  <li><strong>โรงเรียนหนาแน่น</strong> มีสถาบันภาษาอังกฤษมากกว่า 30 แห่ง ทั้งในตัวเมืองและเขต Mandaue, Lapu-Lapu</li>\n  <li><strong>ราคาคุ้มค่า</strong> ค่าเรียนถูกกว่าประเทศที่ใช้ภาษาอังกฤษเป็นเจ้าของภาษาอย่างน้อย 3–5 เท่า</li>\n  <li><strong>เดินทางสะดวก</strong> มีเที่ยวบินตรงจากกรุงเทพฯ ใช้เวลาเพียง <strong>3 ชั่วโมง 30 นาที</strong></li>\n</ul>\n\n<h2>ชีวิตนักเรียนที่เซบูเป็นอย่างไร?</h2>\n\n<p>ชีวิตนักเรียนที่เซบูส่วนใหญ่จะอยู่ในระบบ <strong>Camp-Style หรือ Semi-Camp</strong> ซึ่งหมายความว่าคุณพักอยู่ในโรงเรียน กิน นอน และเรียนในที่เดียวกัน มีกฎระเบียบเช่น ห้ามพูดภาษาไทยในบริเวณโรงเรียน (English Only Zone) เพื่อบังคับให้ฝึกภาษาตลอดเวลา ซึ่งวิธีนี้ได้ผลดีมากสำหรับคนที่ต้องการพัฒนาอย่างรวดเร็ว</p>\n\n<p>ตารางชีวิตโดยทั่วไปในวันธรรมดาจะเป็นดังนี้</p>\n\n<ul>\n  <li><strong>06:30 น.</strong> — ตื่นนอน รับประทานอาหารเช้าในโรงเรียน</li>\n  <li><strong>08:00–12:00 น.</strong> — เรียนแบบ 1-on-1 กับครูชาวฟิลิปปินส์ (4 คาบ)</li>\n  <li><strong>12:00–13:00 น.</strong> — พักกลางวัน อาหารในโรงเรียน</li>\n  <li><strong>13:00–17:00 น.</strong> — เรียนแบบกลุ่ม (Group Class) 4 คาบ</li>\n  <li><strong>17:00–21:00 น.</strong> — เวลาอิสระ ออกกำลังกาย ทำการบ้าน หรือสังสรรค์กับเพื่อน</li>\n  <li><strong>21:00 น. เป็นต้นไป</strong> — เวลาส่วนตัว และเข้านอน</li>\n</ul>\n\n<p>วันเสาร์มักมีกิจกรรมพิเศษ เช่น ทัศนศึกษา ไปเที่ยวชายหาด Moalboal หรือ Oslob เพื่อดูปลาวาฬ ส่วนวันอาทิตย์ส่วนใหญ่เป็นวันหยุดเต็ม นักเรียนสามารถออกไปช้อปปิ้งที่ <strong>SM City Cebu</strong> หรือ <strong>Ayala Center Cebu</strong> ซึ่งห่างจากโรงเรียนหลายแห่งแค่ 10–20 นาที</p>\n\n<h2>ค่าใช้จ่ายในการเรียนที่เซบูเท่าไหร่?</h2>\n\n<p>นี่คือคำถามที่คนถามมากที่สุด! ขอแยกรายละเอียดให้ชัดเจน</p>\n\n<ul>\n  <li><strong>ค่าเรียน (4 สัปดาห์)</strong> — ประมาณ 18,000–35,000 บาท ขึ้นอยู่กับโปรแกรมที่เลือก เช่น General English, IELTS Preparation, Business English</li>\n  <li><strong>ค่าที่พักในโรงเรียน</strong> — รวมอยู่ในค่าเรียนแล้วสำหรับหลายโรงเรียน หรือเพิ่มประมาณ 5,000–12,000 บาท/เดือน สำหรับห้องพักแบบ Single Room</li>\n  <li><strong>ค่าอาหาร</strong> — หากอาหาร 3 มื้อรวมในแพ็คเกจ ประหยัดได้มาก ถ้าออกกินข้างนอกเฉลี่ยมื้อละ 80–200 บาท</li>\n  <li><strong>ค่าวีซ่า</strong> — คนไทยอยู่ได้ <strong>30 วันโดยไม่ต้องขอวีซ่า</strong> หากอยู่นานกว่านั้นต้องต่อวีซ่าครั้งละ 59 ดอลลาร์สหรัฐ (ประมาณ 2,000 บาท)</li>\n  <li><strong>ค่าใช้จ่ายส่วนตัว</strong> — ประมาณ 5,000–10,000 บาท/เดือน สำหรับการเดินทาง ช้อปปิ้ง และความบันเทิง</li>\n  <li><strong>ค่าเครื่องบิน</strong> — กรุงเทพฯ–เซบู เริ่มต้นที่ประมาณ 5,000–12,000 บาท (ไป-กลับ)</li>\n</ul>\n\n<p>รวมแล้ว <strong>งบประมาณเฉลี่ยต่อเดือนอยู่ที่ 35,000–65,000 บาท</strong> ซึ่งถือว่าคุ้มค่ามากเมื่อเทียบกับการเรียนในออสเตรเลียหรืออังกฤษที่ต้องใช้งบ 150,000–250,000 บาทต่อเดือน</p>\n\n<h2>โรงเรียนภาษาอังกฤษที่ดีในเซบูมีที่ไหนบ้าง?</h2>\n\n<p>เซบูมีโรงเรียนภาษาอังกฤษหลากหลายสไตล์ ตั้งอยู่ในหลายทำเล แต่โรงเรียนที่นักเรียนไทยนิยมมากที่สุดได้แก่</p>\n\n<ul>\n  <li><strong>PINES International Academy</strong> — ตั้งอยู่ที่ Baguio (ไม่ใช่เซบู แต่เป็นตัวเลือกใกล้เคียง) มีสาขาในเซบูด้วย เหมาะสำหรับผู้ต้องการบรรยากาศเงียบสงบ</li>\n  <li><strong>HELP International Language School</strong> — ยอดนิยมในหมู่นักเรียนไทย มีระบบ Camp ที่เข้มข้น</li>\n  <li><strong>SMEAG Capital Campus</strong> — อยู่ในเขต Cebu City มีระบบการเรียนที่ครบครัน เหมาะสำหรับเตรียมสอบ IELTS</li>\n  <li><strong>CIA (CIA Language School)</strong> — เน้นการเรียนแบบ 1-on-1 เข้มข้น เหมาะสำหรับคนที่ต้องการพัฒนาเร็ว</li>\n</ul>\n\n<p>แนะนำให้ปรึกษาผู้เชี่ยวชาญก่อนเลือก เพราะแต่ละโรงเรียนมีจุดเด่นต่างกัน เช่น บางแห่งเน้น IELTS บางแห่งเน้น Speaking หรือ Business English</p>\n\n<h2>สภาพแวดล้อมและความปลอดภัยที่เซบูเป็นอย่างไร?</h2>\n\n<p>เซบูในพื้นที่ที่นักเรียนอาศัยอยู่มีความปลอดภัยในระดับที่ยอมรับได้ดี โดยเฉพาะในเขต <strong>Cebu IT Park, Lahug และ Mandaue</strong> ซึ่งเป็นย่านที่โรงเรียนส่วนใหญ่ตั้งอยู่ มีห้างสรรพสินค้า ร้านอาหาร และโรงพยาบาลระดับดีอย่าง <strong>Chong Hua Hospital</strong> อยู่ใกล้เคียง</p>\n\n<p>สภาพอากาศที่เซบูอุ่นตลอดปี อุณหภูมิเฉลี่ย <strong>27–32 องศาเซลเซียส</strong> ฤดูกาลฝนหลักอยู่ในช่วงเดือนพฤศจิกายน–มกราคม แต่ก็ไม่ได้ฝนหนักทุกวัน อากาศแบบนี้ใกล้เคียงกับประเทศไทยมาก คนไทยจึงปรับตัวได้ง่ายมาก</p>\n\n<p>ข้อควรระวังคือควรหลีกเลี่ยงการเดินคนเดียวในที่มืดหรือย่านที่ไม่คุ้นเคย และควรเก็บสัมภาระให้ดีในที่สาธารณะ ซึ่งเป็นสิ่งที่ต้องระวังในทุกเมืองใหญ่ทั่วโลก</p>\n\n<h2>สรุป: เซบูเหมาะกับคุณไหม?</h2>\n\n<p>เซบูคือตัวเลือกที่ดีเยี่ยมสำหรับคนไทยที่ต้องการพัฒนาภาษาอังกฤษอย่างจริงจังในงบที่จับต้องได้ ทั้งบรรยากาศเมือง ความสะดวกสบาย คุณภาพการสอน และค่าใช้จ่ายที่สมเหตุสมผลล้วนทำให้ที่นี่เป็นจุดหมายที่คุ้มค่ามาก ไม่ว่าจะเรียน 4 สัปดาห์หรือ 6 เดือน คุณก็จะกลับมาพร้อมทักษะภาษาอังกฤษที่พัฒนาขึ้นอย่างชัดเจน</p>\n\n<p>หากคุณสนใจเรียนภาษาอังกฤษที่เซบูแต่ยังไม่รู้จะเริ่มต้นอย่างไร ติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> ได้เลย ทีมงานผู้เชี่ยวชาญด้านการเรียนที่ฟิลิปปินส์โดยเฉพาะ พร้อมให้คำปรึกษาฟรี ช่วยเลือกโรงเรียนที่เหมาะกับเป้าหมายและงบประมาณของคุณ ตั้งแต่สมัครเรียนไปจนถึงเดินทางถึงเซบูอย่างปลอดภัย</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: เรียนภาษาอังกฤษที่เซบูใช้งบเดือนละเท่าไหร่?\nA: งบประมาณรวมค่าเรียน ค่าที่พัก ค่าอาหาร และค่าใช้จ่ายส่วนตัวอยู่ที่ประมาณ 35,000–65,000 บาทต่อเดือน ขึ้นอยู่กับโรงเรียนและโปรแกรมที่เลือก หากเลือกห้องพัก Single Room และโปรแกรมเข้มข้นอย่าง IELTS Prep ค่าใช้จ่ายจะอยู่ที่ด้านบนของช่วงนี้ แต่ก็ยังถูกกว่าเรียนในออสเตรเลียหรืออังกฤษมากกว่า 3 เท่า\n\nQ: คนไทยต้องขอวีซ่าก่อนไปเรียนที่เซบูไหม?\nA: คนไทยสามารถเดินทางเข้าฟิลิปปินส์ได้โดยไม่ต้องขอวีซ่าล่วงหน้า และอยู่ได้นาน 30 วันโดยอัตโนมัติ หากต้องการอยู่นานกว่านั้นสามารถต่อวีซ่าในฟิลิปปินส์ได้ที่สำนักงาน Bureau of Immigration โดยมีค่าใช้จ่ายประมาณ 2,000–3,000 บาทต่อครั้ง และสามารถต่อได้หลายครั้ง\n\nQ: เรียนที่เซบูกี่สัปดาห์ถึงจะเห็นผล?\nA: ระยะเวลาขั้นต่ำที่แนะนำคือ 4 สัปดาห์สำหรับผู้ที่ต้องการเห็นพัฒนาการเบื้องต้น แต่หากต้องการผลลัพธ์ที่ชัดเจนและยั่งยืน โดยเฉพาะสำหรับการสอบ IELTS หรือการทำงานเป็นภาษาอังกฤษ ควรเรียนอย่างน้อย 8–12 สัปดาห์ เพราะสมองต้องการเวลาในการสร้างความเคยชินกับการคิดและพูดเป็นภาษาอังกฤษ\n\nQ: เซบูปลอดภัยสำหรับนักเรียนหญิงที่เดินทางคนเดียวไหม?\nA: เซบูในย่านที่โรงเรียนส่วนใหญ่ตั้งอยู่ เช่น Cebu IT Park, Lahug และ Mandaue ถือว่ามีความปลอดภัยดีในระดับที่ยอมรับได้ นักเรียนหญิงชาวไทยจำนวนมากเดินทางมาคนเดียวและไม่มีปัญหา ขอแนะนำให้หลีกเลี่ยงการเดินคนเดียวในเวลากลางคืนในย่านที่ไม่คุ้นเคย และควรใช้แอปเรียกรถอย่าง Grab แทนการโบกรถทั่วไปเพื่อความปลอดภัย	/api/storage/objects/uploads/d3de0cf4-018a-4efe-8b3d-f2c453131ed0	life	Philingo Team	ทีม Philingo	[]	เมืองเซบู ฟิลิปปินส์ คืออะไร? ชีวิตนักเรียนและสิ่งที่ต้องรู้	เซบู ฟิลิปปินส์ คือจุดหมายเรียนภาษาอังกฤษยอดนิยมของคนไทย ค่าใช้จ่าย 35,000-65,000 บาท/เดือน บินตรง 3.5 ชม. มีโรงเรียนกว่า 30 แห่ง เช็กชีวิตนักเรียนได้เลย!	0	f	t	\N	2026-08-02 09:01:58.412446	2026-08-06 12:43:58.999	เซบู ฟิลิปปินส์, เรียนภาษาอังกฤษเซบู, เรียนต่อฟิลิปปินส์, เรียนภาษาอังกฤษต่างประเทศ, ค่าเรียนภาษาอังกฤษฟิลิปปินส์, ชีวิตนักเรียนเซบู, โรงเรียนภาษาอังกฤษเซบู, เรียนภาษาอังกฤษราคาถูก, Cebu ฟิลิปปินส์, เรียนภาษาอังกฤษคนไทย, Camp Style ฟิลิปปินส์, เซบูเมืองท่องเที่ยว
31	baguio-city-guide-for-students	เมืองบาเกียว ฟิลิปปินส์ คืออะไร? ทำไมถึงเป็นเมืองยอดนิยมของนักเรียนไทย	เมืองบาเกียว ฟิลิปปินส์ คืออะไร? ทำไมถึงเป็นเมืองยอดนิยมของนักเรียนไทย	ทำไมเรียนต่อเมืองบาเกียว Baguio	\N	\N	<p><strong>เมืองบาเกียว (Baguio City)</strong> คือเมืองบนภูเขาทางตอนเหนือของฟิลิปปินส์ ตั้งอยู่ที่ความสูงประมาณ 1,500 เมตรเหนือระดับน้ำทะเล มีอากาศเย็นสบายตลอดปีอยู่ที่ราว 14–22 องศาเซลเซียส และเป็นที่ตั้งของโรงเรียนสอนภาษาอังกฤษชั้นนำหลายแห่ง ค่าใช้จ่ายโดยรวมสำหรับนักเรียนไทยอยู่ที่ประมาณ <strong>35,000–55,000 บาทต่อเดือน</strong> รวมค่าเรียน ที่พัก และค่าอาหาร ทำให้บาเกียวกลายเป็นหนึ่งในจุดหมายยอดนิยมที่สุดสำหรับคนไทยที่อยากพัฒนาทักษะภาษาอังกฤษในต่างประเทศ</p>\n\n<h2>บาเกียวอยู่ที่ไหน และเดินทางไปอย่างไร?</h2>\n\n<p>บาเกียวตั้งอยู่ในจังหวัดเบงเกต (Benguet) ทางตอนเหนือของเกาะลูซอน ห่างจากกรุงมะนิลาประมาณ 250 กิโลเมตร ใช้เวลาเดินทางโดยรถบัสประมาณ 5–6 ชั่วโมง หรือสามารถนั่งเครื่องบินจากกรุงเทพฯ ลงที่สนามบินนินอย อากีโน กรุงมะนิลา แล้วต่อรถบัสขึ้นเขาไปยังบาเกียว โดยสายรถบัสที่นิยม เช่น Victory Liner และ Genesis มีให้บริการตลอดวัน ค่ารถบัสอยู่ที่ประมาณ 500–900 เปโซ หรือราว 300–550 บาทต่อเที่ยว</p>\n\n<p>บาเกียวได้รับฉายาว่า <strong>"Summer Capital of the Philippines"</strong> เพราะในอดีตเคยเป็นที่พักตากอากาศของรัฐบาลฟิลิปปินส์และเจ้าหน้าที่ชาวอเมริกันในยุคอาณานิคม เมืองนี้มีประชากรประมาณ 370,000 คน และมีมหาวิทยาลัยชื่อดังอย่าง University of the Philippines Baguio ตั้งอยู่ด้วย ทำให้บรรยากาศโดยรวมเป็นเมืองแห่งการศึกษาอย่างแท้จริง</p>\n\n<h2>ทำไมบาเกียวถึงเป็นเมืองยอดนิยมของนักเรียนไทย?</h2>\n\n<h3>อากาศเย็นสบาย ไม่เหมือนเมืองอื่นในฟิลิปปินส์</h3>\n\n<p>หนึ่งในเหตุผลหลักที่นักเรียนไทยเลือกบาเกียวคืออากาศ เมืองนี้มีอุณหภูมิเฉลี่ย <strong>14–22 องศาเซลเซียส</strong> ตลอดทั้งปี ต่างจากเมืองอื่นในฟิลิปปินส์อย่างมะนิลาหรือเซบูที่ร้อนถึง 32–35 องศา นักเรียนจึงสามารถใช้ชีวิตและเรียนหนังสือได้อย่างสบายกาย ไม่ต้องทนความร้อนอบอ้าวตลอดการเรียน ซึ่งช่วยให้สมาธิในการเรียนดีขึ้นอย่างเห็นได้ชัด</p>\n\n<h3>โรงเรียนภาษาอังกฤษคุณภาพสูงและหลากหลาย</h3>\n\n<p>บาเกียวเป็นที่ตั้งของโรงเรียนสอนภาษาอังกฤษสำหรับชาวต่างชาติมากกว่า <strong>20 แห่ง</strong> โรงเรียนที่ได้รับความนิยมจากนักเรียนไทย ได้แก่</p>\n\n<ul>\n<li><strong>IDEA (International Development of English Academy)</strong> — เน้นการเรียนแบบ 1-on-1 เข้มข้น เหมาะสำหรับผู้ที่ต้องการพัฒนาอย่างรวดเร็ว</li>\n<li><strong>BECI (Baguio Easter School of Language)</strong> — เป็นหนึ่งในโรงเรียนที่เก่าแก่และมีชื่อเสียงมากที่สุดในบาเกียว ก่อตั้งมากกว่า 30 ปี</li>\n<li><strong>SRLI (Study and Recreation Learning Institute)</strong> — มีหลักสูตรหลากหลายตั้งแต่ General English ไปจนถึง IELTS และ TOEIC</li>\n<li><strong>Champs (Champions English Academy)</strong> — ได้รับความนิยมสูงในกลุ่มนักเรียนเอเชีย มีระบบการเรียนที่ครอบคลุมทั้ง 4 ทักษะ</li>\n<li><strong>HELP (High English Language Program)</strong> — เน้นทักษะการพูดและการสื่อสารในชีวิตประจำวัน</li>\n</ul>\n\n<p>ส่วนใหญ่เปิดสอนแบบ <strong>Intensive Course</strong> คือเรียน 6–9 ชั่วโมงต่อวัน ผสมระหว่าง One-on-One กับ Group Class ทำให้ผู้เรียนพัฒนาได้เร็วกว่าการเรียนในห้องเรียนธรรมดามาก</p>\n\n<h3>ค่าใช้จ่ายคุ้มค่ากว่าประเทศอื่น</h3>\n\n<p>เมื่อเทียบกับการเรียนภาษาอังกฤษในประเทศอย่างออสเตรเลีย อังกฤษ หรือแคนาดา บาเกียวมีค่าใช้จ่ายต่ำกว่ามาก โดยประมาณค่าใช้จ่ายต่อเดือนมีดังนี้</p>\n\n<ul>\n<li><strong>ค่าเรียน:</strong> 20,000–35,000 บาทต่อเดือน (ขึ้นอยู่กับโรงเรียนและหลักสูตร)</li>\n<li><strong>ค่าที่พักในโรงเรียน (Dormitory):</strong> รวมอยู่ในแพ็กเกจส่วนใหญ่ หรือเพิ่มเติมประมาณ 5,000–10,000 บาท</li>\n<li><strong>ค่าอาหาร:</strong> 3,000–6,000 บาทต่อเดือน หากกินในโรงอาหารของโรงเรียนหรือร้านอาหารท้องถิ่น</li>\n<li><strong>ค่าใช้จ่ายส่วนตัว:</strong> 3,000–5,000 บาทต่อเดือน</li>\n</ul>\n\n<p>รวมทั้งหมดอยู่ที่ประมาณ <strong>35,000–55,000 บาทต่อเดือน</strong> ซึ่งน้อยกว่าการเรียนในออสเตรเลียถึง 3–4 เท่า แต่ได้รับการสอนจากครูที่มีคุณภาพและได้ใช้ภาษาอังกฤษในชีวิตจริงตลอดเวลา</p>\n\n<h2>ชีวิตในบาเกียวเป็นอย่างไร? ปลอดภัยไหมสำหรับนักเรียนไทย?</h2>\n\n<p>บาเกียวถือเป็นหนึ่งในเมืองที่ปลอดภัยที่สุดในฟิลิปปินส์ เนื่องจากเป็นเมืองมหาวิทยาลัย มีนักเรียนนักศึกษาอาศัยอยู่จำนวนมาก ชุมชนมีความเป็นระเบียบและเจ้าหน้าที่ตำรวจดูแลอย่างใกล้ชิด นอกจากนี้โรงเรียนส่วนใหญ่ยังมีระบบดูแลนักเรียนต่างชาติโดยเฉพาะ รวมถึงมีกฎระเบียบ Curfew สำหรับผู้เรียนที่พักใน Dormitory</p>\n\n<p>ในแง่สิ่งอำนวยความสะดวก บาเกียวมี <strong>Session Road</strong> ซึ่งเป็นย่านช้อปปิ้งและร้านอาหารหลัก มีห้างสรรพสินค้าอย่าง SM City Baguio ซึ่งเป็นหนึ่งในห้างที่ใหญ่ที่สุดในเมือง มีร้านสะดวกซื้ออย่าง 7-Eleven และ Ministop กระจายทั่วเมือง และมีตลาดสดอย่าง Baguio Public Market ที่ขายผักผลไม้ราคาถูกมาก สตรอว์เบอร์รีสดๆ กิโลกรัมละแค่ 60–100 บาทเท่านั้น!</p>\n\n<p>สำหรับนักเรียนไทยโดยเฉพาะ ในบาเกียวมีชุมชนคนไทยที่เรียนภาษาอยู่ตลอด ทำให้การปรับตัวในช่วงแรกไม่โดดเดี่ยว แถมยังมีร้านอาหารไทยในบาเกียวอยู่บ้าง แก้คิดถึงบ้านได้เป็นอย่างดี</p>\n\n<h2>ใครเหมาะกับการเรียนที่บาเกียว?</h2>\n\n<p>บาเกียวเหมาะมากสำหรับ</p>\n\n<ul>\n<li>ผู้ที่ต้องการ <strong>เรียนแบบเข้มข้น</strong> ในระยะเวลา 4–12 สัปดาห์ เพื่อพัฒนาทักษะอย่างรวดเร็ว</li>\n<li>ผู้ที่เตรียมสอบ <strong>IELTS หรือ TOEIC</strong> เพราะหลายโรงเรียนมีหลักสูตรเฉพาะด้านนี้</li>\n<li>ผู้ที่ <strong>ไม่ชอบอากาศร้อน</strong> และต้องการสภาพแวดล้อมที่เหมาะแก่การเรียน</li>\n<li>ผู้ที่มี <strong>งบประมาณจำกัด</strong> แต่ต้องการประสบการณ์เรียนต่างประเทศที่คุ้มค่า</li>\n<li>ผู้ที่ต้องการ <strong>สมาธิในการเรียน</strong> โดยไม่มีสิ่งล่อใจมากนัก เพราะบาเกียวเป็นเมืองเงียบสงบกว่ามะนิลาหรือเซบูมาก</li>\n</ul>\n\n<h2>สรุป</h2>\n\n<p>บาเกียวคือคำตอบที่ลงตัวสำหรับนักเรียนไทยที่ต้องการพัฒนาภาษาอังกฤษอย่างจริงจัง ด้วยอากาศที่เย็นสบาย โรงเรียนคุณภาพสูงกว่า 20 แห่ง ค่าใช้จ่ายที่จัดการได้ที่ 35,000–55,000 บาทต่อเดือน และบรรยากาศของเมืองมหาวิทยาลัยที่ปลอดภัย ทำให้เมืองนี้ครองใจนักเรียนไทยมาอย่างยาวนาน หากคุณกำลังมองหาจุดเริ่มต้นที่ดีในการเรียนภาษาอังกฤษที่ฟิลิปปินส์ บาเกียวคือตัวเลือกที่ไม่ควรมองข้าม สามารถติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> เพื่อขอคำปรึกษาฟรี เปรียบเทียบโรงเรียน และวางแผนการเดินทางได้เลยทันที ทีมงานคนไทยพร้อมดูแลคุณตั้งแต่ต้นจนจบ</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: บาเกียวอยู่ที่ไหนในฟิลิปปินส์ และเดินทางไปอย่างไร?\nA: บาเกียวตั้งอยู่ทางตอนเหนือของเกาะลูซอน ห่างจากกรุงมะนิลาประมาณ 250 กิโลเมตร สามารถเดินทางโดยนั่งเครื่องบินจากกรุงเทพฯ ลงที่มะนิลา แล้วต่อรถบัส Victory Liner หรือ Genesis ขึ้นเขาไปบาเกียวใช้เวลาประมาณ 5–6 ชั่วโมง ค่ารถบัสอยู่ที่ประมาณ 300–550 บาทต่อเที่ยว\n\nQ: เรียนภาษาอังกฤษที่บาเกียวค่าใช้จ่ายเดือนละเท่าไหร่?\nA: ค่าใช้จ่ายรวมทั้งหมดสำหรับนักเรียนไทยที่บาเกียวอยู่ที่ประมาณ 35,000–55,000 บาทต่อเดือน โดยแบ่งเป็นค่าเรียน 20,000–35,000 บาท ค่าอาหาร 3,000–6,000 บาท และค่าใช้จ่ายส่วนตัวอีกประมาณ 3,000–5,000 บาท ซึ่งถูกกว่าการเรียนในออสเตรเลียหรืออังกฤษถึง 3–4 เท่า\n\nQ: บาเกียวปลอดภัยสำหรับนักเรียนต่างชาติไหม?\nA: บาเกียวถือเป็นหนึ่งในเมืองที่ปลอดภัยที่สุดในฟิลิปปินส์ เพราะเป็นเมืองมหาวิทยาลัยที่มีระเบียบวินัยสูง โรงเรียนส่วนใหญ่มีระบบ Dormitory พร้อม Curfew และทีมดูแลนักเรียนต่างชาติโดยเฉพาะ นอกจากนี้ยังมีชุมชนคนไทยในบาเกียวที่คอยช่วยเหลือกันได้ด้วย\n\nQ: ต้องเรียนที่บาเกียวนานแค่ไหนถึงจะเห็นผล?\nA: โดยทั่วไปนักเรียนที่เรียนแบบ Intensive Course 6–8 ชั่วโมงต่อวันจะเริ่มเห็นพัฒนาการชัดเจนภายใน 4–8 สัปดาห์ หากต้องการพัฒนาเพื่อสอบ IELTS หรือ TOEIC แนะนำให้เรียนอย่างน้อย 8–12 สัปดาห์เพื่อให้ได้คะแนนตามเป้าหมาย\n\nQ: บาเกียวกับเซบูต่างกันอย่างไร ควรเลือกเรียนที่ไหน?\nA: บาเกียวมีอากาศเย็น เงียบสงบ เหมาะสำหรับคนที่ต้องการเรียนอย่างเข้มข้นโดยไม่มีสิ่งรบกวน ส่วนเซบูมีอากาศร้อน มีทะเล และสิ่งอำนวยความสะดวกมากกว่า เหมาะสำหรับคนที่ต้องการสมดุลระหว่างการเรียนและการท่องเที่ยว ค่าใช้จ่ายของทั้งสองเมืองใกล้เคียงกัน ขึ้นอยู่กับโรงเรียนที่เลือก	/api/storage/objects/uploads/ee3766ec-8c12-4189-b973-9d6eaea4a164	life	Philingo Team	ทีม Philingo	[]	เมืองบาเกียว ฟิลิปปินส์ คืออะไร? ทำไมนักเรียนไทยนิยม	บาเกียว เมืองเรียนภาษาอังกฤษยอดนิยมของคนไทย อากาศเย็น 14-22 องศา ค่าใช้จ่าย 35,000-55,000 บาท/เดือน มีโรงเรียนกว่า 20 แห่ง เหมาะสำหรับพัฒนาภาษาอังกฤษในต่างประเทศ	0	f	t	\N	2026-08-02 09:01:55.233542	2026-08-06 12:54:26.435	เมืองบาเกียว, บาเกียวฟิลิปปินส์, เรียนภาษาอังกฤษบาเกียว, เรียนต่อฟิลิปปินส์, โรงเรียนภาษาอังกฤษบาเกียว, Baguio City, เรียนภาษาอังกฤษต่างประเทศ, ค่าใช้จ่ายเรียนบาเกียว, เรียนภาษาอังกฤษคนไทย, IDEA Baguio, IELTS ฟิลิปปินส์, Summer Capital Philippines
36	grab-food-delivery-philippines-guide	เบื่ออาหารโรงเรียน? สั่ง Grab Food ในฟิลิปปินส์ยังไง ราคาถูกไหม อาหารไทยมีไหม	เบื่ออาหารโรงเรียน? สั่ง Grab Food ในฟิลิปปินส์ยังไง ราคาถูกไหม อาหารไทยมีไหม	สั่ง Grab Food ในฟิลิปปินส์ ราคา วิธีใช้ อาหารไทยมีไหม	\N	\N	<p>สั่ง Grab Food ในฟิลิปปินส์ได้ง่ายมาก แค่โหลดแอป Grab เวอร์ชันฟิลิปปินส์แล้วสมัครด้วยเบอร์โทรท้องถิ่น ราคาอาหารเริ่มต้นที่ประมาณ 80–150 เปโซ (ราว 50–90 บาท) ต่อมื้อ บวกค่าจัดส่งอีก 30–80 เปโซ แล้วแต่ระยะทาง และใช่ มีอาหารไทยให้สั่งด้วย โดยเฉพาะในเมืองใหญ่อย่างเซบูและมะนิลา</p>\n\n<h2>ทำไมนักเรียนถึงหันมาใช้ Grab Food แทนกินอาหารโรงเรียน?</h2>\n\n<p>ต้องยอมรับว่าอาหารในโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์นั้น <strong>กินได้ประมาณ 2–3 สัปดาห์แรกแล้วเริ่มเบื่อ</strong> เมนูหลักที่เจอบ่อยคือข้าวสวยกับกับข้าวฟิลิปปินส์สไตล์ เช่น Adobo (เนื้อต้มซีอิ๊ว), Sinigang (แกงเปรี้ยว) และ Tinola (ซุปไก่ขิง) ซึ่งรสชาติต่างจากอาหารไทยมาก โดยเฉพาะนักเรียนไทยที่ชินกับรสจัดและเครื่องเทศ</p>\n\n<p>โรงเรียนส่วนใหญ่ในเซบู เช่น SMEAG, Philinter, CIA หรือ HELP รวมอาหาร 3 มื้อไว้ในแพ็กเกจแล้ว แต่ถ้าอยากได้ของกินนอกเมนูบ้าง Grab Food คือตัวเลือกที่ง่ายและสะดวกที่สุด โดยเฉพาะช่วงพักกลางวัน 1 ชั่วโมง หรือหลังเลิกเรียนตอนเย็น</p>\n\n<h2>วิธีสมัครและใช้งาน Grab Food ในฟิลิปปินส์ ทำได้เองไหม?</h2>\n\n<h3>ขั้นตอนสมัคร Grab ฉบับมือใหม่ในฟิลิปปินส์</h3>\n\n<ul>\n  <li>โหลดแอป <strong>Grab</strong> จาก App Store หรือ Google Play (แอปเดียวกับไทย แต่ต้องเปลี่ยน region เป็นฟิลิปปินส์)</li>\n  <li>สมัครด้วย <strong>เบอร์โทรฟิลิปปินส์</strong> (ซื้อซิม Smart หรือ Globe ได้ที่สนามบิน ราคาประมาณ 100–200 เปโซ)</li>\n  <li>ใส่ที่อยู่โรงเรียนหรือหอพักเป็น "ที่อยู่จัดส่ง" ครั้งแรก แนะนำให้พิมพ์ชื่อโรงเรียนในภาษาอังกฤษ แล้วปักหมุดในแผนที่</li>\n  <li>เลือกชำระด้วย <strong>Cash on Delivery</strong> ก็ได้ถ้ายังไม่มีบัตรเครดิต หรือจะผูก GCash (กระเป๋าเงินดิจิทัลฟิลิปปินส์) ก็สะดวกกว่า</li>\n  <li>กด Order แล้วรอประมาณ <strong>20–45 นาที</strong> แล้วแต่ร้านและระยะทาง</li>\n</ul>\n\n<h3>GCash คืออะไร ต้องใช้ไหม?</h3>\n\n<p>GCash คือแอปกระเป๋าเงินดิจิทัลของฟิลิปปินส์ คล้ายกับ PromptPay หรือ TrueMoney ในไทย แนะนำให้สมัครเพราะสะดวกมากและบางร้านให้ <strong>ส่วนลด 15–30%</strong> เมื่อจ่ายผ่าน GCash สมัครได้ฟรีด้วยเบอร์ Globe หรือ TM เติมเงินได้ที่ 7-Eleven หรือร้านสะดวกซื้อทั่วไป</p>\n\n<h2>Grab Food ในฟิลิปปินส์ราคาถูกไหม เทียบกับไทยแล้วเป็นยังไง?</h2>\n\n<p>ราคาถือว่า <strong>ถูกกว่าไทยประมาณ 20–40%</strong> ในหลายเมนู โดยเฉพาะอาหารฟาสต์ฟู้ดและอาหารท้องถิ่น ลองดูตัวอย่างราคาจริงจากร้านในเซบูซิตี้:</p>\n\n<ul>\n  <li>ข้าวกับกับข้าวฟิลิปปินส์ (Tapa, Longganisa): <strong>80–120 เปโซ</strong> (ราว 50–75 บาท)</li>\n  <li>McDonald's ฟิลิปปินส์ (McChicken + เฟรนช์ฟราย + น้ำ): <strong>150–180 เปโซ</strong> (ราว 95–110 บาท)</li>\n  <li>Jollibee (ไก่ทอด 1 ชิ้น + ข้าว + น้ำ): <strong>130–160 เปโซ</strong> (ราว 80–100 บาท)</li>\n  <li>Pizza ชิ้นเล็ก (Shakey's หรือ Yellow Cab): <strong>200–350 เปโซ</strong> (ราว 125–220 บาท)</li>\n  <li>Milk Tea (Gong Cha, Tiger Sugar): <strong>120–180 เปโซ</strong> (ราว 75–110 บาท)</li>\n  <li>ค่าจัดส่ง (Delivery Fee): <strong>30–80 เปโซ</strong> (ราว 20–50 บาท) แล้วแต่ระยะทาง</li>\n</ul>\n\n<p>ถ้ารวมทุกอย่างแล้ว <strong>งบต่อมื้อที่สั่ง Grab</strong> อยู่ที่ประมาณ <strong>150–300 เปโซ หรือ 90–190 บาท</strong> ซึ่งถ้าโรงเรียนรวมอาหารไว้แล้วก็ถือเป็นค่าใช้จ่ายเพิ่มเติม แต่ก็ไม่ได้แพงจนเกินไปถ้าสั่งสัปดาห์ละ 3–4 ครั้ง</p>\n\n<h2>มีอาหารไทยบน Grab Food ฟิลิปปินส์ไหม?</h2>\n\n<p>มีแน่นอน! โดยเฉพาะในเมืองเซบูซิตี้และมะนิลาที่มีนักเรียนชาวเอเชียอยู่เยอะ ร้านอาหารไทยบน Grab ที่พบได้บ่อย ได้แก่:</p>\n\n<ul>\n  <li><strong>Thai Town Restaurant</strong> (เซบู) – ผัดไทย, ต้มยำ, แกงเขียวหวาน ราคา 200–380 เปโซ</li>\n  <li><strong>Thai Bistro</strong> (มะนิลา/BGC) – เมนูไทยเต็มรูปแบบ ราคา 250–450 เปโซ</li>\n  <li>ร้านในห้างฯ อย่าง SM Mall หรือ Ayala Mall หลายแห่งมีร้านอาหารไทยที่สั่ง Grab ได้</li>\n</ul>\n\n<p>นอกจากนี้ยังมีร้านอาหารเอเชียอื่นๆ ที่ใกล้เคียงรสชาติไทยด้วย เช่น ร้านอาหารจีน, ร้านราเมน, ร้านซูชิ และร้านอาหารเกาหลีที่มีเมนูรสเผ็ด ซึ่งช่วยแก้เบื่อได้ดีมาก</p>\n\n<h3>เคล็ดลับค้นหาร้านอาหารไทยบน Grab</h3>\n\n<ul>\n  <li>พิมพ์ "Thai food" หรือ "Thai restaurant" ในช่องค้นหา</li>\n  <li>ใช้ฟิลเตอร์ "Cuisine" แล้วเลือก "Asian" หรือ "Thai"</li>\n  <li>ดูรีวิวและคะแนนให้ไม่ต่ำกว่า <strong>4.5 ดาว</strong> เพื่อความปลอดภัยด้านรสชาติ</li>\n  <li>ร้านที่มีป้าย <strong>"GrabFood Preferred"</strong> มักมีคุณภาพและเวลาจัดส่งที่ดีกว่า</li>\n</ul>\n\n<h2>ทิปส์ประหยัดตังค์เวลาสั่ง Grab Food ในฟิลิปปินส์</h2>\n\n<ul>\n  <li><strong>สั่งรวมกับเพื่อน</strong>: แชร์ค่าจัดส่งกัน 2–4 คน ลดต้นทุนได้ทันที</li>\n  <li><strong>ใช้โค้ดโปรโมชั่น</strong>: เช็คใน App ทุกวันจะมีโค้ดส่วนลด 20–50 เปโซ ให้กดรับฟรี</li>\n  <li><strong>สมัคร GrabUnlimited</strong>: ราคาประมาณ 149 เปโซ/เดือน ได้ส่วนลดค่าจัดส่งไม่จำกัด เหมาะถ้าสั่งบ่อยกว่า 8 ครั้ง/เดือน</li>\n  <li><strong>สั่งในช่วง Flash Sale</strong>: มักจะมีช่วง 11.00–13.00 น. และ 17.00–19.00 น.</li>\n  <li><strong>ดู Grab Rewards</strong>: สะสมคะแนนแลกส่วนลดมื้อถัดไปได้</li>\n</ul>\n\n<h2>สรุป</h2>\n\n<p>Grab Food ในฟิลิปปินส์ใช้งานง่ายมาก แค่มีเบอร์โทรฟิลิปปินส์และซิมก็สมัครได้เลย ราคาต่อมื้ออยู่ที่ <strong>150–300 เปโซ รวมค่าส่ง</strong> ซึ่งไม่แพงเกินไปสำหรับการแก้เบื่ออาหารโรงเรียน และอาหารไทยก็หาได้ไม่ยากโดยเฉพาะในเซบูและมะนิลา ถ้ายังมีคำถามเพิ่มเติมเกี่ยวกับการใช้ชีวิตที่ฟิลิปปินส์ ไม่ว่าจะเรื่องอาหาร ที่พัก หรือการเลือกโรงเรียนที่ใช่ ติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> ได้เลย ให้คำปรึกษาฟรีโดยผู้เชี่ยวชาญที่ผ่านประสบการณ์เรียนฟิลิปปินส์มาโดยตรง ไม่ต้องเดาเองให้เสียเวลา!</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: สั่ง Grab Food ในฟิลิปปินส์ต้องมีอะไรบ้าง?\nA: ต้องมีเบอร์โทรศัพท์ฟิลิปปินส์ (ซิม Smart หรือ Globe ราคา 100–200 เปโซ) สำหรับสมัครแอป Grab และต้องมีวิธีชำระเงิน ซึ่งใช้ Cash on Delivery ก็ได้ถ้ายังไม่มีบัตร หรือจะสมัคร GCash ก็สะดวกและได้ส่วนลดเพิ่มอีกด้วย\n\nQ: ค่าจัดส่ง Grab Food ในฟิลิปปินส์แพงไหม?\nA: ค่าจัดส่งอยู่ที่ประมาณ 30–80 เปโซ (ราว 20–50 บาท) ขึ้นอยู่กับระยะทาง ถ้าสั่งบ่อยแนะนำสมัคร GrabUnlimited ราคา 149 เปโซ/เดือน ซึ่งช่วยลดค่าส่งได้มากถ้าสั่งมากกว่า 8 ครั้งต่อเดือน\n\nQ: อาหารไทยบน Grab Food ฟิลิปปินส์หารสชาติใกล้เคียงของจริงไหม?\nA: ร้านอาหารไทยในฟิลิปปินส์ส่วนใหญ่มีเมนูหลักอย่างผัดไทย ต้มยำ และแกงเขียวหวาน รสชาติใกล้เคียงต้นตำรับพอสมควร แต่บางร้านอาจปรับให้เผ็ดน้อยลงตามรสนิยมท้องถิ่น แนะนำบอกร้านว่า "extra spicy" ถ้าชอบรสจัด\n\nQ: Grab Food ส่งไปถึงในโรงเรียนสอนภาษาได้เลยไหม?\nA: ได้เลย แต่ควรตั้งหมุดที่อยู่จัดส่งให้ตรงกับประตูทางเข้าหรือจุดรับของของโรงเรียน เพราะบางโรงเรียนมีกฎไม่ให้ไรเดอร์เข้าใน campus ควรถามเพื่อนรุ่นพี่หรือสตาฟโรงเรียนก่อนสั่งครั้งแรก	/api/storage/objects/uploads/07be6d33-be61-447e-a43b-44f36ef27353	life	Philingo Team	ทีม Philingo	[]	สั่ง Grab Food ในฟิลิปปินส์ ราคา วิธีใช้ อาหารไทยมีไหม	สั่ง Grab Food ในฟิลิปปินส์ง่ายมาก! เริ่มต้น 80-150 เปโซต่อมื้อ ถูกกว่าไทย 20-40% มีอาหารไทยในเซบูและมะนิลา พร้อมวิธีสมัคร GCash และเคล็ดลับประหยัดสำหรับนักเรียน	0	f	t	\N	2026-08-02 09:08:08.065511	2026-08-06 13:19:10.867	Grab Food ฟิลิปปินส์, สั่งอาหารในฟิลิปปินส์, เรียนภาษาอังกฤษฟิลิปปินส์, อาหารไทยในฟิลิปปินส์, Grab Food เซบู, GCash คืออะไร, ค่าอาหารฟิลิปปินส์, เรียนที่เซบู, นักเรียนไทยฟิลิปปินส์, Grab Food ราคา, อาหารนักเรียนฟิลิปปินส์, สั่งอาหาร Grab เซบู
38	laundry-service-philippines-school	การซักผ้าตอนเรียนอยู่ที่ฟิลิปปินส์ บริการ Laundry ที่โรงเรียนมีไหม ค่าใช้จ่ายเท่าไหร่	การซักผ้าตอนเรียนอยู่ที่ฟิลิปปินส์ บริการ Laundry ที่โรงเรียนมีไหม ค่าใช้จ่ายเท่าไหร่	โรงเรียนที่ฟิลิปปินส์มีบริการซักผ้าไหม?	\N	\N	<p>โรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ส่วนใหญ่มีบริการซักผ้า (Laundry Service) ให้นักเรียนใช้ ทั้งแบบรวมในค่าเรียนและแบบเสียเงินเพิ่ม โดยค่าซักผ้าแบบเหมาจ่ายอยู่ที่ประมาณ <strong>500–1,500 บาทต่อเดือน</strong> หรือถ้าคิดราคาต่อกิโลกรัมจะอยู่ที่ <strong>20–50 บาทต่อกิโลกรัม</strong> ขึ้นอยู่กับโรงเรียนและเมืองที่เรียน เรื่องนี้ดูเล็กน้อยแต่สำคัญมากสำหรับคนที่กำลังวางแผนเรียนต่างประเทศ เพราะมีผลต่องบประมาณในชีวิตประจำวันโดยตรง</p>\n\n<h2>โรงเรียนที่ฟิลิปปินส์มีบริการซักผ้าไหม?</h2>\n\n<p>คำตอบคือ <strong>มีเกือบทุกโรงเรียน</strong> แต่รูปแบบและค่าใช้จ่ายต่างกัน บริการซักผ้าในโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์แบ่งได้เป็น 3 รูปแบบหลัก ดังนี้</p>\n\n<ul>\n  <li><strong>รวมในแพ็กเกจค่าเรียน:</strong> โรงเรียนบางแห่ง โดยเฉพาะที่เมือง Baguio และ Cebu รวมค่าซักผ้าไว้ในแพ็กเกจตั้งแต่ต้น นักเรียนไม่ต้องจ่ายเพิ่ม แต่มักจำกัดจำนวน เช่น ซักได้สัปดาห์ละ 1 ครั้ง หรือน้ำหนักไม่เกิน 3–5 กิโลกรัมต่อสัปดาห์</li>\n  <li><strong>เสียเงินเพิ่มแบบเหมาจ่ายรายเดือน:</strong> นักเรียนจ่ายเพิ่มเดือนละ <strong>500–1,500 บาท</strong> เพื่อใช้บริการซักผ้าแบบไม่จำกัดครั้ง หรือซักได้ตามรอบที่โรงเรียนกำหนด</li>\n  <li><strong>คิดราคาตามน้ำหนัก:</strong> บางโรงเรียนคิดค่าซักผ้าตามน้ำหนักจริง ประมาณ <strong>20–50 บาทต่อกิโลกรัม</strong> แบบนี้ยืดหยุ่นดี เหมาะกับคนที่มีผ้าน้อยหรืออยู่ระยะสั้น</li>\n</ul>\n\n<h2>ค่าซักผ้าที่ฟิลิปปินส์แต่ละเมืองต่างกันแค่ไหน?</h2>\n\n<p>ราคาค่าซักผ้าขึ้นอยู่กับเมืองที่เรียนด้วย เพราะค่าครองชีพแต่ละเมืองต่างกันพอสมควร มาดูกันว่าแต่ละเมืองหลักที่นักเรียนไทยนิยมไปเรียนมีค่าใช้จ่ายเท่าไหร่</p>\n\n<ul>\n  <li><strong>Baguio (บาเกียว):</strong> เมืองนี้เป็นที่นิยมมากที่สุดสำหรับคนไทย ค่าซักผ้าในโรงเรียนอยู่ที่ประมาณ <strong>500–1,000 บาทต่อเดือน</strong> ถ้าซักนอกโรงเรียนตามร้านทั่วไปจะอยู่ที่ <strong>25–40 บาทต่อกิโลกรัม</strong></li>\n  <li><strong>Cebu (เซบู):</strong> ค่าซักผ้าในโรงเรียนแถวเซบูและ Mandaue อยู่ที่ <strong>700–1,500 บาทต่อเดือน</strong> ส่วนร้านซักผ้าทั่วไปนอกโรงเรียนราคา <strong>30–50 บาทต่อกิโลกรัม</strong></li>\n  <li><strong>Dumaguete (ดูมาเกตี):</strong> เมืองเล็กกว่า ค่าครองชีพถูกกว่า ค่าซักผ้าประมาณ <strong>400–800 บาทต่อเดือน</strong> หรือ <strong>20–35 บาทต่อกิโลกรัม</strong></li>\n  <li><strong>Manila (มะนิลา):</strong> เมืองใหญ่ ค่าใช้จ่ายสูงกว่า ค่าซักผ้าในโรงเรียนอาจสูงถึง <strong>1,000–1,800 บาทต่อเดือน</strong></li>\n</ul>\n\n<h3>เปรียบเทียบค่าซักผ้าในโรงเรียนกับนอกโรงเรียน แบบไหนคุ้มกว่า?</h3>\n\n<p>ถ้าอยู่ระยะสั้นต่ำกว่า 4 สัปดาห์ การซักผ้านอกโรงเรียนตามร้าน Laundry ทั่วไปอาจคุ้มกว่า เพราะจ่ายตามจริง แต่ถ้าอยู่ 4 สัปดาห์ขึ้นไป การเหมาจ่ายรายเดือนกับโรงเรียนจะคุ้มกว่ามาก เพราะสะดวกและประหยัดเวลา ไม่ต้องเดินออกไปข้างนอก โดยเฉลี่ยคนที่อยู่ 4 สัปดาห์จะมีผ้าประมาณ <strong>12–20 กิโลกรัม</strong> ต่อเดือน คำนวณแล้วการเหมาจ่ายรายเดือนมักประหยัดกว่า <strong>200–400 บาท</strong></p>\n\n<h2>วิธีซักผ้าด้วยตัวเองที่ฟิลิปปินส์ ประหยัดได้แค่ไหน?</h2>\n\n<p>หลายโรงเรียนมีพื้นที่ให้นักเรียนซักผ้าเองได้ บางแห่งมีเครื่องซักผ้าหยอดเหรียญ (Coin Laundry) ในหอพัก ค่าใช้จ่ายอยู่ที่ประมาณ <strong>30–60 บาทต่อรอบ</strong> สำหรับเครื่องซัก และอีก <strong>20–40 บาทต่อรอบ</strong> สำหรับเครื่องอบผ้า วิธีนี้ประหยัดที่สุดในระยะยาว แต่ต้องใช้เวลาของตัวเองประมาณ <strong>1.5–2 ชั่วโมงต่อรอบ</strong></p>\n\n<p>สิ่งที่ต้องเตรียมถ้าจะซักเองที่ฟิลิปปินส์มีดังนี้</p>\n\n<ul>\n  <li>ผงซักฟอกหรือน้ำยาซักผ้า (ซื้อได้ตามร้านสะดวกซื้อ 7-Eleven หรือซูเปอร์มาร์เก็ต ราคาซองละ <strong>5–15 บาท</strong>)</li>\n  <li>ถังซักผ้าหรือกะละมัง ถ้าจะซักมือ</li>\n  <li>ไม้แขวนเสื้อ โรงเรียนบางแห่งมีให้ แต่ควรเตรียมเผื่อ</li>\n  <li>เชือกหรือราวตากผ้า ห้องพักส่วนใหญ่มีให้ แต่ถ้าไม่มีให้ถามโรงเรียน</li>\n</ul>\n\n<h2>เคล็ดลับประหยัดค่าซักผ้าตอนเรียนที่ฟิลิปปินส์</h2>\n\n<p>จากประสบการณ์ของนักเรียนไทยที่ไปเรียนภาษาอังกฤษที่ฟิลิปปินส์ มีเทคนิคประหยัดค่าซักผ้าง่ายๆ ที่ได้ผลจริง ดังนี้</p>\n\n<ul>\n  <li><strong>เลือกเสื้อผ้าที่ซักง่าย ไม่ยับง่าย:</strong> ผ้าฝ้ายและผ้าลินินแห้งเร็วในอากาศร้อนของฟิลิปปินส์ ไม่ต้องพึ่งเครื่องอบ ลดค่าใช้จ่ายได้ <strong>30–40%</strong></li>\n  <li><strong>ซักผ้ารวมกัน:</strong> ถ้าโรงเรียนคิดราคาต่อกิโลกรัม ลองนัดเพื่อนร่วมซักรวมกันจะได้ราคาถูกกว่า</li>\n  <li><strong>ถามโรงเรียนก่อนสมัครเสมอ:</strong> สอบถามให้ชัดเจนว่า Laundry รวมในแพ็กเกจหรือเปล่า เพราะโรงเรียนบางแห่งไม่ได้แจ้งชัดในหน้าเว็บ</li>\n  <li><strong>เตรียมเสื้อผ้าในจำนวนที่เหมาะสม:</strong> ควรเตรียมเสื้อผ้า <strong>7–10 วัน</strong> เพื่อไม่ต้องซักบ่อยเกินไป แต่ก็ไม่ควรนำไปมากเกินจนกระเป๋าหนัก</li>\n  <li><strong>ใช้บริการ Drop-off Laundry นอกโรงเรียน:</strong> ในเมืองใหญ่อย่าง Baguio และ Cebu มีร้านซักผ้าราคาถูกภายในระยะเดิน <strong>100–300 เมตร</strong> จากโรงเรียนส่วนใหญ่</li>\n</ul>\n\n<h2>สรุป: เรื่องซักผ้าที่ฟิลิปปินส์ไม่ยากอย่างที่คิด</h2>\n\n<p>โรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์เกือบทุกแห่งมีบริการซักผ้ารองรับนักเรียน ไม่ว่าจะเป็นแบบรวมในแพ็กเกจ แบบเหมาจ่ายรายเดือน <strong>500–1,500 บาท</strong> หรือแบบคิดต่อกิโลกรัม <strong>20–50 บาท</strong> ขึ้นอยู่กับโรงเรียนและเมืองที่เลือก สิ่งสำคัญคือถามให้ชัดก่อนเดินทาง เพื่อวางแผนงบประมาณได้แม่นยำ</p>\n\n<p>ถ้าคุณกำลังวางแผนเรียนภาษาอังกฤษที่ฟิลิปปินส์และอยากรู้ว่าโรงเรียนไหนเหมาะกับคุณที่สุด ทั้งเรื่องราคา, สิ่งอำนวยความสะดวก และบริการต่างๆ รวมถึงเรื่องซักผ้า สามารถติดต่อขอคำปรึกษาฟรีได้เลยที่ <strong>Philingo by Thai Study Abroad Consultant</strong> ทีมงานพร้อมช่วยคุณเลือกโรงเรียนและวางแผนการเดินทางอย่างละเอียด ไม่มีค่าใช้จ่ายใดๆ ทั้งสิ้น</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: โรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ทุกแห่งมีบริการซักผ้าไหม?\nA: โรงเรียนส่วนใหญ่มีบริการซักผ้าให้นักเรียน แต่รูปแบบและราคาต่างกัน บางแห่งรวมในแพ็กเกจค่าเรียน บางแห่งคิดเงินเพิ่มรายเดือนหรือต่อกิโลกรัม ควรถามโรงเรียนให้ชัดเจนก่อนสมัครเรียนทุกครั้ง\n\nQ: ค่าซักผ้าที่ฟิลิปปินส์โดยเฉลี่ยต่อเดือนเท่าไหร่?\nA: ถ้าใช้บริการในโรงเรียนแบบเหมาจ่ายรายเดือนจะอยู่ที่ประมาณ 500–1,500 บาท ขึ้นอยู่กับเมืองและโรงเรียน ถ้าซักนอกโรงเรียนตามร้านทั่วไปจะคิดที่ 20–50 บาทต่อกิโลกรัม โดยเฉลี่ยคนที่อยู่ 1 เดือนจะเสียค่าซักผ้าทั้งหมดประมาณ 500–1,200 บาท\n\nQ: นักเรียนสามารถซักผ้าเองได้ที่หอพักของโรงเรียนไหม?\nA: ได้ในหลายโรงเรียน โดยเฉพาะโรงเรียนที่มีเครื่องซักผ้าหยอดเหรียญ (Coin Laundry) ในหอพัก ค่าใช้จ่ายประมาณ 30–60 บาทต่อรอบสำหรับเครื่องซัก และ 20–40 บาทต่อรอบสำหรับเครื่องอบ วิธีนี้ประหยัดที่สุดแต่ต้องใช้เวลาของตัวเอง 1.5–2 ชั่วโมง\n\nQ: ควรเตรียมเสื้อผ้าไปเรียนที่ฟิลิปปินส์กี่ชุด?\nA: แนะนำให้เตรียมเสื้อผ้าสำหรับ 7–10 วัน ซึ่งพอดีกับรอบซักผ้าสัปดาห์ละครั้ง ไม่ต้องนำมากเกินไปจนกระเป๋าหนัก เลือกผ้าที่ซักง่าย แห้งเร็ว และไม่ยับง่ายจะสะดวกที่สุดในสภาพอากาศร้อนชื้นของฟิลิปปินส์	/api/storage/objects/uploads/2f4061bf-180d-4cb9-a316-bc5ecf4e3c64	life	Philingo Team	ทีม Philingo	[]	ค่าซักผ้าฟิลิปปินส์ บริการ Laundry ที่โรงเรียนมีไหม เท่าไหร่?	โรงเรียนที่ฟิลิปปินส์มีบริการซักผ้าเกือบทุกแห่ง ค่าใช้จ่ายอยู่ที่ 500-1,500 บาท/เดือน หรือ 20-50 บาท/กก. เปรียบเทียบค่าซักผ้าแต่ละเมือง Baguio, Cebu, Dumaguete พร้อมวิธีเลือกที่คุ้มที่สุด	0	f	t	\N	2026-08-02 09:11:45.071768	2026-08-06 13:14:36.608	ค่าซักผ้าฟิลิปปินส์, laundry ฟิลิปปินส์, เรียนภาษาอังกฤษฟิลิปปินส์, ค่าใช้จ่ายฟิลิปปินส์, เรียนที่บาเกียว, เรียนที่เซบู, ค่าครองชีพฟิลิปปินส์, โรงเรียนฟิลิปปินส์, laundry service โรงเรียน, ซักผ้าฟิลิปปินส์ราคา, เรียนต่อฟิลิปปินส์, งบประมาณเรียนฟิลิปปินส์
40	sick-in-philippines-what-to-do	ป่วยไม่สบายตอนเรียนอยู่ที่ฟิลิปปินส์ทำยังไง? หาหมอที่ไหน ค่ารักษาแพงไหม	ป่วยไม่สบายตอนเรียนอยู่ที่ฟิลิปปินส์ทำยังไง? หาหมอที่ไหน ค่ารักษาแพงไหม	ป่วยที่ฟิลิปปินส์ต้องทำอะไรก่อนเป็นอันดับแรก	\N	\N	<p>ถ้าคุณป่วยขึ้นมาระหว่างเรียนที่ฟิลิปปินส์ ไม่ต้องตกใจ เพราะฟิลิปปินส์มีโรงพยาบาลและคลินิกที่พร้อมรองรับชาวต่างชาติในทุกเมืองหลัก ค่ารักษาพยาบาลโดยทั่วไปอยู่ที่ <strong>500–3,000 เปโซ (ประมาณ 300–1,800 บาท)</strong> สำหรับการพบแพทย์ทั่วไป ซึ่งถือว่าถูกกว่าไทยมาก และโรงเรียนสอนภาษาส่วนใหญ่ก็มีระบบช่วยเหลือนักเรียนต่างชาติอยู่แล้ว</p>\n\n<h2>ป่วยที่ฟิลิปปินส์ต้องทำอะไรก่อนเป็นอันดับแรก?</h2>\n\n<p>ขั้นตอนแรกที่ควรทำทันทีเมื่อรู้สึกไม่สบายคือ <strong>แจ้งสถาบันสอนภาษาที่คุณเรียนอยู่</strong> ทุกโรงเรียนชื่อดังในเซบู บาโคลอด และดาเวา เช่น PINES, HELP, CIA, Philinter หรือ OPEnglish จะมีเจ้าหน้าที่คอยช่วยประสานงานและพาไปโรงพยาบาลได้ ส่วนใหญ่มีรถของโรงเรียนหรือติดต่อแท็กซี่ให้ฟรี</p>\n\n<p>สิ่งที่ควรเตรียมก่อนออกจากห้องพัก ได้แก่:</p>\n<ul>\n  <li>พาสปอร์ตหรือบัตรประชาชน (โรงพยาบาลใหญ่มักขอเอกสารระบุตัวตน)</li>\n  <li>บัตรประกันสุขภาพ หรือกรมธรรม์ประกันการเดินทาง</li>\n  <li>เงินสดเปโซสำรองอย่างน้อย <strong>3,000–5,000 เปโซ</strong></li>\n  <li>เบอร์โทรเจ้าหน้าที่โรงเรียน (ควรเซฟไว้ตั้งแต่วันแรก)</li>\n</ul>\n\n<p>ถ้าอาการหนัก เช่น หายใจลำบาก เจ็บหน้าอก หรือหมดสติ ให้โทรหา <strong>Emergency Hotline 911</strong> ซึ่งใช้ได้ทั่วฟิลิปปินส์ ตลอด 24 ชั่วโมง</p>\n\n<h2>ไปหาหมอที่ไหนได้บ้าง? คลินิกหรือโรงพยาบาล?</h2>\n\n<h3>คลินิกทั่วไป (Clinic / Health Center)</h3>\n<p>สำหรับอาการเบาๆ เช่น ไข้หวัด ปวดท้อง ท้องเสีย หรือปวดหัว แนะนำให้ไป <strong>คลินิกใกล้โรงเรียน</strong> ก่อน เพราะสะดวก รวดเร็ว และค่าใช้จ่ายถูกกว่ามาก ค่าพบแพทย์ที่คลินิกอยู่ที่ประมาณ <strong>300–600 เปโซ (ราว 180–360 บาท)</strong> ส่วนค่ายาจะอยู่ที่ <strong>200–800 เปโซ</strong> ขึ้นอยู่กับชนิดยา</p>\n\n<h3>โรงพยาบาลเอกชนในเซบู</h3>\n<ul>\n  <li><strong>Cebu Doctors' University Hospital</strong> — โรงพยาบาลเอกชนชื่อดัง รองรับชาวต่างชาติดีมาก มีล่ามและบริการหลากภาษา ค่าพบแพทย์ประมาณ <strong>800–1,500 เปโซ</strong></li>\n  <li><strong>Chong Hua Hospital</strong> — อีกหนึ่งตัวเลือกยอดนิยม มาตรฐานสูง ค่าบริการใกล้เคียงกัน</li>\n  <li><strong>Vicente Sotto Memorial Medical Center</strong> — โรงพยาบาลรัฐ ค่าใช้จ่ายถูกกว่า แต่อาจรอนานกว่า</li>\n</ul>\n\n<h3>โรงพยาบาลในบาโคลอด</h3>\n<ul>\n  <li><strong>Corazon Locsin Montelibano Memorial Regional Hospital</strong> — โรงพยาบาลหลักของเมือง</li>\n  <li><strong>Riverside Medical Center</strong> — เอกชน บริการดี เหมาะสำหรับชาวต่างชาติ</li>\n</ul>\n\n<h3>โรงพยาบาลในดาเวา</h3>\n<ul>\n  <li><strong>Davao Doctors Hospital</strong> — โรงพยาบาลเอกชนมาตรฐานสูง ใจกลางเมือง</li>\n  <li><strong>Southern Philippines Medical Center</strong> — โรงพยาบาลรัฐขนาดใหญ่</li>\n</ul>\n\n<h2>ค่ารักษาพยาบาลที่ฟิลิปปินส์แพงแค่ไหน?</h2>\n\n<p>โดยรวมแล้วค่ารักษาพยาบาลที่ฟิลิปปินส์ <strong>ถูกกว่าไทยประมาณ 30–50%</strong> และถูกกว่าประเทศยุโรปหรืออเมริกาหลายเท่าตัว ลองดูตัวอย่างค่าใช้จ่ายจริงที่พบบ่อยในหมู่นักเรียนไทย:</p>\n\n<ul>\n  <li>ค่าพบแพทย์ทั่วไป (OPD): <strong>500–1,500 เปโซ</strong></li>\n  <li>ค่ายาไข้หวัด + ยาปฏิชีวนะ: <strong>300–1,000 เปโซ</strong></li>\n  <li>เอกซเรย์ปอด: <strong>500–1,200 เปโซ</strong></li>\n  <li>ตรวจเลือด CBC (Complete Blood Count): <strong>400–800 เปโซ</strong></li>\n  <li>IV Drip (น้ำเกลือ): <strong>1,500–3,000 เปโซ</strong></li>\n  <li>นอน Admit โรงพยาบาล (ต่อวัน): <strong>3,000–8,000 เปโซ</strong> ขึ้นอยู่กับห้องและโรงพยาบาล</li>\n</ul>\n\n<p>กรณีเจ็บป่วยเล็กน้อย งบรวมทั้งหมดมักไม่เกิน <strong>2,000–3,000 เปโซ</strong> แต่ถ้าต้อง Admit หรือผ่าตัด ค่าใช้จ่ายอาจสูงถึง <strong>50,000–200,000 เปโซ</strong> ขึ้นไป นี่คือเหตุผลสำคัญที่ทำให้การซื้อ <strong>ประกันเดินทางก่อนออกจากไทย</strong> เป็นเรื่องที่ขาดไม่ได้</p>\n\n<h2>ประกันสุขภาพและประกันเดินทาง — สำคัญมากกว่าที่คิด</h2>\n\n<p>นักเรียนไทยหลายคนมักมองข้ามเรื่องประกัน แต่ความจริงคือถ้าไม่มีประกันและต้องนอนโรงพยาบาล 3–5 วัน คุณอาจต้องจ่ายเงินเองหลักหมื่นถึงแสนบาทได้เลย ประกันเดินทางที่แนะนำสำหรับนักเรียนระยะ 1–3 เดือน:</p>\n\n<ul>\n  <li><strong>ประกันเดินทางต่างประเทศระยะยาว</strong> (Long Stay) จากบริษัทประกันไทย เช่น AXA, Allianz, MSIG — วงเงินคุ้มครองค่ารักษาพยาบาลอย่างน้อย <strong>1–2 ล้านบาท</strong></li>\n  <li>ราคาเบี้ยประกัน สำหรับ 2 เดือนอยู่ที่ประมาณ <strong>1,500–3,500 บาท</strong> ขึ้นอยู่กับแผนและวงเงิน</li>\n  <li>บางโรงเรียนในฟิลิปปินส์มีประกันสุขภาพพื้นฐานให้นักเรียน แต่วงเงินมักต่ำมาก ควรซื้อเพิ่มเอง</li>\n</ul>\n\n<p>ควรเช็กด้วยว่า กรมธรรม์ของคุณครอบคลุม <strong>การส่งตัวกลับประเทศ (Medical Evacuation)</strong> หรือไม่ เพราะกรณีป่วยหนักมาก การส่งตัวกลับไทยมีค่าใช้จ่ายสูงมาก</p>\n\n<h2>เตรียมยาติดตัวไปด้วยช่วยได้มาก</h2>\n\n<p>แพทย์และนักเรียนที่มีประสบการณ์ไปเรียนฟิลิปปินส์หลายคนแนะนำให้ <strong>เตรียมยาสามัญจากไทยติดกระเป๋าไปด้วย</strong> เพราะสะดวกกว่าและบางครั้งหายาที่คุ้นเคยได้ยากในต่างประเทศ ยาที่ควรพกติดตัว:</p>\n\n<ul>\n  <li>ยาแก้ไข้ เช่น พาราเซตามอล (Paracetamol 500 mg) — พกไป 1 แผง</li>\n  <li>ยาแก้ท้องเสีย เช่น Loperamide หรือ Smecta</li>\n  <li>ยาลดกรดในกระเพาะอาหาร เช่น Omeprazole หรือ Antacid</li>\n  <li>ยาแก้แพ้ เช่น Cetirizine หรือ Loratadine</li>\n  <li>ยาทาแผล ครีมฆ่าเชื้อ และพลาสเตอร์ยา</li>\n  <li>ยาแก้เมาเรือ/เมารถ ถ้าต้องเดินทางบ่อย</li>\n</ul>\n\n<p>หากต้องการซื้อยาในฟิลิปปินส์ ร้านขายยาที่พบบ่อยที่สุดคือ <strong>Mercury Drug</strong> และ <strong>Rose Pharmacy</strong> มีสาขาทั่วทุกเมือง เปิดบริการถึงดึกและบางสาขาเปิด 24 ชั่วโมง</p>\n\n<h2>สรุป</h2>\n\n<p>ป่วยที่ฟิลิปปินส์ไม่ใช่เรื่องน่ากลัว ถ้าเตรียมพร้อมตั้งแต่แรก ทั้งการซื้อประกันเดินทาง การพกยาสามัญติดตัว และการรู้จักโรงพยาบาลในพื้นที่ล่วงหน้า ค่ารักษาพยาบาลโดยรวมก็ไม่ได้แพงมาก อยู่ในระดับที่รับได้สบายๆ สำหรับอาการทั่วไป สิ่งสำคัญที่สุดคือ <strong>อย่าปล่อยทิ้งไว้จนอาการหนัก</strong> รีบแจ้งโรงเรียนและไปพบแพทย์ตั้งแต่เนิ่นๆ</p>\n\n<p>หากคุณกำลังวางแผนไปเรียนภาษาอังกฤษที่ฟิลิปปินส์และต้องการคำแนะนำครบๆ ตั้งแต่เลือกโรงเรียน วางแผนงบประมาณ ไปจนถึงเรื่องสุขภาพและการเตรียมตัว ติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> ได้เลย มีที่ปรึกษาคนไทยคอยช่วยตอบทุกคำถามโดยไม่มีค่าใช้จ่าย ปรึกษาฟรีได้ทันที!</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: ป่วยที่ฟิลิปปินส์ต้องโทรหาใครก่อน?\nA: ให้แจ้งเจ้าหน้าที่โรงเรียนที่คุณเรียนอยู่เป็นอันดับแรก เพราะส่วนใหญ่มีระบบช่วยเหลือนักเรียนต่างชาติและสามารถพาไปโรงพยาบาลได้ทันที หากอาการหนักหรือฉุกเฉิน ให้โทร 911 ซึ่งเป็นเบอร์ฉุกเฉินทั่วประเทศฟิลิปปินส์ ใช้ได้ตลอด 24 ชั่วโมง\n\nQ: ค่าพบแพทย์ที่ฟิลิปปินส์แพงไหม?\nA: ค่าพบแพทย์ที่คลินิกทั่วไปอยู่ที่ประมาณ 300–600 เปโซ (ราว 180–360 บาท) ส่วนโรงพยาบาลเอกชนอยู่ที่ 800–1,500 เปโซ ถือว่าถูกกว่าประเทศไทยประมาณ 30–50% โดยรวมสำหรับอาการทั่วไป ค่าใช้จ่ายทั้งหมดรวมยามักไม่เกิน 2,000–3,000 เปโซ\n\nQ: ต้องซื้อประกันเดินทางก่อนไปเรียนฟิลิปปินส์ไหม?\nA: แนะนำอย่างยิ่งให้ซื้อประกันเดินทางก่อนออกจากไทยทุกครั้ง เพราะถ้าป่วยหนักและต้อง Admit โรงพยาบาล ค่าใช้จ่ายอาจสูงถึง 50,000–200,000 เปโซได้ ประกันเดินทางระยะยาว 2 เดือนมีราคาเพียง 1,500–3,500 บาท ถือว่าคุ้มค่ามากเมื่อเทียบกับความเสี่ยง\n\nQ: โรงพยาบาลที่เซบูที่รองรับชาวต่างชาติได้ดีมีที่ไหนบ้าง?\nA: โรงพยาบาลที่นักเรียนต่างชาตินิยมใช้ในเซบูได้แก่ Cebu Doctors' University Hospital และ Chong Hua Hospital ทั้งสองแห่งมีบริการรองรับชาวต่างชาติ มีล่ามและเจ้าหน้าที่พูดภาษาอังกฤษได้ดี และมาตรฐานการรักษาอยู่ในระดับสูง	/api/storage/objects/uploads/ee4ee16d-e672-4da1-8f0a-1915c27e4fb4	tips	Philingo Team	ทีม Philingo	[]	ป่วยที่ฟิลิปปินส์ทำยังไง? หาหมอที่ไหน ค่ารักษาแพงไหม	ป่วยระหว่างเรียนที่ฟิลิปปินส์ไม่ต้องตกใจ! รู้จักวิธีหาหมอ โรงพยาบาลในเซบู บาโคลอด ดาเวา ค่ารักษาเพียง 300-1,800 บาท พร้อมเคล็ดลับรับมือฉุกเฉิน	0	f	t	\N	2026-08-02 09:13:28.506972	2026-08-06 12:35:18.995	ป่วยที่ฟิลิปปินส์, หาหมอฟิลิปปินส์, โรงพยาบาลเซบู, ค่ารักษาพยาบาลฟิลิปปินส์, เรียนภาษาอังกฤษฟิลิปปินส์, โรงพยาบาลบาโคลอด, โรงพยาบาลดาเวา, ประกันสุขภาพฟิลิปปินส์, เจ็บป่วยต่างประเทศ, Cebu Doctors Hospital, คลินิกฟิลิปปินส์, เรียนต่อฟิลิปปินส์
37	cost-of-living-philippines-monthly	ค่าครองชีพในฟิลิปปินส์ ใช้เงินเดือนละเท่าไหร่? แบ่งงบแต่ละหมวดยังไง	ค่าครองชีพในฟิลิปปินส์ ใช้เงินเดือนละเท่าไหร่? แบ่งงบแต่ละหมวดยังไง	ค่าครองชีพในฟิลิปปินส์สำหรับนักเรียนไทยที่ไปเรียนภาษา	\N	\N	<p>ค่าครองชีพในฟิลิปปินส์สำหรับนักเรียนไทยที่ไปเรียนภาษาอังกฤษอยู่ที่ประมาณ <strong>35,000–60,000 บาทต่อเดือน</strong> โดยรวมค่าเรียน ค่าที่พัก อาหาร และค่าใช้จ่ายส่วนตัวแล้ว ตัวเลขนี้ถูกกว่าออสเตรเลียหรืออังกฤษกว่า 3 เท่า และยังได้คุณภาพการสอนที่ดีในระดับนานาชาติ บทความนี้จะแบ่งงบแต่ละหมวดให้ชัดเจนว่าเงินหายไปไหนบ้าง และวางแผนอย่างไรไม่ให้บานปลาย</p>\n\n<h2>ภาพรวมค่าใช้จ่ายในฟิลิปปินส์ต่อเดือนอยู่ที่เท่าไหร่?</h2>\n\n<p>ก่อนเริ่มแพ็กกระเป๋า ควรรู้ก่อนว่าค่าใช้จ่ายแต่ละเมืองไม่เท่ากัน โดยทั่วไปนักเรียนไทยส่วนใหญ่เลือกเรียนที่ <strong>เซบู (Cebu), บาโคลอด (Bacolod) หรือมะนิลา (Manila)</strong> ซึ่งมีค่าครองชีพแตกต่างกันพอสมควร ดูตารางเปรียบเทียบเบื้องต้นได้ดังนี้</p>\n\n<ul>\n  <li><strong>เซบู:</strong> ค่าใช้จ่ายรวมประมาณ 40,000–60,000 บาท/เดือน (เมืองท่องเที่ยวยอดนิยม มีโรงเรียนหลายแห่ง)</li>\n  <li><strong>บาโคลอด:</strong> ค่าใช้จ่ายรวมประมาณ 35,000–50,000 บาท/เดือน (ค่าครองชีพถูกกว่า เหมาะสำหรับงบจำกัด)</li>\n  <li><strong>มะนิลา:</strong> ค่าใช้จ่ายรวมประมาณ 45,000–65,000 บาท/เดือน (ค่าเดินทางและที่พักสูงกว่า)</li>\n  <li><strong>ดาเวา (Davao):</strong> ค่าใช้จ่ายรวมประมาณ 33,000–48,000 บาท/เดือน (ตัวเลือกประหยัดที่น่าสนใจ)</li>\n</ul>\n\n<p>ตัวเลขเหล่านี้เป็นค่าเฉลี่ยรวมทุกอย่างแล้ว ทั้งค่าเรียน ที่พัก อาหาร และค่าใช้จ่ายเบ็ดเตล็ด หากอยู่แบบประหยัดจริงๆ บางคนใช้ได้ถึง 30,000 บาท/เดือน แต่ถ้าชอบท่องเที่ยวหรือกินอาหารร้านดีๆ ก็อาจพุ่งถึง 70,000 บาทได้เช่นกัน</p>\n\n<h2>แต่ละหมวดค่าใช้จ่ายแบ่งยังไง? มีอะไรบ้าง?</h2>\n\n<h3>หมวดที่ 1: ค่าเรียนภาษาอังกฤษ (สัดส่วนใหญ่ที่สุด)</h3>\n\n<p>ค่าเรียนถือเป็นค่าใช้จ่ายก้อนใหญ่ที่สุด คิดเป็นประมาณ <strong>40–50% ของงบทั้งหมด</strong> โดยแบ่งตามประเภทโปรแกรมดังนี้</p>\n\n<ul>\n  <li><strong>General English (ESL ทั่วไป):</strong> ประมาณ 15,000–25,000 บาท/เดือน รวมที่พักและอาหารแบบ Accommodation Package แล้ว</li>\n  <li><strong>IELTS / TOEIC Preparation:</strong> ประมาณ 18,000–30,000 บาท/เดือน เน้นติวสอบโดยเฉพาะ</li>\n  <li><strong>Business English:</strong> ประมาณ 20,000–35,000 บาท/เดือน</li>\n  <li><strong>One-on-One Intensive (เรียนตัวต่อตัว 4–8 ชั่วโมง/วัน):</strong> ประมาณ 22,000–40,000 บาท/เดือน</li>\n</ul>\n\n<p>หลายโรงเรียนในฟิลิปปินส์รวม <strong>ค่าที่พักและอาหาร 3 มื้อ</strong> ไว้ในแพ็กเกจเดียว ทำให้คำนวณงบง่ายขึ้น โรงเรียนยอดนิยมที่นักเรียนไทยเลือก เช่น SMEAG, CIA, ACEF, Philinter, และ HELP ล้วนมีแพ็กเกจแบบนี้ให้เลือก</p>\n\n<h3>หมวดที่ 2: ค่าที่พัก (ถ้าเลือกอยู่นอกโรงเรียน)</h3>\n\n<p>กรณีที่ไม่ได้อยู่หอในโรงเรียน หรือต้องการอิสระมากขึ้น ค่าที่พักแยกมีดังนี้</p>\n\n<ul>\n  <li><strong>หอในโรงเรียน (Dormitory):</strong> รวมอยู่ในค่าเรียนแล้ว ประมาณ 5,000–10,000 บาท/เดือน</li>\n  <li><strong>อพาร์ตเมนต์เดี่ยว (Studio):</strong> ประมาณ 8,000–15,000 บาท/เดือน ขึ้นอยู่กับทำเล</li>\n  <li><strong>แชร์อพาร์ตเมนต์กับเพื่อน:</strong> ประมาณ 4,000–8,000 บาท/เดือน/คน ประหยัดสุด</li>\n  <li><strong>Serviced Apartment ระดับกลาง:</strong> ประมาณ 15,000–25,000 บาท/เดือน</li>\n</ul>\n\n<h3>หมวดที่ 3: ค่าอาหาร</h3>\n\n<p>ฟิลิปปินส์มีอาหารราคาถูกมากเมื่อเทียบกับไทย โดยเฉพาะร้านอาหารท้องถิ่น ค่าใช้จ่ายอาหารต่อเดือนเฉลี่ยอยู่ที่ <strong>5,000–12,000 บาท</strong> ขึ้นอยู่กับไลฟ์สไตล์</p>\n\n<ul>\n  <li>กินข้าวร้านท้องถิ่น (Turo-Turo / Carinderia): มื้อละ 40–80 บาท</li>\n  <li>ร้านอาหารระดับกลาง (ห้างสรรพสินค้า): มื้อละ 150–300 บาท</li>\n  <li>ร้านอาหารระดับพรีเมียม: มื้อละ 400–800 บาท</li>\n  <li>ซื้ออาหารทำเองหรือสะดวกซื้อ: ประหยัดได้ถึง 30–40%</li>\n</ul>\n\n<p>ถ้าโรงเรียนรวมอาหาร 3 มื้อไว้ในแพ็กเกจ ค่าใช้จ่ายส่วนนี้ลดลงเหลือแค่ <strong>ค่าอาหารนอกเวลา และของว่าง</strong> ประมาณ 2,000–4,000 บาท/เดือนเท่านั้น</p>\n\n<h3>หมวดที่ 4: ค่าเดินทาง</h3>\n\n<p>ค่าเดินทางในฟิลิปปินส์ถือว่าถูกมาก ระบบขนส่งหลักคือ <strong>Jeepney, Grab, และ Habal-Habal</strong> (มอเตอร์ไซค์รับจ้าง) โดยเฉลี่ยค่าเดินทางต่อเดือนอยู่ที่</p>\n\n<ul>\n  <li><strong>อยู่ในโรงเรียน (ไม่ต้องเดินทาง):</strong> 500–1,500 บาท/เดือน สำหรับออกไปเที่ยวสุดสัปดาห์</li>\n  <li><strong>เดินทางไปโรงเรียนเองทุกวัน:</strong> ประมาณ 2,000–4,000 บาท/เดือน</li>\n  <li><strong>ท่องเที่ยวเกาะหรือต่างเมือง:</strong> ทริปละ 2,000–6,000 บาท ขึ้นอยู่กับระยะทาง</li>\n</ul>\n\n<h3>หมวดที่ 5: ค่าใช้จ่ายเบ็ดเตล็ดและส่วนตัว</h3>\n\n<p>หมวดนี้มักถูกมองข้าม แต่สำคัญมาก ควรตั้งงบไว้ประมาณ <strong>5,000–10,000 บาท/เดือน</strong> สำหรับรายการต่อไปนี้</p>\n\n<ul>\n  <li>ซิมการ์ดและอินเทอร์เน็ต: ประมาณ 300–600 บาท/เดือน (Globe หรือ Smart)</li>\n  <li>ค่าซักรีด: ประมาณ 500–1,000 บาท/เดือน</li>\n  <li>ค่ายา, อุปกรณ์การเรียน, เครื่องเขียน: ประมาณ 500–1,500 บาท/เดือน</li>\n  <li>ค่าของใช้ส่วนตัว, เสื้อผ้า, ช้อปปิ้ง: ประมาณ 1,500–4,000 บาท/เดือน</li>\n  <li>ค่าความบันเทิง (ดูหนัง, คาเฟ่, กิจกรรม): ประมาณ 1,000–3,000 บาท/เดือน</li>\n</ul>\n\n<h2>เงินสำรองฉุกเฉินควรเตรียมเท่าไหร่?</h2>\n\n<p>นักวางแผนทางการเงินแนะนำให้เตรียม <strong>เงินสำรองอย่างน้อย 10,000–20,000 บาท</strong> แยกต่างหากจากงบประจำเดือน เพื่อรับมือกับ</p>\n\n<ul>\n  <li>ค่ารักษาพยาบาล (โรงพยาบาลเอกชนในฟิลิปปินส์ราคาสูง เฉลี่ยครั้งละ 3,000–10,000 บาท)</li>\n  <li>การต่อวีซ่าหรือค่าธรรมเนียมราชการ (ประมาณ 1,500–3,000 บาทต่อครั้ง)</li>\n  <li>ค่าตั๋วเครื่องบินฉุกเฉินกลับไทย</li>\n  <li>สิ่งของเสียหายหรือโทรศัพท์หาย</li>\n</ul>\n\n<p>นอกจากนี้ ควรทำ <strong>ประกันการเดินทาง</strong> ที่ครอบคลุมค่ารักษาพยาบาล ค่าใช้จ่ายประมาณ 1,500–3,000 บาทสำหรับ 1–3 เดือน ถือว่าคุ้มมากเมื่อเทียบกับความเสี่ยง</p>\n\n<h2>เทคนิคประหยัดค่าครองชีพในฟิลิปปินส์ให้ได้สูงสุด</h2>\n\n<p>ถ้าต้องการควบคุมงบให้อยู่ในระดับ <strong>35,000–40,000 บาท/เดือน</strong> ลองทำตามเคล็ดลับเหล่านี้</p>\n\n<ul>\n  <li><strong>เลือกแพ็กเกจรวมทุกอย่าง (Full Package):</strong> ค่าเรียน + ที่พัก + อาหาร 3 มื้อ จะประหยัดกว่าแยกจ่ายทีละอย่างมาก</li>\n  <li><strong>เลือกเมืองที่ค่าครองชีพต่ำ:</strong> บาโคลอดและดาเวาถูกกว่าเซบูเฉลี่ย 10–15%</li>\n  <li><strong>ซื้ออาหารในตลาดท้องถิ่น:</strong> ผลไม้เมืองร้อน ข้าว และกับข้าวราคาถูกมากเมื่อซื้อเองจากตลาด</li>\n  <li><strong>ใช้ Grab แชร์กับเพื่อน:</strong> แทนการนั่งคนเดียว ลดค่าเดินทางได้ 30–50%</li>\n  <li><strong>วางแผนท่องเที่ยวล่วงหน้า:</strong> บินภายในด้วย Cebu Pacific หรือ AirAsia ราคาเริ่มต้น 500–1,500 บาท ถ้าจองเร็ว</li>\n  <li><strong>ใช้ e-Wallet ท้องถิ่น:</strong> GCash และ Maya ช่วยประหยัดค่าธรรมเนียมแลกเงินและใช้จ่ายในชีวิตประจำวันได้สะดวก</li>\n</ul>\n\n<h2>สรุป: วางแผนงบเรียนฟิลิปปินส์ยังไงให้ไม่บานปลาย?</h2>\n\n<p>ค่าครองชีพในฟิลิปปินส์สำหรับนักเรียนภาษาอังกฤษอยู่ที่ <strong>35,000–60,000 บาท/เดือน</strong> โดยแบ่งหลักๆ เป็นค่าเรียน 40–50%, ค่าที่พักและอาหาร 30–35%, และค่าใช้จ่ายส่วนตัว 15–20% กุญแจสำคัญคือการเลือกแพ็กเกจให้เหมาะกับงบ และวางแผนค่าใช้จ่ายล่วงหน้าก่อนเดินทาง ถ้ายังไม่แน่ใจว่าควรเลือกเมืองไหน โรงเรียนไหน หรืองบเท่าไหรถึงพอ ปรึกษาผู้เชี่ยวชาญได้เลย</p>\n\n<p>ติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> ขอคำปรึกษาฟรีได้ทันที ทีมงานพร้อมช่วยวางแผนงบ เลือกโรงเรียน และเตรียมเอกสารทุกอย่างให้คุณ โดยไม่มีค่าใช้จ่ายในการให้คำปรึกษา</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: ค่าครองชีพในฟิลิปปินส์สำหรับนักเรียนไทยต่อเดือนเท่าไหร่?\nA: โดยเฉลี่ยอยู่ที่ 35,000–60,000 บาทต่อเดือน รวมค่าเรียน ค่าที่พัก อาหาร และค่าใช้จ่ายส่วนตัวแล้ว ตัวเลขนี้ขึ้นอยู่กับเมืองที่เลือกและไลฟ์สไตล์ของแต่ละคน บาโคลอดและดาเวาจะถูกกว่าเซบูและมะนิลาประมาณ 10–20%\n\nQ: เรียนภาษาอังกฤษที่ฟิลิปปินส์ต้องเตรียมเงินไปเท่าไหร่สำหรับ 3 เดือน?\nA: สำหรับ 3 เดือน ควรเตรียมงบประมาณรวมประมาณ 110,000–180,000 บาท รวมค่าเรียน ที่พัก อาหาร ค่าตั๋วเครื่องบินไป-กลับ (ประมาณ 8,000–15,000 บาท) และเงินสำรองฉุกเฉิน 15,000–20,000 บาท ควรแบ่งเป็นงบรายเดือนและงบฉุกเฉินให้ชัดเจนก่อนออกเดินทาง\n\nQ: เมืองไหนในฟิลิปปินส์ค่าครองชีพถูกที่สุดสำหรับเรียนภาษาอังกฤษ?\nA: บาโคลอดและดาเวาถือเป็นตัวเลือกค่าครองชีพต่ำที่สุด โดยใช้งบรวมประมาณ 33,000–50,000 บาท/เดือน ทั้งสองเมืองมีโรงเรียนภาษาอังกฤษคุณภาพดีและปลอดภัย เหมาะสำหรับคนที่งบจำกัดแต่ต้องการคุณภาพการเรียนที่ดี\n\nQ: ฟิลิปปินส์ใช้สกุลเงินอะไร และควรแลกเงินที่ไหน?\nA: ฟิลิปปินส์ใช้สกุลเงิน เปโซฟิลิปปินส์ (Philippine Peso / PHP) โดย 1 บาทไทยเท่ากับประมาณ 1.6–1.8 เปโซ (อัตราอาจเปลี่ยนแปลง) แนะนำให้แลกเงินที่ Money Changer ในฟิลิปปินส์หรือใช้บัตรเดบิตที่ ATM เพราะอัตราแลกเปลี่ยนดีกว่าแลกที่ไทยโดยเฉลี่ย 3–5%\n\nQ: ค่าวีซ่าฟิลิปปินส์สำหรับนักเรียนไทยเสียเท่าไหร่?\nA: คนไทยสามารถเข้าฟิลิปปินส์โดยไม่ต้องขอวีซ่าล่วงหน้าได้นาน 30 วัน และสามารถต่อวีซ่าท่องเที่ยวได้ที่สำนักงานตรวจคนเข้าเมือง ค่าต่อวีซ่าครั้งละประมาณ 1,500–3,000 บาท ขยายได้ครั้งละ 1–2 เดือน สำหรับการเรียนระยะยาวกว่า 6 เดือนอาจต้องขอ Student Visa เพิ่มเติม ควรปรึกษาผู้เชี่ยวชาญก่อนเดินทาง	/api/storage/objects/uploads/cecee5c8-6d1e-42c1-9489-c1fcce05c3ac	tips	Philingo Team	ทีม Philingo	[]	ค่าครองชีพในฟิลิปปินส์ ใช้เงินเดือนละเท่าไหร่? แบ่งงบแต่ละหมวด	ค่าครองชีพในฟิลิปปินส์สำหรับนักเรียนไทย อยู่ที่ 35,000–60,000 บาท/เดือน แบ่งงบค่าเรียน ที่พัก อาหาร และค่าใช้จ่ายส่วนตัวชัดเจน วางแผนการเงินไม่ให้บานปลาย	0	f	t	\N	2026-08-02 09:08:12.184698	2026-08-06 12:35:57.507	ค่าครองชีพฟิลิปปินส์, เรียนภาษาอังกฤษฟิลิปปินส์, ค่าใช้จ่ายเรียนฟิลิปปินส์, เรียนที่เซบู, เรียนที่บาโคลอด, ค่าเรียนภาษาอังกฤษฟิลิปปินส์, งบเรียนต่อฟิลิปปินส์, เรียนภาษาต่างประเทศ, ค่าที่พักฟิลิปปินส์, แพ็กเกจเรียนฟิลิปปินส์, เรียนภาษาราคาถูก, นักเรียนไทยในฟิลิปปินส์
35	famous-malls-in-philippines	ห้างสรรพสินค้าดังในฟิลิปปินส์ SM Mall Ayala Robinson ช้อปปิ้งได้ที่ไหนบ้าง	ห้างสรรพสินค้าดังในฟิลิปปินส์ SM Mall Ayala Robinson ช้อปปิ้งได้ที่ไหนบ้าง	ทำไมห้างในฟิลิปปินส์ถึงสำคัญสำหรับคนไทยที่ไปเรียนหรือท่องเที่ยว	\N	\N	<p>ฟิลิปปินส์มีห้างสรรพสินค้าขนาดใหญ่และทันสมัยกระจายอยู่ทั่วประเทศ โดยเฉพาะ 3 แบรนด์ยักษ์ใหญ่ที่นักเรียนและนักท่องเที่ยวไทยต้องรู้จัก ได้แก่ <strong>SM Mall, Ayala Mall และ Robinson's Mall</strong> ซึ่งมีสาขารวมกันมากกว่า 300 แห่งทั่วประเทศ ครอบคลุมทุกความต้องการตั้งแต่ซื้อของใช้ประจำวัน ทานอาหาร ดูหนัง ไปจนถึงช้อปปิ้งแบรนด์เนมในราคาที่จับต้องได้</p>\n\n<h2>ทำไมห้างในฟิลิปปินส์ถึงสำคัญสำหรับคนไทยที่ไปเรียนหรือท่องเที่ยว?</h2>\n\n<p>สำหรับนักเรียนไทยที่ไปเรียนภาษาอังกฤษที่ฟิลิปปินส์ ห้างสรรพสินค้าถือเป็น "จุดศูนย์กลางชีวิต" เพราะอากาศร้อนและฝนตกบ่อย การเดินห้างแบบปรับอากาศจึงเป็นกิจกรรมหลักในวันหยุด ห้างในฟิลิปปินส์ไม่ได้มีแค่ร้านค้า แต่ยังมีซูเปอร์มาร์เก็ต ร้านอาหาร โรงภาพยนตร์ ฟิตเนส และธนาคารครบในที่เดียว นอกจากนี้ราคาสินค้าในฟิลิปปินส์ยังถูกกว่าไทยในหลายหมวด เช่น เสื้อผ้าแบรนด์ท้องถิ่น อาหาร และของใช้ส่วนตัว โดยเฉลี่ยถูกกว่า <strong>20–40%</strong></p>\n\n<h2>SM Mall — ห้างที่ใหญ่ที่สุดในฟิลิปปินส์อยู่ที่ไหนบ้าง?</h2>\n\n<p><strong>SM (Shoemart) Mall</strong> คือเครือห้างที่ใหญ่ที่สุดในฟิลิปปินส์ มีสาขามากกว่า <strong>85 แห่ง</strong> ทั่วประเทศ จุดเด่นคือมีพื้นที่ขนาดใหญ่มาก บางสาขาใหญ่ติดอันดับโลก และมีร้านค้าครบทุกประเภทในราคาเข้าถึงได้</p>\n\n<ul>\n  <li><strong>SM Mall of Asia (MOA) — มะนิลา:</strong> หนึ่งในห้างที่ใหญ่ที่สุดในโลก พื้นที่กว่า 386,000 ตารางเมตร มีร้านค้ากว่า 600 ร้าน วิวอ่าวมะนิลาสวยงาม เดินทางจากสนามบินนิโนย อากีโน ประมาณ 20 นาที</li>\n  <li><strong>SM North EDSA — มะนิลา:</strong> ศูนย์การค้าเก่าแก่ใจกลางเมือง เชื่อมต่อรถไฟฟ้า MRT สถานี North Avenue ตรงๆ สะดวกมากสำหรับการเดินทาง</li>\n  <li><strong>SM City Cebu — เซบู:</strong> ห้างหลักของเมืองเซบู ใกล้กับย่าน IT Park และโรงเรียนสอนภาษาอังกฤษหลายแห่ง เดินทางจาก Mandaue หรือ Lahug ประมาณ 15–20 นาที</li>\n  <li><strong>SM Seaside City Cebu — เซบู:</strong> เปิดในปี 2015 พื้นที่กว่า 386,000 ตารางเมตร มีจุดชมวิวทะเลที่สวยมาก เหมาะสำหรับพักผ่อนวันหยุด</li>\n  <li><strong>SM City Baguio — บาเกียว:</strong> ห้างบนภูเขา อากาศเย็นสบาย เป็นแลนด์มาร์กสำคัญของเมืองบาเกียว</li>\n  <li><strong>SM City Clark — Angeles, Pampanga:</strong> ใกล้สนามบิน Clark เหมาะสำหรับนักเรียนที่เรียนในเขต Angeles หรือ Clark</li>\n</ul>\n\n<p>ราคาสินค้าใน SM ถือว่าจับต้องได้ เสื้อผ้าแบรนด์ SM ของตัวเองราคาเริ่มต้นที่ประมาณ <strong>150–500 เปโซ (ประมาณ 90–300 บาท)</strong> ซูเปอร์มาร์เก็ต SM Supermarket มีของสดและสินค้าอุปโภคบริโภคครบครัน</p>\n\n<h2>Ayala Mall — ห้างระดับพรีเมียมที่นักเรียนไทยชอบไปอยู่ที่ไหน?</h2>\n\n<p><strong>Ayala Mall</strong> คือเครือห้างระดับพรีเมียม บริหารโดยกลุ่ม Ayala Corporation หนึ่งในบริษัทที่เก่าแก่ที่สุดของฟิลิปปินส์ จุดเด่นคือการออกแบบที่ทันสมัย สะอาด มีแบรนด์ระดับกลางถึงสูง และมักตั้งอยู่ในย่านธุรกิจสำคัญ มีสาขากว่า <strong>60 แห่ง</strong> ทั่วประเทศ</p>\n\n<ul>\n  <li><strong>Greenbelt — มะนิลา (Makati):</strong> ห้างเปิดโล่งในย่าน Makati CBD มี 5 อาคารเชื่อมต่อกัน เน้นแบรนด์หรู ร้านอาหารหรู และบรรยากาศโรแมนติก เหมาะสำหรับทานข้าวเย็นหรือดื่มกาแฟชิลๆ</li>\n  <li><strong>Glorietta — มะนิลา (Makati):</strong> ติดกับ Greenbelt แต่เน้นแบรนด์ระดับกลางและร้านอาหารหลากหลายกว่า สะดวกเดินทางด้วยรถไฟฟ้า MRT สถานี Ayala</li>\n  <li><strong>Ayala Center Cebu — เซบู:</strong> ห้างพรีเมียมหลักของเมืองเซบู ตั้งอยู่ใจกลาง Cebu Business Park มีร้านอาหารนานาชาติครบ เช่น Jollibee, McDonald's, ร้านอาหารญี่ปุ่น เกาหลี และไทย ราคาอาหารเริ่มต้น <strong>150–400 เปโซ</strong></li>\n  <li><strong>Abreeza Mall — ดาเวา:</strong> ห้าง Ayala สาขาหลักของเมืองดาเวา ย่านมินดาเนา เหมาะสำหรับนักเรียนที่ไปเรียนในภาคใต้ของฟิลิปปินส์</li>\n  <li><strong>Market! Market! — มะนิลา (BGC):</strong> ห้าง Ayala ในย่าน Bonifacio Global City มีตลาดนัดกลางแจ้งและร้านค้า streetwear ที่หลากหลาย บรรยากาศเก๋และเป็นที่นิยมในหมู่คนรุ่นใหม่</li>\n</ul>\n\n<h2>Robinson's Mall — ห้างสายกลางที่หาง่ายทั่วประเทศอยู่ที่ไหนบ้าง?</h2>\n\n<p><strong>Robinson's Mall</strong> บริหารโดย Robinsons Land Corporation มีสาขากว่า <strong>50 แห่ง</strong> ทั่วฟิลิปปินส์ จุดเด่นคือมักตั้งอยู่ในทำเลที่เดินทางสะดวก ราคาสินค้าจับต้องได้ มีซูเปอร์มาร์เก็ต Robinsons Supermarket ที่ขึ้นชื่อเรื่องคุณภาพและความสะอาด เหมาะมากสำหรับนักเรียนที่ต้องการซื้อของใช้ประจำวัน</p>\n\n<ul>\n  <li><strong>Robinsons Galleria — มะนิลา (Ortigas):</strong> ห้างใหญ่ย่าน Ortigas Center เชื่อมต่อรถไฟฟ้า MRT สถานี Shaw Boulevard มีร้านค้ากว่า 400 ร้าน</li>\n  <li><strong>Robinsons Place Manila — มะนิลา (Ermita):</strong> ใกล้ Intramuros และ Manila Bay เหมาะสำหรับนักท่องเที่ยวที่อยู่ในย่านมะนิลาเก่า</li>\n  <li><strong>Robinsons Cybergate — เซบู:</strong> ติดกับย่าน IT Park เซบู เป็นที่นิยมมากในหมู่นักเรียนภาษาอังกฤษที่เรียนอยู่ในบริเวณใกล้เคียง เดินได้จากโรงเรียนหลายแห่ง</li>\n  <li><strong>Robinsons Place Iloilo — อีโลอีโล:</strong> ห้างหลักของเมือง Iloilo บนเกาะ Panay ที่กำลังเป็นที่นิยมในหมู่นักเรียนต่างชาติ</li>\n  <li><strong>Robinsons Starmills — Pampanga:</strong> ห้างขนาดใหญ่ในจังหวัด Pampanga ใกล้กับ Clark และ Angeles สะดวกสำหรับนักเรียนในพื้นที่</li>\n</ul>\n\n<h2>เปรียบเทียบ SM vs Ayala vs Robinson ต่างกันอย่างไร?</h2>\n\n<ul>\n  <li><strong>SM Mall:</strong> ใหญ่ที่สุด ราคาถูกที่สุด เหมาะสำหรับซื้อของจำเป็นและช้อปปิ้งเสื้อผ้าราคาประหยัด งบต่อทริปประมาณ <strong>500–1,500 เปโซ</strong></li>\n  <li><strong>Ayala Mall:</strong> พรีเมียมที่สุด สะอาดและดีไซน์สวย เหมาะสำหรับทานอาหาร นัดพบปะเพื่อน และช้อปปิ้งแบรนด์ งบต่อทริปประมาณ <strong>800–3,000 เปโซ</strong></li>\n  <li><strong>Robinson's Mall:</strong> สายกลาง เดินทางสะดวก ซูเปอร์มาร์เก็ตดีมาก เหมาะสำหรับซื้อของกินและของใช้รายสัปดาห์ งบต่อทริปประมาณ <strong>400–1,200 เปโซ</strong></li>\n</ul>\n\n<h2>สิ่งที่ควรซื้อในห้างฟิลิปปินส์ให้คุ้มค่าที่สุด</h2>\n\n<ul>\n  <li><strong>อาหารแช่แข็งและวัตถุดิบ:</strong> ราคาถูกกว่าไทยมาก โดยเฉพาะหมู ไก่ และผลไม้ท้องถิ่น</li>\n  <li><strong>เสื้อผ้าแบรนด์ฟิลิปปินส์:</strong> เช่น Bench, Penshoppe, Human ราคาเริ่ม <strong>200–800 เปโซ</strong> คุณภาพดีและดีไซน์ทันสมัย</li>\n  <li><strong>ของฝากและของที่ระลึก:</strong> ช็อกโกแลต Goya, Polvoron, Pastillas เป็นของฝากยอดนิยมราคาไม่แพง เริ่มต้น <strong>50–200 เปโซ</strong></li>\n  <li><strong>ยาและของใช้ส่วนตัว:</strong> ราคาถูกกว่าไทย ร้านขายยา Mercury Drug และ Rose Pharmacy มีสาขาในทุกห้าง</li>\n  <li><strong>อุปกรณ์อิเล็กทรอนิกส์:</strong> บางรุ่นราคาดีกว่าไทย โดยเฉพาะในงาน Sale ของ SM</li>\n</ul>\n\n<h2>สรุป</h2>\n\n<p>ห้างสรรพสินค้าในฟิลิปปินส์อย่าง SM Mall, Ayala Mall และ Robinson's Mall ครอบคลุมทุกเมืองสำคัญและตอบโจทย์ทุกไลฟ์สไตล์ ไม่ว่าจะเป็นนักเรียนงบน้อยหรือคนที่อยากช้อปปิ้งแบบพรีเมียม การรู้จักห้างในแต่ละเมืองจะทำให้ชีวิตในฟิลิปปินส์สะดวกและสนุกขึ้นมาก หากคุณกำลังวางแผนไปเรียนภาษาอังกฤษที่ฟิลิปปินส์และอยากรู้ว่าโรงเรียนไหนอยู่ใกล้ห้างดัง งบเรียนเท่าไหร่ หรือเมืองไหนเหมาะกับคุณที่สุด <strong>ติดต่อ Philingo by Thai Study Abroad Consultant ขอคำปรึกษาฟรีได้เลย</strong> ทีมงานคนไทยพร้อมช่วยคุณวางแผนทุกขั้นตอนตั้งแต่เลือกโรงเรียนไปจนถึงการใช้ชีวิตในต่างประเทศ</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: SM Mall, Ayala Mall และ Robinson's Mall ต่างกันอย่างไร?\nA: SM Mall เป็นเครือห้างที่ใหญ่ที่สุดในฟิลิปปินส์ เน้นราคาประหยัดและมีสาขากว่า 85 แห่ง ส่วน Ayala Mall เป็นห้างระดับพรีเมียมที่มีดีไซน์สวยงามและแบรนด์ชั้นนำ ขณะที่ Robinson's Mall เป็นสายกลาง เดินทางสะดวก และมีซูเปอร์มาร์เก็ตที่ดีมากสำหรับซื้อของใช้ประจำวัน\n\nQ: ห้างในเมืองเซบูที่นักเรียนไทยนิยมไปคือที่ไหน?\nA: ในเซบูมีห้างดังหลายแห่ง โดยที่นิยมที่สุดคือ SM City Cebu, SM Seaside City Cebu, Ayala Center Cebu และ Robinsons Cybergate ซึ่งตั้งอยู่ใกล้ย่าน IT Park ที่มีโรงเรียนสอนภาษาอังกฤษหลายแห่งอยู่โดยรอบ นักเรียนส่วนใหญ่จะเดินทางถึงห้างได้ภายใน 15–20 นาที\n\nQ: ห้างในฟิลิปปินส์เปิดกี่โมง?\nA: ห้างส่วนใหญ่ในฟิลิปปินส์เปิดทำการตั้งแต่ 10.00–21.00 น. ในวันธรรมดา และ 10.00–22.00 น. ในวันศุกร์ถึงอาทิตย์ บางสาขาในเมืองใหญ่อาจเปิดถึง 22.00 น. ทุกวัน และในช่วงเทศกาลอาจมีการขยายเวลาให้นานขึ้น\n\nQ: ใช้เงินเท่าไหร่ต่อทริปสำหรับการช้อปปิ้งในห้างฟิลิปปินส์?\nA: งบเฉลี่ยต่อทริปขึ้นอยู่กับห้างที่เลือก หากไป SM Mall จะใช้งบประมาณ 500–1,500 เปโซ (ประมาณ 300–900 บาท) สำหรับค่าอาหารและสินค้าทั่วไป ส่วน Ayala Mall อาจใช้งบ 800–3,000 เปโซขึ้นไปหากรวมช้อปปิ้งเสื้อผ้าและทานอาหารมื้อดี\n\nQ: นักเรียนที่ไปเรียนภาษาอังกฤษที่ฟิลิปปินส์ควรไปห้างเมืองไหนดี?\nA: ขึ้นอยู่กับเมืองที่เรียน หากเรียนที่เซบูแนะนำ SM City Cebu และ Ayala Center Cebu หากอยู่มะนิลาควรไป SM Mall of Asia หรือ Greenbelt Makati และหากอยู่ Clark หรือ Angeles แนะนำ SM City Clark และ Robinsons Starmills ซึ่งสะดวกเดินทางและมีสินค้าครบครัน	/api/storage/objects/uploads/7b8eac34-da80-42c3-a377-faa3ebb8b044	life	Philingo Team	ทีม Philingo	[]	ห้างดังฟิลิปปินส์ SM Ayala Robinson ช้อปได้ที่ไหนบ้าง	รู้จัก 3 ห้างดังในฟิลิปปินส์ SM Mall, Ayala Mall และ Robinson's Mall กว่า 300 สาขาทั่วประเทศ เหมาะสำหรับนักเรียนไทยที่เรียนภาษาอังกฤษและนักท่องเที่ยว ช้อปถูกกว่าไทยถึง 40%	0	f	t	\N	2026-08-02 09:06:33.108113	2026-08-06 13:15:43.436	ห้างในฟิลิปปินส์, SM Mall, Ayala Mall, Robinson's Mall, ช้อปปิ้งฟิลิปปินส์, เรียนภาษาอังกฤษฟิลิปปินส์, SM Mall of Asia, ห้างเซบู, ห้างมะนิลา, เที่ยวฟิลิปปินส์, นักเรียนไทยในฟิลิปปินส์
28	what-is-local-fee-philippines	Local Fee คืออะไร? ค่าใช้จ่ายพิเศษที่ต้องรู้ก่อนไปเรียนที่ฟิลิปปินส์	Local Fee คืออะไร? ค่าใช้จ่ายพิเศษที่ต้องรู้ก่อนไปเรียนที่ฟิลิปปินส์	Local Fee คืออะไรทำไมต้องจ่ายไปเรียนต่อฟิลิปปินส์	\N	\N	<p><strong>Local Fee คือค่าธรรมเนียมพิเศษที่โรงเรียนสอนภาษาอังกฤษในฟิลิปปินส์เก็บเพิ่มจากค่าเรียนปกติ</strong> โดยทั่วไปอยู่ที่ประมาณ <strong>3,000–8,000 เปโซฟิลิปปินส์ต่อเดือน</strong> (ราว 1,800–4,800 บาท) ขึ้นอยู่กับโรงเรียนและโปรแกรมที่เลือก หากไม่รู้จักค่าใช้จ่ายส่วนนี้ล่วงหน้า งบประมาณที่วางไว้อาจพังตั้งแต่เดือนแรกที่เหยียบแผ่นดินฟิลิปปินส์เลยทีเดียว</p>\n\n<h2>Local Fee คืออะไร? แตกต่างจากค่าเรียนปกติอย่างไร?</h2>\n\n<p>หลายคนที่เตรียมตัวไปเรียนภาษาอังกฤษที่ฟิลิปปินส์มักสับสนว่า <strong>Local Fee</strong> คืออะไรกันแน่ พูดง่ายๆ คือ ค่าใช้จ่ายที่โรงเรียนเรียกเก็บสำหรับ <strong>การใช้สิ่งอำนวยความสะดวกภายในโรงเรียน</strong> ที่ไม่ได้รวมอยู่ในค่าเรียนหลัก เช่น ค่าใช้บริการห้องสมุด ค่าอินเทอร์เน็ต ค่าห้องออกกำลังกาย ค่าซักรีด หรือแม้แต่ค่าไฟฟ้าในหอพักของโรงเรียน</p>\n\n<p>ในแง่เทคนิค ค่าเรียนหลักที่คุณจ่ายไปครอบคลุมเฉพาะ <strong>ชั่วโมงเรียนและที่พักพื้นฐาน</strong> เท่านั้น ส่วน Local Fee จะถูกแยกออกมาต่างหากเพื่อให้โรงเรียนสามารถบริหารต้นทุนบริการเสริมได้อย่างยืดหยุ่น โดยเฉพาะโรงเรียนใน <strong>เมืองเซบู, บาเกียว และดูมาเกเต</strong> ซึ่งเป็น 3 เมืองหลักที่คนไทยนิยมไปเรียน ล้วนมีการเก็บ Local Fee ในรูปแบบนี้แทบทั้งสิ้น</p>\n\n<h2>Local Fee มีอะไรบ้าง? รายละเอียดที่ต้องรู้</h2>\n\n<p>Local Fee ไม่ได้มีแค่รายการเดียว แต่รวมค่าใช้จ่ายหลายอย่างเข้าด้วยกัน ซึ่งแต่ละโรงเรียนอาจจัดกลุ่มแตกต่างกันออกไป โดยทั่วไปประกอบด้วย:</p>\n\n<ul>\n  <li><strong>ค่าไฟฟ้าและน้ำ (Electricity & Water Fee):</strong> เฉลี่ย 1,500–3,000 เปโซต่อเดือน บางโรงเรียนคิดตามการใช้งานจริง บางแห่งคิดแบบเหมาจ่าย</li>\n  <li><strong>ค่าอินเทอร์เน็ต (Internet Fee):</strong> ประมาณ 500–1,500 เปโซต่อเดือน สำหรับ Wi-Fi ในห้องพักหรือพื้นที่ส่วนกลาง</li>\n  <li><strong>ค่าซักรีด (Laundry Fee):</strong> 500–1,000 เปโซต่อเดือน บางโรงเรียนรวมอยู่ในแพ็กเกจ บางแห่งแยกชำระ</li>\n  <li><strong>ค่าบริการสิ่งอำนวยความสะดวก (Facility Fee):</strong> รวมค่าใช้ยิม, สระว่ายน้ำ, ห้องสมุด อยู่ที่ 500–2,000 เปโซต่อเดือน</li>\n  <li><strong>ค่าประกันและค่าธรรมเนียมแรกเข้า (Insurance & Registration Fee):</strong> จ่ายครั้งเดียวตอนลงทะเบียน ประมาณ 2,000–5,000 เปโซ</li>\n</ul>\n\n<p>รวมแล้ว Local Fee ทั้งหมดต่อเดือนอาจอยู่ที่ <strong>3,000–8,000 เปโซ</strong> หรือคิดเป็นเงินไทยราว <strong>1,800–4,800 บาทต่อเดือน</strong> ถือเป็นตัวเลขที่ไม่ควรมองข้ามเลย</p>\n\n<h2>Local Fee แต่ละโรงเรียนต่างกันแค่ไหน?</h2>\n\n<p>ราคา Local Fee ขึ้นอยู่กับหลายปัจจัย ทั้งขนาดโรงเรียน ที่ตั้ง และบริการที่รวมอยู่ในแพ็กเกจ ลองดูตัวอย่างเปรียบเทียบจากโรงเรียนยอดนิยมในแต่ละเมือง:</p>\n\n<ul>\n  <li><strong>โรงเรียนในเซบู (Cebu):</strong> Local Fee เฉลี่ย <strong>4,000–7,000 เปโซต่อเดือน</strong> เพราะค่าครองชีพในเมืองสูงกว่า โรงเรียนขนาดใหญ่อย่าง PINES, CIA มักรวมบริการหลายอย่างไว้ในแพ็กเกจเดียว</li>\n  <li><strong>โรงเรียนในบาเกียว (Baguio):</strong> Local Fee ประมาณ <strong>3,000–5,000 เปโซต่อเดือน</strong> อากาศเย็นทำให้ค่าไฟต่ำกว่า แต่ค่าน้ำอาจสูงกว่าในบางช่วง</li>\n  <li><strong>โรงเรียนในดูมาเกเต (Dumaguete):</strong> Local Fee ต่ำสุดในสามเมือง อยู่ที่ <strong>2,500–4,500 เปโซต่อเดือน</strong> เหมาะสำหรับคนงบจำกัด</li>\n</ul>\n\n<p>ข้อควรรู้คือ บางโรงเรียนโฆษณาค่าเรียนในราคาถูกมาก แต่แยก Local Fee ออกมาเป็นก้อนใหญ่ ดังนั้นก่อนตัดสินใจ <strong>ควรถามให้ชัดเจนว่า Local Fee รวมอะไรบ้างและต่อเดือนเท่าไหร่</strong> เพื่อนำมาคำนวณงบรวมให้ถูกต้อง</p>\n\n<h2>วิธีคำนวณงบประมาณรวมที่แท้จริงก่อนไปเรียนฟิลิปปินส์</h2>\n\n<p>เพื่อไม่ให้งบบวม ควรคำนวณค่าใช้จ่ายรายเดือนแบบครบถ้วนดังนี้:</p>\n\n<ul>\n  <li><strong>ค่าเรียน (Tuition Fee):</strong> 20,000–35,000 เปโซต่อเดือน ขึ้นอยู่กับโปรแกรมและจำนวนชั่วโมงเรียน</li>\n  <li><strong>ค่าที่พัก (Accommodation):</strong> รวมอยู่ในค่าเรียนแล้วสำหรับโรงเรียนแบบ Boarding School แต่บางโรงแยกออกมา 8,000–15,000 เปโซ</li>\n  <li><strong>Local Fee:</strong> 3,000–8,000 เปโซต่อเดือน (ตามที่อธิบายไว้ข้างต้น)</li>\n  <li><strong>ค่าอาหาร:</strong> หากอาหาร 3 มื้อรวมอยู่ในแพ็กเกจแล้ว ค่าใช้จ่ายส่วนนี้จะน้อยลง แต่ถ้าไม่รวมเตรียมไว้ 5,000–8,000 เปโซต่อเดือน</li>\n  <li><strong>ค่าใช้จ่ายส่วนตัวและท่องเที่ยวสุดสัปดาห์:</strong> ประมาณ 3,000–6,000 เปโซต่อเดือน</li>\n</ul>\n\n<p>รวมทั้งหมดต่อเดือนอยู่ที่ประมาณ <strong>35,000–65,000 เปโซ หรือราว 21,000–39,000 บาท</strong> สำหรับโปรแกรมแบบ Full Board (รวมค่าเรียน ที่พัก และอาหาร) ซึ่ง Local Fee ก็คิดเป็นสัดส่วนราว <strong>8–15% ของงบรวมต่อเดือน</strong> ไม่น้อยเลยทีเดียว</p>\n\n<h2>เคล็ดลับประหยัด Local Fee ได้อย่างไร?</h2>\n\n<p>แม้ Local Fee จะเป็นค่าใช้จ่ายที่หลีกเลี่ยงได้ยาก แต่มีวิธีที่ช่วยให้จ่ายน้อยลงได้:</p>\n\n<ul>\n  <li><strong>เลือกห้องพักที่เหมาะสม:</strong> ห้องแบบ Twin Sharing หรือ Triple Sharing มี Local Fee ต่ำกว่าห้อง Single ชัดเจน บางโรงเรียนส่วนต่างอาจสูงถึง <strong>1,500–2,500 เปโซต่อเดือน</strong></li>\n  <li><strong>ใช้ไฟฟ้าอย่างประหยัด:</strong> โรงเรียนที่คิดค่าไฟตามจริง ควรปิดแอร์เมื่อไม่ใช้งาน ซึ่งช่วยลดบิลได้ 500–1,000 เปโซต่อเดือน</li>\n  <li><strong>เลือกโรงเรียนที่รวม Local Fee ในแพ็กเกจ:</strong> บางโรงเรียนออกแบบโปรแกรมแบบ All-inclusive ที่รวม Local Fee ไว้เรียบร้อยแล้ว ทำให้วางแผนงบง่ายขึ้น</li>\n  <li><strong>เรียนในดูมาเกเตแทนเซบู:</strong> หากงบจำกัด การเลือกเมืองที่ค่าครองชีพต่ำกว่าช่วยประหยัด Local Fee ได้ถึง <strong>1,500–3,000 เปโซต่อเดือน</strong></li>\n</ul>\n\n<h2>สรุป</h2>\n\n<p>Local Fee คือหนึ่งในค่าใช้จ่ายที่คนไปเรียนฟิลิปปินส์มือใหม่มักลืมนึกถึงบ่อยที่สุด แต่กลับมีผลต่องบประมาณรวมอย่างมีนัยสำคัญ การเข้าใจว่า Local Fee คืออะไร รวมอะไรบ้าง และแต่ละโรงเรียนเก็บเท่าไหร่ จะช่วยให้คุณวางแผนการเงินได้แม่นยำและไม่ช็อกกับตัวเลขที่ไม่คาดคิด</p>\n\n<p>หากคุณกำลังมองหาโรงเรียนที่เหมาะกับงบประมาณและเป้าหมายของคุณ <strong>Philingo by Thai Study Abroad Consultant</strong> พร้อมให้คำปรึกษาฟรี ตั้งแต่การเลือกโรงเรียน วิเคราะห์ค่าใช้จ่ายจริง รวมถึง Local Fee ของแต่ละแห่งอย่างละเอียด เพื่อให้คุณตัดสินใจได้อย่างมั่นใจก่อนออกเดินทาง ติดต่อขอคำปรึกษาฟรีได้เลยวันนี้!</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: Local Fee ต้องจ่ายทุกเดือนหรือเปล่า?\nA: ใช่ Local Fee ส่วนใหญ่เป็นค่าใช้จ่ายรายเดือนที่เรียกเก็บควบคู่กับค่าเรียน โดยทั่วไปอยู่ที่ 3,000–8,000 เปโซต่อเดือน อย่างไรก็ตาม บางรายการเช่นค่าประกันและค่าธรรมเนียมแรกเข้าจ่ายครั้งเดียวตอนลงทะเบียน ราว 2,000–5,000 เปโซ\n\nQ: Local Fee รวมอยู่ในค่าเรียนที่โฆษณาไว้แล้วหรือเปล่า?\nA: ขึ้นอยู่กับแต่ละโรงเรียน บางแห่งรวม Local Fee ไว้ในแพ็กเกจ All-inclusive แล้ว แต่หลายโรงเรียนแยกออกมาต่างหาก ดังนั้นควรถามให้ชัดเจนก่อนสมัครว่าค่าเรียนที่โฆษณาครอบคลุม Local Fee หรือไม่ เพื่อนำมาคำนวณงบรวมที่แท้จริง\n\nQ: โรงเรียนในเมืองไหนมี Local Fee ถูกที่สุด?\nA: โรงเรียนในเมืองดูมาเกเต (Dumaguete) มี Local Fee ต่ำที่สุดในบรรดา 3 เมืองหลัก อยู่ที่ประมาณ 2,500–4,500 เปโซต่อเดือน รองลงมาคือบาเกียว 3,000–5,000 เปโซ และเซบูสูงสุดที่ 4,000–7,000 เปโซต่อเดือน\n\nQ: มีวิธีไหนที่จะช่วยลด Local Fee ได้บ้าง?\nA: วิธีที่ได้ผลที่สุดคือเลือกห้อง Twin Sharing หรือ Triple Sharing แทนห้อง Single ซึ่งช่วยลด Local Fee ได้ถึง 1,500–2,500 เปโซต่อเดือน นอกจากนี้การประหยัดไฟในห้องพัก เช่น ปิดแอร์เมื่อออกไปเรียน ก็ช่วยลดค่าไฟที่คิดตามจริงได้อีก 500–1,000 เปโซต่อเดือน	/api/storage/objects/uploads/17cccbad-7407-43cc-b1eb-adc3000520bc	tips	Philingo Team	ทีม Philingo	[]	Local Fee คืออะไร? ค่าใช้จ่ายที่ต้องรู้ก่อนเรียนฟิลิปปินส์	Local Fee คือค่าธรรมเนียมพิเศษที่โรงเรียนในฟิลิปปินส์เก็บเพิ่ม 3,000–8,000 เปโซต่อเดือน ครอบคลุมค่าไฟ อินเทอร์เน็ต ซักรีด และสิ่งอำนวยความสะดวก วางแผนงบให้แม่นยำก่อนไปเรียน!	0	f	t	\N	2026-08-02 09:00:06.745127	2026-08-06 13:09:01.278	Local Fee คืออะไร, เรียนภาษาอังกฤษฟิลิปปินส์, ค่าใช้จ่ายเรียนฟิลิปปินส์, เรียนที่เซบู, เรียนที่บาเกียว, โรงเรียนภาษาอังกฤษฟิลิปปินส์, ค่าธรรมเนียมโรงเรียนฟิลิปปินส์, งบเรียนต่อฟิลิปปินส์, ค่าครองชีพฟิลิปปินส์, เรียนภาษาที่ดูมาเกเต, ค่าที่พักฟิลิปปินส์, เปโซฟิลิปปินส์
30	how-to-travel-bangkok-to-baguio	วิธีเดินทางจากกรุงเทพไปบาเกียว ฟิลิปปินส์ ไปยังไง ไกลแค่ไหน	วิธีเดินทางจากกรุงเทพไปบาเกียว ฟิลิปปินส์ ไปยังไง ไกลแค่ไหน	การเดินทางจากกรุงเทพไปบาเกียว ฟิลิปปินส์ 	\N	\N	<p>การเดินทางจากกรุงเทพไปบาเกียว ฟิลิปปินส์ ใช้เวลารวมประมาณ <strong>8–12 ชั่วโมง</strong> ขึ้นอยู่กับเส้นทางที่เลือก โดยต้องบินไปมะนิลาก่อน จากนั้นต่อรถโดยสารหรือเครื่องบินภายในประเทศขึ้นไปยังบาเกียวอีกต่อหนึ่ง ค่าใช้จ่ายโดยรวมอยู่ที่ประมาณ <strong>5,000–15,000 บาท</strong> ต่อคน ขึ้นอยู่กับสายการบินและช่วงเวลาที่จอง</p>\n\n<h2>บาเกียวอยู่ที่ไหน และไกลจากกรุงเทพแค่ไหน?</h2>\n\n<p>บาเกียว (Baguio City) ตั้งอยู่ทางตอนเหนือของเกาะลูซอน ประเทศฟิลิปปินส์ ห่างจากมะนิลาขึ้นไปทางเหนือประมาณ <strong>250 กิโลเมตร</strong> และอยู่บนความสูงเฉลี่ย <strong>1,500 เมตรเหนือระดับน้ำทะเล</strong> ทำให้อากาศเย็นสบายตลอดปี อุณหภูมิเฉลี่ยอยู่ที่ <strong>14–23 องศาเซลเซียส</strong> ซึ่งเป็นสาเหตุที่หลายคนเลือกที่นี่สำหรับการเรียนภาษาอังกฤษ</p>\n\n<p>ระยะทางจากกรุงเทพถึงบาเกียวโดยตรงไม่มีเที่ยวบิน ต้องผ่านมะนิลาเสมอ ซึ่งระยะทางทางอากาศจากกรุงเทพไปมะนิลาอยู่ที่ประมาณ <strong>2,200 กิโลเมตร</strong> และจากมะนิลาไปบาเกียวอีกประมาณ <strong>250 กิโลเมตร</strong> รวมทั้งหมดคือเกือบ <strong>2,450 กิโลเมตร</strong></p>\n\n<h2>เดินทางจากกรุงเทพไปบาเกียวยังไง? มีกี่เส้นทาง?</h2>\n\n<p>มีเส้นทางหลักอยู่ <strong>2 แบบ</strong> ให้เลือก คือบินตรงไปมะนิลาแล้วต่อรถโดยสาร หรือบินไปมะนิลาแล้วต่อเครื่องบินภายในประเทศไปยังสนามบินใกล้บาเกียว ซึ่งแต่ละแบบมีข้อดีข้อเสียแตกต่างกัน</p>\n\n<h3>เส้นทางที่ 1: กรุงเทพ → มะนิลา → บาเกียว (โดยรถโดยสาร)</h3>\n\n<ul>\n  <li><strong>ขั้นตอนที่ 1:</strong> บินจากสุวรรณภูมิหรือดอนเมืองไปสนามบินนินอย อากีโน มะนิลา ใช้เวลา <strong>3–3.5 ชั่วโมง</strong></li>\n  <li><strong>ขั้นตอนที่ 2:</strong> จากสนามบินมะนิลา เดินทางไปสถานีรถโดยสาร Victory Liner หรือ Genesis Transport ที่ Pasay หรือ Cubao ใช้เวลาประมาณ <strong>1–1.5 ชั่วโมง</strong> ขึ้นอยู่กับการจราจร</li>\n  <li><strong>ขั้นตอนที่ 3:</strong> นั่งรถโดยสารจากมะนิลาไปบาเกียว ใช้เวลาประมาณ <strong>5–6 ชั่วโมง</strong> ค่าตั๋วประมาณ <strong>600–900 เปโซฟิลิปปินส์</strong> (ประมาณ 350–520 บาท)</li>\n</ul>\n\n<p>เส้นทางนี้เป็น<strong>ที่นิยมที่สุด</strong>สำหรับนักเรียนที่มาเรียนภาษาอังกฤษที่บาเกียว เพราะราคาถูกและสะดวก รถโดยสาร Victory Liner มีรอบเดินรถตลอดวัน และบางเที่ยวก็ออกช่วงดึกให้เลือกด้วย</p>\n\n<h3>เส้นทางที่ 2: กรุงเทพ → มะนิลา → San Fernando → บาเกียว</h3>\n\n<ul>\n  <li>บินมะนิลาเหมือนเดิม จากนั้นต่อรถไปยัง San Fernando, La Union ก่อน</li>\n  <li>จาก San Fernando ต่อรถท้องถิ่น (Jeepney หรือ Bus) ขึ้นไปบาเกียวอีกประมาณ <strong>1.5 ชั่วโมง</strong></li>\n  <li>เส้นทางนี้ไม่ค่อยนิยมในหมู่นักเรียนไทย มักใช้เฉพาะกรณีที่ต้องการแวะท่องเที่ยวชายฝั่ง San Fernando ก่อน</li>\n</ul>\n\n<h3>เส้นทางที่ 3: กรุงเทพ → มะนิลา → Laoag หรือ Cauayan (บินภายใน)</h3>\n\n<ul>\n  <li>มีสนามบินเล็กๆ ในแถบ Ilocos Region อย่าง Laoag International Airport ที่ใกล้กว่า แต่ยังต้องต่อรถเข้าบาเกียวอีกประมาณ <strong>3–4 ชั่วโมง</strong></li>\n  <li>ค่าตั๋วเครื่องบินภายในประเทศเพิ่มขึ้นอีก <strong>1,500–4,000 บาท</strong> ทำให้ตัวเลือกนี้ไม่ค่อยคุ้มค่านัก</li>\n  <li>แนะนำสำหรับคนที่เวลาน้อยและงบไม่ใช่ปัญหา</li>\n</ul>\n\n<h2>ค่าใช้จ่ายในการเดินทางจากกรุงเทพไปบาเกียวเท่าไหร่?</h2>\n\n<p>ค่าใช้จ่ายหลักที่ต้องคำนึงถึงมีดังนี้</p>\n\n<ul>\n  <li><strong>ตั๋วเครื่องบิน กรุงเทพ–มะนิลา:</strong> ราคาเริ่มต้น <strong>3,500–8,000 บาท</strong> (ไป-กลับ) ขึ้นอยู่กับสายการบินและช่วงเวลาจอง สายการบินที่บินเส้นทางนี้ได้แก่ Cebu Pacific, Philippine Airlines, AirAsia และ Thai Airways</li>\n  <li><strong>รถโดยสารมะนิลา–บาเกียว:</strong> <strong>350–520 บาท</strong> ต่อเที่ยว (ประมาณ 600–900 เปโซ)</li>\n  <li><strong>ค่า Grab/Taxi จากสนามบินไปสถานีรถ:</strong> ประมาณ <strong>200–400 บาท</strong> (350–700 เปโซ)</li>\n  <li><strong>รวมค่าเดินทางทั้งหมด (ไปเที่ยวเดียว):</strong> ประมาณ <strong>4,000–9,000 บาท</strong></li>\n</ul>\n\n<p>ถ้าจองตั๋วล่วงหน้า 1–2 เดือน สามารถประหยัดค่าตั๋วได้มากถึง <strong>30–50%</strong> โดยเฉพาะสายการบิน Cebu Pacific และ AirAsia ที่มักมีโปรโมชันบ่อยครั้ง</p>\n\n<h2>เคล็ดลับการเดินทางไปบาเกียวที่ควรรู้ก่อนออกเดินทาง</h2>\n\n<ul>\n  <li><strong>จองรถโดยสารล่วงหน้า:</strong> โดยเฉพาะช่วงวันหยุดยาวหรือเทศกาล รถ Victory Liner เต็มเร็วมาก แนะนำให้จองออนไลน์หรือโทรสำรองที่นั่ง</li>\n  <li><strong>เลือกเที่ยวบินที่ลงมะนิลาไม่ช้าเกินไป:</strong> ควรถึงมะนิลาก่อน 15.00 น. เพื่อให้ทันรถโดยสารรอบบ่ายไปบาเกียว เพราะการจราจรในมะนิลาช่วงเย็นรถติดมาก</li>\n  <li><strong>เตรียมเสื้อกันหนาว:</strong> บาเกียวอากาศเย็น โดยเฉพาะช่วงเดือนพฤศจิกายน–กุมภาพันธ์ อุณหภูมิอาจลงไปถึง <strong>10–14 องศาเซลเซียส</strong></li>\n  <li><strong>ซิม/อินเทอร์เน็ต:</strong> ซื้อซิม Smart หรือ Globe ที่สนามบินมะนิลาได้เลย ราคาเริ่มต้น <strong>99–299 เปโซ</strong> (57–170 บาท) ครอบคลุมสัญญาณดีในบาเกียว</li>\n  <li><strong>เงินสกุลเปโซ:</strong> แลกเงินที่สนามบินสุวรรณภูมิหรือมะนิลาก็ได้ อัตราแลกเปลี่ยนอยู่ที่ประมาณ <strong>1 บาท = 1.7–1.8 เปโซ</strong></li>\n</ul>\n\n<h2>บาเกียวเหมาะกับการเรียนภาษาอังกฤษไหม?</h2>\n\n<p>บาเกียวเป็นหนึ่งในเมืองยอดนิยมสำหรับนักเรียนไทยที่มาเรียนภาษาอังกฤษที่ฟิลิปปินส์ เนื่องจากอากาศเย็นสบาย ค่าครองชีพต่ำกว่ามะนิลาและเซบูประมาณ <strong>20–30%</strong> และมีโรงเรียนสอนภาษาอังกฤษคุณภาพดีหลายแห่ง เช่น BECI, Philinter, PINES และ LAAC ที่มีหลักสูตรเฉพาะทาง ค่าเรียนโดยเฉลี่ยอยู่ที่ <strong>25,000–45,000 บาทต่อเดือน</strong> รวมที่พักและอาหาร 3 มื้อ</p>\n\n<p>นักเรียนหลายคนบอกว่าบรรยากาศที่บาเกียวช่วยให้มีสมาธิเรียนมากกว่าเมืองใหญ่ เพราะเงียบสงบกว่า และอากาศดีทำให้ไม่ง่วงในชั้นเรียน</p>\n\n<h2>สรุป</h2>\n\n<p>การเดินทางจากกรุงเทพไปบาเกียวใช้เวลารวมประมาณ <strong>8–12 ชั่วโมง</strong> โดยต้องบินผ่านมะนิลาก่อนแล้วต่อรถโดยสารขึ้นเหนืออีก <strong>5–6 ชั่วโมง</strong> ค่าใช้จ่ายเดินทางอยู่ที่ <strong>4,000–9,000 บาท</strong> ต่อเที่ยว ถ้าวางแผนดีและจองล่วงหน้า ก็สามารถประหยัดได้มาก บาเกียวเป็นจุดหมายที่น่าสนใจมากสำหรับใครที่อยากเรียนภาษาอังกฤษในบรรยากาศที่เย็นสบายและราคาไม่แพง</p>\n\n<p>หากคุณสนใจเรียนภาษาอังกฤษที่บาเกียวหรือเมืองอื่นในฟิลิปปินส์ สามารถติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> เพื่อขอคำปรึกษาฟรีได้เลย ทีมงานพร้อมช่วยวางแผนเส้นทางเดินทาง เลือกโรงเรียน และดูแลทุกขั้นตอนให้คุณอย่างครบวงจร</p>\n\n---\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: จากกรุงเทพไปบาเกียวใช้เวลานานแค่ไหน?\nA: รวมทุกขั้นตอนใช้เวลาประมาณ 8–12 ชั่วโมง แบ่งเป็นบินกรุงเทพ–มะนิลา 3–3.5 ชั่วโมง เดินทางในมะนิลาไปสถานีรถอีก 1–1.5 ชั่วโมง และนั่งรถโดยสารมะนิลา–บาเกียวอีกประมาณ 5–6 ชั่วโมง ดังนั้นควรวางแผนให้เผื่อเวลาไว้มากๆ โดยเฉพาะช่วงที่มะนิลามีการจราจรหนาแน่น\n\nQ: ค่าเดินทางจากกรุงเทพไปบาเกียวเท่าไหร่?\nA: ค่าใช้จ่ายโดยประมาณอยู่ที่ 4,000–9,000 บาทต่อเที่ยว ประกอบด้วยค่าตั๋วเครื่องบินกรุงเทพ–มะนิลา 3,500–8,000 บาท และค่ารถโดยสารมะนิลา–บาเกียวอีกประมาณ 350–520 บาท ถ้าจองตั๋วเครื่องบินล่วงหน้า 1–2 เดือนในช่วงโปรโมชัน สามารถลดค่าใช้จ่ายได้มากถึง 30–50%\n\nQ: มีเที่ยวบินตรงจากกรุงเทพไปบาเกียวไหม?\nA: ไม่มีเที่ยวบินตรงจากกรุงเทพไปบาเกียว เพราะบาเกียวไม่มีสนามบินพาณิชย์ขนาดใหญ่รองรับเที่ยวบินระหว่างประเทศ ทุกเส้นทางต้องผ่านสนามบินนินอย อากีโน กรุงมะนิลาก่อน จากนั้นจึงต่อรถโดยสารขึ้นเหนือไปบาเกียวอีกประมาณ 5–6 ชั่วโมง\n\nQ: สายการบินไหนบินกรุงเทพ–มะนิลาบ้าง?\nA: สายการบินที่บินเส้นทางกรุงเทพ–มะนิลามีหลายสาย ได้แก่ Cebu Pacific, Philippine Airlines, AirAsia, Thai Airways และ Bangkok Airways โดย Cebu Pacific และ AirAsia มักมีราคาถูกสุดเริ่มต้นที่ 3,500–5,000 บาท ส่วน Philippine Airlines และ Thai Airways ราคาสูงกว่าแต่บริการดีกว่าและมีสัมภาระฟรีรวมอยู่ด้วย	/api/storage/objects/uploads/ea27cb03-761e-4724-9d10-230a055ae1d1	tips	Philingo Team	ทีม Philingo	[]	เดินทางจากกรุงเทพไปบาเกียว ฟิลิปปินส์ ไปยังไง ไกลแค่ไหน	วิธีเดินทางจากกรุงเทพไปบาเกียว ฟิลิปปินส์ ระยะทางเกือบ 2,450 กม. ใช้เวลา 8-12 ชม. มี 3 เส้นทางให้เลือก ค่าใช้จ่ายเริ่มต้น 5,000 บาท พร้อมขั้นตอนละเอียด	0	f	t	\N	2026-08-02 09:01:45.978643	2026-08-06 13:03:35.698	เดินทางจากกรุงเทพไปบาเกียว, กรุงเทพไปบาเกียว, บาเกียวฟิลิปปินส์, วิธีเดินทางไปบาเกียว, รถโดยสารมะนิลาบาเกียว, เรียนภาษาอังกฤษบาเกียว, บินไปบาเกียว, มะนิลาไปบาเกียว, ระยะทางกรุงเทพบาเกียว, ค่าเดินทางไปบาเกียว, Victory Liner บาเกียว, เที่ยวบินไปฟิลิปปินส์
29	how-to-travel-bangkok-to-cebu	วิธีเดินทางจากกรุงเทพไปเซบู ฟิลิปปินส์ ต่อเครื่องที่ไหน ใช้เวลาเท่าไหร่	วิธีเดินทางจากกรุงเทพไปเซบู ฟิลิปปินส์ ต่อเครื่องที่ไหน ใช้เวลาเท่าไหร่	การเดินทางจากกรุงเทพไปเซบู ฟิลิปปินส์ 	\N	\N	<p>การเดินทางจากกรุงเทพไปเซบู ฟิลิปปินส์ <strong>ไม่มีเที่ยวบินตรง</strong> ต้องต่อเครื่องอย่างน้อย 1 ครั้ง โดยเส้นทางยอดนิยมคือต่อเครื่องที่มะนิลา (MNL) หรือมาเก๊า ใช้เวลารวมทั้งหมดประมาณ <strong>5–10 ชั่วโมง</strong> ขึ้นอยู่กับสายการบินและระยะเวลารอต่อเครื่อง ค่าตั๋วเครื่องบินเริ่มต้นที่ประมาณ <strong>4,000–15,000 บาท</strong> ขึ้นอยู่กับช่วงเวลาจองและสายการบินที่เลือก</p>\n\n<h2>จากกรุงเทพไปเซบูต้องต่อเครื่องที่ไหนบ้าง?</h2>\n\n<p>เนื่องจากไม่มีเที่ยวบินตรงจากสนามบินสุวรรณภูมิหรือดอนเมืองไปยังสนามบินมาเซบู (Mactan-Cebu International Airport / CEB) ผู้เดินทางจึงต้องเลือกจุดต่อเครื่องใดจุดหนึ่งดังนี้</p>\n\n<ul>\n  <li><strong>มะนิลา (Ninoy Aquino International Airport / MNL)</strong> — ตัวเลือกยอดนิยมที่สุด มีเที่ยวบินจากกรุงเทพไปมะนิลาบ่อยมาก จากนั้นต่อเครื่องภายในประเทศไปเซบูอีก 1 ชั่วโมง 15 นาที สายการบินที่ใช้บินระหว่างมะนิลา-เซบู เช่น Cebu Pacific, Philippine Airlines และ AirAsia Philippines</li>\n  <li><strong>มาเก๊า (Macau International Airport / MFM)</strong> — Air Macau มีเที่ยวบินบางช่วงที่ผ่านมาเก๊า ใช้เวลารอต่อเครื่องประมาณ 1–3 ชั่วโมง</li>\n  <li><strong>กัวลาลัมเปอร์ (KLIA / KUL)</strong> — AirAsia มีเส้นทาง BKK-KUL-CEB ราคาถูก แต่ใช้เวลารวมนานกว่า อาจถึง 9–12 ชั่วโมง</li>\n  <li><strong>ฮ่องกง (HKG)</strong> — Cathay Pacific หรือ Hong Kong Express มีเส้นทางผ่านฮ่องกง แต่มักมีราคาสูงกว่าตัวเลือกอื่น</li>\n</ul>\n\n<p><strong>คำแนะนำ:</strong> สำหรับคนที่ต้องการประหยัดเวลาที่สุด แนะนำเลือกต่อเครื่องที่มะนิลา เพราะมีเที่ยวบินถี่ที่สุด และสามารถวางแผนเวลาต่อเครื่องได้ง่ายกว่า</p>\n\n<h2>ใช้เวลาเดินทางเท่าไหร่จากกรุงเทพถึงเซบู?</h2>\n\n<p>ระยะเวลาเดินทางรวมจะแตกต่างกันตามเส้นทางที่เลือก โดยมีรายละเอียดดังนี้</p>\n\n<ul>\n  <li><strong>ต่อที่มะนิลา (เส้นทางสั้นที่สุด):</strong> บินกรุงเทพ–มะนิลา ประมาณ 3 ชั่วโมง 30 นาที + รอต่อเครื่อง 1–3 ชั่วโมง + บินมะนิลา–เซบู 1 ชั่วโมง 15 นาที = <strong>รวมประมาณ 5–8 ชั่วโมง</strong></li>\n  <li><strong>ต่อที่กัวลาลัมเปอร์:</strong> รวมประมาณ <strong>9–12 ชั่วโมง</strong> เนื่องจากเส้นทางอ้อมและรอต่อเครื่องนาน</li>\n  <li><strong>ต่อที่ฮ่องกงหรือมาเก๊า:</strong> รวมประมาณ <strong>7–10 ชั่วโมง</strong> ขึ้นอยู่กับตารางเที่ยวบิน</li>\n</ul>\n\n<p>หากอยู่ที่กรุงเทพและต้องการถึงเซบูเร็วที่สุด ควรจองตั๋วที่ต่อเครื่องที่มะนิลาและเลือก Layover ไม่เกิน 2 ชั่วโมง จะทำให้ถึงเซบูได้ภายใน <strong>6–7 ชั่วโมงนับจากออกเดินทาง</strong></p>\n\n<h2>สายการบินไหนบินกรุงเทพ–เซบูบ้าง และราคาเท่าไหร่?</h2>\n\n<p>มีสายการบินหลายเจ้าที่ให้บริการเส้นทางนี้ โดยมักขายเป็นแบบ Connecting Flight ดังนี้</p>\n\n<ul>\n  <li><strong>Philippine Airlines (PAL):</strong> ราคาเริ่มต้น <strong>8,000–20,000 บาท</strong> (ไป-กลับ) ต่อที่มะนิลา บริการดี มีอาหารบนเครื่อง น้ำหนักกระเป๋าใต้ท้อง 23–32 กก. รวมอยู่แล้ว</li>\n  <li><strong>Cebu Pacific + Thai AirAsia หรือ Thai Lion Air:</strong> ราคาเริ่มต้น <strong>4,000–9,000 บาท</strong> (ไป-กลับ) ประหยัดกว่า แต่ต้องซื้อน้ำหนักกระเป๋าเพิ่ม</li>\n  <li><strong>AirAsia (ผ่าน KL):</strong> ราคาเริ่มต้น <strong>3,500–8,000 บาท</strong> (ไป-กลับ) ถูกที่สุดในบางช่วง แต่ใช้เวลานาน</li>\n  <li><strong>Thai Airways + Philippine Airlines:</strong> ราคา <strong>12,000–25,000 บาท</strong> บริการ Full Service เหมาะสำหรับผู้ที่ต้องการความสะดวกสบาย</li>\n</ul>\n\n<p><strong>เทคนิคประหยัดค่าตั๋ว:</strong> จองล่วงหน้าอย่างน้อย <strong>4–8 สัปดาห์</strong> และหลีกเลี่ยงช่วง High Season ของฟิลิปปินส์ คือ ธันวาคม–มกราคม และช่วงเทศกาล Sinulog (มกราคม) ที่เซบู ซึ่งราคาตั๋วจะสูงขึ้น 30–50%</p>\n\n<h2>สนามบินเซบูอยู่ไกลจากตัวเมืองแค่ไหน และเดินทางต่ออย่างไร?</h2>\n\n<p>สนามบินนานาชาติมาเซบู (Mactan-Cebu International Airport) ตั้งอยู่บนเกาะ Mactan ห่างจากตัวเมืองเซบูซิตี้ประมาณ <strong>12–15 กิโลเมตร</strong> ใช้เวลาเดินทางประมาณ <strong>30–60 นาที</strong> ขึ้นอยู่กับการจราจร ตัวเลือกการเดินทางจากสนามบินมีดังนี้</p>\n\n<ul>\n  <li><strong>Grab (แอปเรียกรถ):</strong> ค่าโดยสารประมาณ <strong>200–400 เปโซ (120–240 บาท)</strong> ไปยัง IT Park หรือ Colon Street ในเซบูซิตี้ — แนะนำที่สุดสำหรับนักเดินทางใหม่</li>\n  <li><strong>แท็กซี่มิเตอร์:</strong> ราคาเริ่มต้น <strong>40 เปโซ + ระยะทาง</strong> รวมประมาณ 250–500 เปโซ แต่ควรระวังแท็กซี่ที่ปฏิเสธเปิดมิเตอร์</li>\n  <li><strong>รถโรงเรียนสอนภาษา (School Shuttle):</strong> หากมาเรียนภาษาอังกฤษที่เซบู โรงเรียนส่วนใหญ่มีบริการรับจากสนามบิน <strong>ฟรีหรือค่าบริการต่ำมาก</strong> ควรแจ้งโรงเรียนล่วงหน้า</li>\n  <li><strong>Jeepney (รถสาธารณะ):</strong> ถูกมากประมาณ <strong>13–15 เปโซ</strong> แต่ไม่สะดวกสำหรับผู้มีกระเป๋าหนัก ไม่แนะนำสำหรับครั้งแรก</li>\n</ul>\n\n<h2>เคล็ดลับการวางแผนเดินทางกรุงเทพ–เซบูให้ราบรื่น</h2>\n\n<p>ก่อนเดินทางไปเซบูไม่ว่าจะเพื่อท่องเที่ยวหรือเรียนภาษาอังกฤษ มีสิ่งที่ควรเตรียมและรู้ไว้ดังนี้</p>\n\n<ul>\n  <li><strong>พาสปอร์ตต้องมีอายุเหลืออย่างน้อย 6 เดือน</strong> นับจากวันเดินทาง</li>\n  <li><strong>คนไทยไม่ต้องขอวีซ่า</strong> สามารถอยู่ได้ฟรี 30 วัน และต่อได้ที่ Bureau of Immigration ในเซบูอีก 29 วัน (ค่าต่อประมาณ 3,030 เปโซ หรือราว 1,800 บาท)</li>\n  <li><strong>แลกเงินเปโซ</strong> แนะนำแลกที่ SuperRich ในกรุงเทพก่อนไป หรือแลกที่ Moneychanger ในสนามบินมาเซบูซึ่งให้เรตดีกว่าร้านในเมือง</li>\n  <li><strong>ซิมการ์ด:</strong> ซื้อ SIM ฟิลิปปินส์ที่สนามบินได้เลย ยี่ห้อ Globe หรือ Smart ราคาเริ่มต้น <strong>299–599 เปโซ</strong> มีเน็ตให้ใช้ 7–30 วัน</li>\n  <li><strong>ระวัง Layover สั้นเกินไป</strong> หากต่อเครื่องที่มะนิลา ควรเผื่อเวลาต่อเครื่องอย่างน้อย <strong>90 นาที</strong> เพราะสนามบินมะนิลามีหลาย Terminal และต้องใช้เวลาเดินและเช็คอินใหม่</li>\n</ul>\n\n<h2>สรุป</h2>\n\n<p>การเดินทางจากกรุงเทพไปเซบูนั้นไม่ยากอย่างที่คิด แค่วางแผนให้ดีโดยเลือก<strong>ต่อเครื่องที่มะนิลา</strong>เป็นตัวเลือกหลักเพราะประหยัดเวลาที่สุด ใช้เวลารวมเพียง <strong>5–8 ชั่วโมง</strong> ค่าตั๋วเริ่มต้นที่ <strong>4,000 บาท</strong> หากจองล่วงหน้า และเมื่อถึงเซบูก็สามารถใช้ Grab เดินทางต่อได้สะดวกมาก หากคุณมาเซบูเพื่อ<strong>เรียนภาษาอังกฤษ</strong> Philingo by Thai Study Abroad Consultant พร้อมช่วยวางแผนทุกอย่างตั้งแต่จองโรงเรียน ที่พัก ไปจนถึงเคล็ดลับการเดินทาง <strong>ปรึกษาฟรีไม่มีค่าใช้จ่าย</strong> ติดต่อได้เลยวันนี้!</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: กรุงเทพไปเซบูมีเที่ยวบินตรงไหม?\nA: ปัจจุบันยังไม่มีเที่ยวบินตรงจากกรุงเทพ (สุวรรณภูมิหรือดอนเมือง) ไปยังสนามบินมาเซบู ทุกเส้นทางต้องต่อเครื่องอย่างน้อย 1 ครั้ง โดยจุดต่อเครื่องที่นิยมมากที่สุดคือกรุงมะนิลา ซึ่งมีเที่ยวบินบ่อยและใช้เวลาต่อเครื่องไม่นาน\n\nQ: บินกรุงเทพไปเซบูใช้เวลากี่ชั่วโมง?\nA: หากต่อเครื่องที่มะนิลา จะใช้เวลารวมประมาณ 5–8 ชั่วโมง รวมเวลารอต่อเครื่อง 1–2 ชั่วโมง แต่หากเลือกเส้นทางผ่านกัวลาลัมเปอร์อาจนานถึง 9–12 ชั่วโมง ขึ้นอยู่กับตารางบิน\n\nQ: ตั๋วเครื่องบินกรุงเทพ–เซบูราคาเท่าไหร่?\nA: ราคาตั๋วไป-กลับเริ่มต้นประมาณ 3,500–5,000 บาทสำหรับสายการบิน Low Cost อย่าง AirAsia หรือ Cebu Pacific หากต้องการ Full Service เช่น Philippine Airlines หรือ Thai Airways จะอยู่ที่ 10,000–25,000 บาท ควรจองล่วงหน้า 4–8 สัปดาห์เพื่อราคาดีที่สุด\n\nQ: คนไทยต้องทำวีซ่าไปฟิลิปปินส์ไหม?\nA: คนไทยไม่ต้องขอวีซ่าฟิลิปปินส์สำหรับการพำนักไม่เกิน 30 วัน เพียงแสดงพาสปอร์ตที่มีอายุเหลืออย่างน้อย 6 เดือน และตั๋วขาออกก็เพียงพอ หากต้องการอยู่นานกว่านั้น สามารถต่อวีซ่าได้ที่สำนักงาน Bureau of Immigration ในเซบูในราคาประมาณ 3,030 เปโซ	/api/storage/objects/uploads/c34bc61d-724a-4d52-937d-1b70681c892c	tips	Philingo Team	ทีม Philingo	[]	เดินทางกรุงเทพไปเซบู ต่อเครื่องที่ไหน ใช้เวลาเท่าไหร่	เดินทางจากกรุงเทพไปเซบู ฟิลิปปินส์ ไม่มีเที่ยวบินตรง ต้องต่อเครื่องที่มะนิลา มาเก๊า หรือกัวลาลัมเปอร์ ใช้เวลา 5–10 ชั่วโมง ค่าตั๋วเริ่ม 4,000 บาท	0	f	t	\N	2026-08-02 09:00:09.411796	2026-08-06 13:26:46.213	เดินทางจากกรุงเทพไปเซบู, บินกรุงเทพเซบู, ต่อเครื่องไปเซบู, เที่ยวบินกรุงเทพเซบู, ต่อเครื่องที่มะนิลา, ราคาตั๋วเครื่องบินไปเซบู, ใช้เวลาเดินทางไปเซบูเท่าไหร่, สายการบินไปเซบู, เซบูฟิลิปปินส์, บินไปเซบู
6	thailand-to-philippines-visa-guide	Thai Citizens: Complete Visa Guide for Studying in the Philippines	คนไทย: คู่มือวีซ่าฉบับสมบูรณ์สำหรับการเรียนในฟิลิปปินส์	Everything Thai citizens need to know about visas for studying English in the Philippines.	ทุกสิ่งที่คนไทยต้องรู้เกี่ยวกับวีซ่าสำหรับการเรียนภาษาอังกฤษในฟิลิปปินส์	# Thai Citizens: Complete Visa Guide\n\nFor Thai citizens, entering the Philippines for short-term study is straightforward...	# คนไทย: คู่มือวีซ่าฉบับสมบูรณ์\n\nสำหรับคนไทย การเข้าฟิลิปปินส์เพื่อการศึกษาระยะสั้นเป็นเรื่องง่าย...	/api/gallery/image/fetched-1785686049523-7g4pghev1jw.jpg	Visa & Travel	Philingo Team	ทีม Philingo	["Visa", "Thailand", "Philippines", "Travel"]	\N	\N	0	f	t	2024-04-01 00:00:00	2026-07-28 05:53:14.688377	2026-08-02 15:54:11.531	\N
15	review-bcebu-6-weeks	Review B'Cebu Language School 6 Weeks	รีวิวเรียน B'Cebu Language School 6 สัปดาห์		รีวิว B'Cebu Language School 6 สัปดาห์ สถาบันระดับกลางที่คนไทยนิยม		<h2>ทำไมเลือก B'Cebu?</h2><p>B'Cebu เป็นสถาบันระดับกลางที่คนไทยแนะนำกันเยอะมาก ราคาไม่แพงเกินไป คุณภาพดี มีบรรยากาศที่อบอุ่น ครูเป็นกันเองกับนักเรียนไทย</p><h2>ห้องเรียนและครู</h2><p>คลาสขนาดเล็ก 1-on-1 กับ Group ครูส่วนใหญ่อายุงานนาน เชี่ยวชาญการสอนเฉพาะจุด มีโปรแกรม TOEIC, IELTS, และ General English</p><h2>ผลลัพธ์</h2><p>TOEIC จาก 600 → 750 ใน 6 สัปดาห์ พอใจมากกับผลลัพธ์ ที่พักสะอาดและปลอดภัย เหมาะกับคนไทยที่มาครั้งแรก</p>	/api/storage/objects/uploads/0ffeda18-6570-4fa5-8792-207ec3015c11	review	Philingo Team	น้องแพร · B'Cebu 6 สัปดาห์	["BCebu", "TOEIC", "Cebu", "Thai"]			0	f	t	2026-08-03 06:39:54.854	2026-08-01 02:43:09.861765	2026-08-03 06:39:55.93	
10	review-philinter-cebu-12-weeks	N' Phamui Philinter Academy 12 weeks 	รีวิวเรียน Philinter Academy  12 สัปดาห์ พัฒนาเร็วจริงไหม?		รีวิว CPILS เซบู 4 สัปดาห์ โปรแกรม Intensive ได้ผลจริงหรือไม่?		<h2>ทำไมเลือก CPILS?</h2><p>CPILS มีชื่อเสียงเรื่องโปรแกรม Intensive ที่เข้มข้น เหมาะสำหรับคนที่เวลาจำกัดแต่ต้องการผลลัพธ์เร็ว มีตารางเรียนแน่นถึง 9-10 ชั่วโมง/วัน</p><h2>สภาพแวดล้อม</h2><p>ที่พักสะอาด อาหารอร่อย Wi-Fi เร็ว Library มีหนังสือให้อ่านเยอะ นักเรียนส่วนใหญ่เป็นเกาหลีและญี่ปุ่น บรรยากาศดี</p><h2>ผลลัพธ์ 4 สัปดาห์</h2><p>ฟัง-พูดดีขึ้นเห็นได้ชัด โดยเฉพาะ Listening และ Speaking confidence สำหรับใครที่มีแค่ 1 เดือน CPILS เป็นตัวเลือกที่คุ้มค่ามาก</p>	/api/storage/objects/uploads/65281eca-ea56-41a7-b415-9b6ea03a09c6	review	Philingo Team	น้องฟ้ามุ่น ภาษาพัฒนามากเรียน 12 สัปดาห์ Phininter Academy	["CPILS", "Intensive", "Cebu", "Speaking"]			0	f	t	2026-08-06 14:40:03.28	2026-08-01 02:43:09.861765	2026-08-06 14:40:04.581	
8	review-qq-english-cebu	Review QQ English Cebu 8 Weeks — Worth It?	รีวิวเรียน QQ English เซบู 8 สัปดาห์ คุ้มไหม?		รีวิวจริงจากนักเรียนไทยที่เรียน QQ English เซบู 8 สัปดาห์ พร้อมคะแนน TOEIC ก่อน-หลัง		<h2>ทำไมเลือก QQ English?</h2><p>QQ English ดังเรื่องคลาส 1-on-1 และอัตราส่วนครูต่อนักเรียนที่ดีมาก ตอนแรกลังเลระหว่าง QQ กับ CIA แต่สุดท้ายเลือก QQ เพราะราคาที่พักรวมอาหารคุ้มกว่า</p><h2>ห้องพักและสิ่งอำนวยความสะดวก</h2><p>ห้องพัก Standard ขนาดกำลังดี อาหาร 3 มื้อครบ รสชาติโอเค ฟิตเนสใช้ได้ สระว่ายน้ำเปิดช่วงเย็น บรรยากาศเหมือนรีสอร์ทขนาดย่อม</p><h2>ผลลัพธ์หลัง 8 สัปดาห์</h2><p>TOEIC เพิ่มจาก 580 → 730 คะแนน พอใจมาก ครูส่วนใหญ่ใจดีและอธิบายได้ชัดเจน แนะนำสำหรับคนที่ต้องการพัฒนา Business English</p>	/api/storage/objects/uploads/d6980f16-e137-4dc5-ae75-42e0bf2bf045	review	Philingo Team	น้องมิ้ว · QQ English 8 สัปดาห์	["QQ English", "TOEIC", "Cebu", "ESL"]			0	f	t	2026-08-03 06:31:20.409	2026-08-01 02:43:09.861765	2026-08-03 06:31:21.478	
39	internet-phone-sim-philippines	ค่าอินเตอร์เน็ตและโทรศัพท์ในฟิลิปปินส์ ซิม Globe Smart ยี่ห้อไหนดีสุด	ค่าอินเตอร์เน็ตและโทรศัพท์ในฟิลิปปินส์ ซิม Globe Smart ยี่ห้อไหนดีสุด		\N	\N	<p>ถ้าคุณกำลังจะไปเรียนภาษาอังกฤษที่ฟิลิปปินส์ หนึ่งในเรื่องที่ต้องวางแผนให้ดีคือ <strong>ค่าอินเตอร์เน็ตและโทรศัพท์</strong> ซึ่งฟิลิปปินส์มีเครือข่ายหลัก 2 ยี่ห้อคือ <strong>Globe และ Smart</strong> โดยแพ็กเกจอินเตอร์เน็ตรายเดือนราคาอยู่ที่ประมาณ <strong>299–999 เปโซ (ราว 180–590 บาท)</strong> และสามารถซื้อซิมได้ง่ายตามสนามบินหรือร้านสะดวกซื้อทั่วประเทศ บทความนี้จะช่วยให้คุณเลือกซิมได้ถูกต้องก่อนเดินทาง</p>\n\n<h2>ค่าอินเตอร์เน็ตในฟิลิปปินส์แพงแค่ไหน?</h2>\n\n<p>โดยรวมแล้วค่าอินเตอร์เน็ตในฟิลิปปินส์ถือว่า <strong>ไม่แพง</strong> เมื่อเทียบกับไทย แต่ความเร็วและความครอบคลุมของสัญญาณอาจแตกต่างกันในแต่ละพื้นที่ โดยเฉพาะในเมืองใหญ่อย่าง <strong>เซบู มะนิลา บาโคลอด และดาเวา</strong> สัญญาณจะดีกว่าในพื้นที่ห่างไกลอย่างเห็นได้ชัด</p>\n\n<p>แพ็กเกจข้อมูลแบบรายวันเริ่มต้นที่เพียง <strong>15–20 เปโซ (ราว 9–12 บาท)</strong> ต่อวัน ขณะที่แพ็กเกจรายสัปดาห์อยู่ที่ <strong>99–149 เปโซ (ราว 60–90 บาท)</strong> และแพ็กเกจรายเดือนอยู่ที่ <strong>299–999 เปโซ (ราว 180–590 บาท)</strong> ทำให้นักเรียนที่อยู่ระยะยาว 1–3 เดือน ควรเลือกแพ็กเกจรายเดือนเพื่อความคุ้มค่าที่สุด</p>\n\n<h2>Globe กับ Smart ต่างกันอย่างไร? เลือกยี่ห้อไหนดี?</h2>\n\n<p>นี่คือคำถามที่นักเรียนไทยถามมากที่สุด เพราะทั้ง 2 เครือข่ายมีจุดเด่นต่างกัน ขึ้นอยู่กับว่าคุณอยู่ที่ไหนและใช้งานแบบไหน</p>\n\n<h3>Globe — เหมาะสำหรับใครบ้าง?</h3>\n\n<ul>\n<li><strong>สัญญาณดีในเขตเมืองใหญ่</strong> โดยเฉพาะเซบูซิตี้ มะนิลา และบาโคลอด</li>\n<li>มีแอป <strong>Globe One</strong> ให้จัดการแพ็กเกจได้ง่ายผ่านมือถือ</li>\n<li>แพ็กเกจยอดนิยมคือ <strong>GoSURF299</strong> ราคา 299 เปโซ ได้อินเตอร์เน็ต 8GB + โซเชียลไม่อั้น 30 วัน</li>\n<li>มีแพ็กเกจ <strong>GoUNLI599</strong> ราคา 599 เปโซ อินเตอร์เน็ตไม่อั้น 30 วัน (ลดความเร็วหลัง 8GB/วัน)</li>\n<li>เหมาะกับคนที่ใช้ <strong>YouTube, Netflix, Facebook, TikTok</strong> เยอะ</li>\n</ul>\n\n<h3>Smart — เหมาะสำหรับใครบ้าง?</h3>\n\n<ul>\n<li><strong>ครอบคลุมพื้นที่ต่างจังหวัดดีกว่า</strong> Globe โดยเฉพาะบนเกาะที่ห่างไกล</li>\n<li>มีแพ็กเกจ <strong>SurfMax 299</strong> ราคา 299 เปโซ ได้ 6GB + โซเชียล 30 วัน</li>\n<li>แพ็กเกจ <strong>GigaSurf50</strong> ราคา 50 เปโซ ได้ 3GB ใช้ได้ 3 วัน ดีสำหรับระยะสั้น</li>\n<li>มีแบรนด์ย่อย <strong>TNT (Talk N Text)</strong> ที่ราคาถูกกว่า เหมาะกับงบจำกัด</li>\n<li>เหมาะกับคนที่อยู่ใน <strong>โรงเรียนนอกเมือง หรือพื้นที่ห่างไกล</strong></li>\n</ul>\n\n<h3>เปรียบเทียบ Globe vs Smart แบบเห็นภาพ</h3>\n\n<ul>\n<li><strong>ความเร็วเฉลี่ย:</strong> Globe 4G LTE ประมาณ 20–35 Mbps / Smart 4G LTE ประมาณ 18–30 Mbps</li>\n<li><strong>ราคาเริ่มต้นรายเดือน:</strong> Globe 299 เปโซ / Smart 299 เปโซ (ใกล้เคียงกัน)</li>\n<li><strong>ความครอบคลุม:</strong> Globe เด่นในเมือง / Smart เด่นในพื้นที่ห่างไกล</li>\n<li><strong>แอปจัดการ:</strong> Globe One (ใช้งานง่ายกว่า) / Smart App</li>\n<li><strong>5G:</strong> ทั้งคู่เริ่มรองรับ 5G แล้วในบางพื้นที่ของมะนิลาและเซบู</li>\n</ul>\n\n<h2>ซื้อซิมฟิลิปปินส์ที่ไหน? ต้องเตรียมอะไรบ้าง?</h2>\n\n<p>การซื้อซิมในฟิลิปปินส์ง่ายมาก ไม่ต้องกังวล คุณสามารถซื้อได้จากหลายช่องทาง ดังนี้</p>\n\n<ul>\n<li><strong>สนามบิน (Mactan–Cebu / NAIA มะนิลา):</strong> มีบูธ Globe และ Smart ทันทีที่ออกจากประตูผู้โดยสาร ราคาซิมเริ่มต้น <strong>40–100 เปโซ</strong> พร้อมโหลดเริ่มต้น</li>\n<li><strong>ร้านสะดวกซื้อ 7-Eleven, Ministop, Alfamart:</strong> มีซิมและ e-load ขายตลอด 24 ชั่วโมง</li>\n<li><strong>ร้าน Globe / Smart ในห้างสรรพสินค้า:</strong> เหมาะถ้าต้องการความช่วยเหลือจากพนักงาน</li>\n<li><strong>โรงเรียนภาษา:</strong> หลายโรงเรียนในเซบูมีบริการช่วยนักเรียนซื้อซิมในวันแรกที่เดินทางมาถึง</li>\n</ul>\n\n<p>เอกสารที่ต้องใช้มีเพียง <strong>พาสปอร์ต 1 เล่ม</strong> เท่านั้น ทางการฟิลิปปินส์กำหนดให้ลงทะเบียนซิมด้วยตัวตนจริงเพื่อความปลอดภัย ซึ่งพนักงานจะช่วยดำเนินการให้ในร้านได้เลย</p>\n\n<h2>แนะนำแพ็กเกจอินเตอร์เน็ตสำหรับนักเรียนระยะสั้นและระยะยาว</h2>\n\n<h3>อยู่ 2–4 สัปดาห์ (คอร์สระยะสั้น)</h3>\n\n<ul>\n<li><strong>Globe GoSURF149:</strong> 149 เปโซ / 7 วัน ได้ 3GB + โซเชียลฟรี เหมาะมากสำหรับทดลองใช้</li>\n<li><strong>Smart GigaSurf99:</strong> 99 เปโซ / 7 วัน ได้ 5GB ราคาถูกและคุ้มกว่า</li>\n</ul>\n\n<h3>อยู่ 1–3 เดือน (คอร์สมาตรฐาน)</h3>\n\n<ul>\n<li><strong>Globe GoUNLI599:</strong> 599 เปโซ / 30 วัน อินเตอร์เน็ตไม่อั้น ลดความเร็วหลังจากใช้ 8GB ต่อวัน เหมาะกับคนดูคลิปเยอะ</li>\n<li><strong>Smart SurfMax599:</strong> 599 เปโซ / 30 วัน ได้ 15GB ความเร็วเต็ม + โซเชียลไม่อั้น</li>\n<li><strong>คำแนะนำ:</strong> ถ้าอยู่ 3 เดือน ค่าซิมรายเดือนจะอยู่ที่ประมาณ <strong>1,797–2,997 เปโซ หรือราว 1,060–1,770 บาท</strong> ตลอด 3 เดือน ถือว่าถูกมาก</li>\n</ul>\n\n<h2>ควรใช้ Wi-Fi โรงเรียนหรือซื้อซิมเอง?</h2>\n\n<p>โรงเรียนสอนภาษาในฟิลิปปินส์ส่วนใหญ่มี <strong>Wi-Fi ฟรีในหอพัก</strong> แต่ความเร็วอาจไม่เสถียรในช่วงเวลาเร่งด่วน (ตอนเย็นหลัง 6 โมง) เพราะนักเรียนหลายร้อยคนใช้พร้อมกัน ดังนั้น <strong>แนะนำให้มีซิมส่วนตัวเพิ่มด้วย</strong> โดยเฉพาะถ้าต้องใช้วิดีโอคอลกับครอบครัว หรือดูหนังสตรีมมิ่ง</p>\n\n<p>สรุปง่ายๆ คือ <strong>ใช้ Wi-Fi โรงเรียนสำหรับเรียนออนไลน์ + ซิมส่วนตัวสำหรับออกไปข้างนอก</strong> จะดีที่สุด งบค่าซิมเพียง <strong>300–600 เปโซต่อเดือน</strong> คุ้มค่ามากสำหรับการใช้ชีวิตในฟิลิปปินส์</p>\n\n<h2>สรุป</h2>\n\n<p>สำหรับนักเรียนไทยที่ไปเรียนภาษาอังกฤษที่ฟิลิปปินส์ <strong>Globe เหมาะกับคนที่อยู่ในเมืองใหญ่อย่างเซบูและมะนิลา</strong> ในขณะที่ <strong>Smart เหมาะกับคนที่อยู่ในพื้นที่ห่างไกลหรือต้องการความครอบคลุมกว้างกว่า</strong> ทั้งคู่มีราคาใกล้เคียงกันที่ประมาณ <strong>299–599 เปโซต่อเดือน</strong> และซื้อได้ง่ายตามสนามบินหรือร้านสะดวกซื้อโดยใช้แค่พาสปอร์ต ถ้ายังไม่แน่ใจ ลองซื้อทั้ง 2 ซิมในสัปดาห์แรกแล้วดูว่าอันไหนสัญญาณดีกว่าในพื้นที่ที่คุณอยู่ก็ได้</p>\n\n<p>หากคุณกำลังวางแผนเรียนภาษาอังกฤษที่ฟิลิปปินส์และต้องการคำแนะนำแบบครบจบตั้งแต่เลือกโรงเรียน วีซ่า ที่พัก ไปจนถึงการใช้ชีวิตที่นั่น ติดต่อ <strong>Philingo by Thai Study Abroad Consultant</strong> ได้เลย มีทีมที่ปรึกษาคนไทยพร้อมช่วยคุณฟรี ไม่มีค่าใช้จ่าย!</p>\n\n---\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: ซิม Globe กับ Smart อันไหนดีกว่าสำหรับเรียนที่เซบู?\nA: สำหรับเมืองเซบู Globe มักได้รับความนิยมมากกว่าเพราะสัญญาณครอบคลุมในย่านโรงเรียนภาษาหลักอย่าง Lahug, Banilad และ Mandaue ได้ดีกว่า อย่างไรก็ตามแนะนำให้ถามรุ่นพี่หรือทีมโรงเรียนก่อนซื้อ เพราะสัญญาณอาจต่างกันในแต่ละอาคาร\n\nQ: ค่าซิมและอินเตอร์เน็ตในฟิลิปปินส์ต่อเดือนเท่าไหร่?\nA: แพ็กเกจรายเดือนราคาเริ่มต้นที่ 299 เปโซ (ราว 180 บาท) สำหรับแพ็กเกจพื้นฐาน และ 599 เปโซ (ราว 350 บาท) สำหรับแพ็กเกจที่ใช้งานได้เต็มที่ขึ้น ถือว่าถูกมากเมื่อเทียบกับไทยที่แพ็กเกจใกล้เคียงราคาอาจสูงกว่า 2–3 เท่า\n\nQ: ต้องเตรียมเอกสารอะไรบ้างสำหรับการซื้อซิมในฟิลิปปินส์?\nA: ใช้เพียงพาสปอร์ตใบเดียวก็เพียงพอ ทางการฟิลิปปินส์กำหนดให้ลงทะเบียนซิมด้วยตัวตนจริงตาม SIM Registration Act ซึ่งพนักงานร้านจะสแกนหน้าพาสปอร์ตและถ่ายรูปคุณในร้านได้เลย ใช้เวลาไม่ถึง 10 นาที\n\nQ: ควรซื้อซิมที่ไทยก่อนหรือซื้อที่ฟิลิปปินส์เลย?\nA: แนะนำให้ซื้อซิมที่สนามบินในฟิลิปปินส์เลยจะคุ้มกว่า เพราะซิมโรมมิ่งจากไทยมีราคาสูงกว่ามากและโควต้าข้อมูลน้อยกว่า ถ้ากังวลเรื่องช่วงเดินทางสามารถเปิด Wi-Fi Calling หรือใช้ iMessage/Line ผ่าน Wi-Fi สนามบินระหว่างรอซื้อซิมได้\n\nQ: โรงเรียนภาษาในฟิลิปปินส์มี Wi-Fi ฟรีไหม? จำเป็นต้องซื้อซิมเพิ่มไหม?\nA: โรงเรียนส่วนใหญ่มี Wi-Fi ฟรีในหอพักและห้องเรียน แต่ความเร็วอาจไม่เสถียรในช่วงเวลาที่นักเรียนใช้พร้อมกันมาก แนะนำให้ซื้อซิมเพิ่มในราคา 299–599 เปโซต่อเดือน เพื่อใช้ตอนออกนอกโรงเรียน วิดีโอคอลกับบ้าน หรือเป็นแหล่งสัญญาณสำรอง	/api/storage/objects/uploads/057a215e-6228-4038-9058-88d0c9addce7	tips	Philingo Team	ทีม Philingo	[]	ค่าซิมและอินเตอร์เน็ตฟิลิปปินส์ Globe vs Smart ดีกว่ากัน?	เปรียบ Globe vs Smart ซิมฟิลิปปินส์ยี่ห้อไหนดีสุดสำหรับนักเรียนไทย พร้อมราคาแพ็กเกจอินเตอร์เน็ตรายเดือน 300-900 บาท ครบทุกเครือข่าย เลือกให้คุ้มก่อนเดินทาง	0	f	t	\N	2026-08-02 09:11:46.773831	2026-08-06 15:47:56.413	ซิมฟิลิปปินส์, Globe vs Smart, อินเตอร์เน็ตฟิลิปปินส์, แพ็กเกจอินเตอร์เน็ตฟิลิปปินส์, ค่าซิมฟิลิปปินส์, เรียนต่อฟิลิปปินส์, GoSURF, GigaSurf, ซิมถูกฟิลิปปินส์, นักเรียนไทยในฟิลิปปินส์, ค่าใช้จ่ายฟิลิปปินส์
33	dormitory-room-types-philippines	หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์ มีห้องกี่แบบ ราคาเท่าไหร่ ต้องเลือกแบบไหน	หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์ มีห้องกี่แบบ ราคาเท่าไหร่ ต้องเลือกแบบไหน	หอพักโรงเรียนภาษาอังกฤษในฟิลิปปินส์มีให้เลือกหลายแบบ	\N	\N	<p>หอพักโรงเรียนภาษาอังกฤษในฟิลิปปินส์มีให้เลือกหลายแบบ ตั้งแต่ <strong>ห้องพักรวม (Dormitory) ราคาประมาณ 3,000–6,000 บาท/สัปดาห์</strong> ไปจนถึงห้องพักเดี่ยว (Single Room) ที่ราคาอยู่ที่ <strong>7,000–15,000 บาท/สัปดาห์</strong> ขึ้นอยู่กับโรงเรียนและทำเลที่ตั้ง การเลือกประเภทห้องพักที่เหมาะสมนั้นส่งผลโดยตรงต่อประสิทธิภาพการเรียนและงบประมาณรวมของคุณ ดังนั้นก่อนตัดสินใจควรเข้าใจรูปแบบห้องพักแต่ละประเภทให้ชัดเจนก่อน</p>\n\n<h2>หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์มีกี่ประเภท?</h2>\n\n<p>โดยทั่วไปแล้ว โรงเรียนภาษาอังกฤษในฟิลิปปินส์จะแบ่งประเภทห้องพักออกเป็น <strong>3–4 รูปแบบหลัก</strong> ที่นักเรียนต่างชาติสามารถเลือกได้ตามงบประมาณและความต้องการ ดังนี้</p>\n\n<h3>1. ห้องพักรวม (Dormitory / Shared Room)</h3>\n<p>เป็นรูปแบบที่ประหยัดที่สุด โดยนักเรียน <strong>2–6 คน</strong> จะพักอยู่ในห้องเดียวกัน แต่ละคนมีเตียง ตู้เสื้อผ้า และโต๊ะเรียนส่วนตัว ส่วนห้องน้ำและพื้นที่ส่วนกลางใช้ร่วมกัน ข้อดีคือ <strong>ราคาถูกกว่าห้องเดี่ยวประมาณ 40–60%</strong> และมีโอกาสได้พูดคุยกับเพื่อนร่วมชาติต่างๆ มากขึ้น เหมาะสำหรับผู้ที่ต้องการประหยัดงบและไม่ติดเรื่องพื้นที่ส่วนตัว</p>\n\n<h3>2. ห้องคู่ (Twin Room / Double Room)</h3>\n<p>ห้องคู่เป็นตัวเลือกยอดนิยม โดยนักเรียน <strong>2 คน</strong> พักในห้องเดียวกัน บางโรงเรียนมีห้องน้ำในตัว บางแห่งใช้ห้องน้ำรวม ราคาอยู่ระหว่าง <strong>5,000–10,000 บาท/สัปดาห์</strong> ขึ้นอยู่กับโรงเรียน ถือเป็นจุดกึ่งกลางที่ดีระหว่างความเป็นส่วนตัวและความคุ้มค่าด้านราคา</p>\n\n<h3>3. ห้องเดี่ยว (Single Room)</h3>\n<p>เหมาะสำหรับผู้ที่ต้องการความเป็นส่วนตัวสูงสุด นักเรียนอยู่คนเดียวทั้งห้อง มีห้องน้ำในตัวหรือแบบรวม ราคาอยู่ที่ <strong>7,000–15,000 บาท/สัปดาห์</strong> โดยห้องเดี่ยวระดับ Premium ในโรงเรียนชั้นนำอย่าง PINES หรือ CIA เซบู อาจสูงถึง <strong>18,000 บาท/สัปดาห์</strong> เหมาะกับคนที่ต้องการโฟกัสกับการเรียน ทำงาน หรือนอนหลับพักผ่อนได้เต็มที่โดยไม่มีสิ่งรบกวน</p>\n\n<h3>4. ห้องสวีท / ห้องพักระดับ Premium (Suite Room)</h3>\n<p>บางโรงเรียนในเซบูและบาโกโลดมีห้องพักระดับ Premium ที่มาพร้อม <strong>เฟอร์นิเจอร์ครบครัน, อินเทอร์เน็ตความเร็วสูง, ตู้เย็น และทีวี</strong> ราคาเริ่มต้นที่ <strong>15,000–25,000 บาท/สัปดาห์</strong> เหมาะสำหรับผู้ที่ต้องการความสะดวกสบายสูงสุดหรือเดินทางมาพร้อมครอบครัว</p>\n\n<h2>ราคาห้องพักแต่ละแบบเป็นเท่าไหร่ และรวมอะไรบ้าง?</h2>\n\n<p>ราคาห้องพักในโรงเรียนภาษาอังกฤษฟิลิปปินส์ส่วนใหญ่จะ <strong>รวมอาหาร 3 มื้อ, ค่าน้ำ, ค่าไฟ และอินเทอร์เน็ต</strong> ไว้ในแพ็กเกจเดียวกับค่าเรียนแล้ว สามารถดูภาพรวมราคาได้ดังนี้</p>\n\n<ul>\n  <li><strong>Dormitory (พักรวม 4–6 คน):</strong> ประมาณ 3,000–5,500 บาท/สัปดาห์</li>\n  <li><strong>Twin Room (พักคู่):</strong> ประมาณ 5,000–9,000 บาท/สัปดาห์</li>\n  <li><strong>Single Room (ห้องเดี่ยว):</strong> ประมาณ 7,000–15,000 บาท/สัปดาห์</li>\n  <li><strong>Premium / Suite Room:</strong> ประมาณ 15,000–25,000 บาท/สัปดาห์</li>\n</ul>\n\n<p>หากคำนวณเป็นรายเดือน (4 สัปดาห์) งบที่พักอย่างเดียวจะอยู่ที่ประมาณ <strong>12,000–100,000 บาท/เดือน</strong> ขึ้นอยู่กับระดับห้อง ทั้งนี้ในบางโรงเรียนเช่น SMEAG หรือ Philinter ที่เมืองเซบู ราคาห้อง Twin Room รวมค่าเรียน 6 คาบ/วัน จะอยู่ที่ประมาณ <strong>40,000–55,000 บาท/เดือน</strong> ซึ่งถือว่าคุ้มค่ามากเมื่อเทียบกับการเรียนภาษาในประเทศอื่น</p>\n\n<h2>ควรเลือกห้องพักแบบไหน ขึ้นอยู่กับอะไรบ้าง?</h2>\n\n<p>การเลือกประเภทห้องพักที่ใช่ขึ้นอยู่กับ <strong>3 ปัจจัยหลัก</strong> ได้แก่ งบประมาณ, เป้าหมายการเรียน และนิสัยส่วนตัว ลองดูตัวช่วยตัดสินใจด้านล่างนี้</p>\n\n<h3>เลือก Dormitory ถ้า...</h3>\n<ul>\n  <li>มีงบจำกัด และต้องการประหยัดสูงสุด</li>\n  <li>ชอบสังคม อยากมีเพื่อนใหม่จากหลายประเทศ</li>\n  <li>วางแผนเรียนระยะสั้น <strong>2–4 สัปดาห์</strong></li>\n  <li>อายุน้อย (นักศึกษา) และปรับตัวเก่ง</li>\n</ul>\n\n<h3>เลือก Twin Room ถ้า...</h3>\n<ul>\n  <li>ต้องการความสมดุลระหว่างราคาและความเป็นส่วนตัว</li>\n  <li>มากับเพื่อนและต้องการพักด้วยกัน</li>\n  <li>วางแผนเรียนระยะกลาง <strong>4–8 สัปดาห์</strong></li>\n  <li>ไม่แน่ใจว่าตัวเองชอบห้องเดี่ยวหรือห้องรวม</li>\n</ul>\n\n<h3>เลือก Single Room ถ้า...</h3>\n<ul>\n  <li>ต้องการโฟกัสกับการเรียน 100% ไม่ต้องการสิ่งรบกวน</li>\n  <li>มีความเป็น Introvert หรือนอนไวต่อเสียงรบกวน</li>\n  <li>วางแผนเรียนระยะยาว <strong>2–6 เดือน</strong></li>\n  <li>ต้องทำงาน Remote ควบคู่กับการเรียน</li>\n</ul>\n\n<h3>เลือก Premium / Suite Room ถ้า...</h3>\n<ul>\n  <li>ให้ความสำคัญกับคุณภาพชีวิตและความสะดวกสบายสูง</li>\n  <li>เดินทางมาเพื่อพักผ่อนและเรียนรู้ไปพร้อมกัน</li>\n  <li>มาพร้อมครอบครัวหรือคู่สมรส</li>\n  <li>งบประมาณไม่ใช่ปัจจัยหลักในการตัดสินใจ</li>\n</ul>\n\n<h2>เคล็ดลับเลือกห้องพักให้ได้ประโยชน์สูงสุด</h2>\n\n<p>นอกจากราคาและประเภทห้องแล้ว ยังมีปัจจัยอื่นๆ ที่ควรพิจารณาก่อนจองเสมอ</p>\n\n<ul>\n  <li><strong>ตรวจสอบว่าห้องน้ำเป็นแบบ En-suite หรือ Shared</strong> เพราะโรงเรียนบางแห่งแม้จะขายเป็น Single Room แต่ห้องน้ำก็ยังใช้ร่วมกัน</li>\n  <li><strong>สอบถามเรื่อง Policy ภาษาอังกฤษ (English Only Policy)</strong> ซึ่งโรงเรียนส่วนใหญ่บังคับให้พูดภาษาอังกฤษทั้งในและนอกห้องเรียน ห้องพักรวมจะช่วยให้ฝึกได้มากกว่า</li>\n  <li><strong>เช็กขนาดห้องและสิ่งอำนวยความสะดวก</strong> เช่น แอร์, Wi-Fi ความเร็ว, เครื่องซักผ้า และตู้ ATM ใกล้เคียง</li>\n  <li><strong>ดูรีวิวจากนักเรียนไทยคนอื่นๆ</strong> ในกลุ่ม Facebook หรือ YouTube เพราะมีข้อมูลจริงจากประสบการณ์ตรงมากที่สุด</li>\n  <li><strong>จองล่วงหน้าอย่างน้อย 4–8 สัปดาห์</strong> เพราะห้อง Single Room มักเต็มเร็ว โดยเฉพาะในช่วง Peak Season (มีนาคม–สิงหาคม)</li>\n</ul>\n\n<h2>สรุป</h2>\n\n<p>หอพักโรงเรียนภาษาอังกฤษในฟิลิปปินส์มี <strong>4 ประเภทหลัก</strong> ได้แก่ ห้องรวม, ห้องคู่, ห้องเดี่ยว และห้อง Premium โดยราคาอยู่ระหว่าง <strong>3,000–25,000 บาท/สัปดาห์</strong> ตามระดับความเป็นส่วนตัวและสิ่งอำนวยความสะดวก การเลือกให้เหมาะสมกับตัวเองขึ้นอยู่กับงบประมาณ ระยะเวลาเรียน และนิสัยส่วนตัวของแต่ละคน หากยังไม่แน่ใจว่าควรเลือกแบบไหน หรืออยากรู้ว่าโรงเรียนไหนมีห้องพักคุ้มค่าที่สุดสำหรับเป้าหมายของคุณ <strong>ปรึกษาทีมงาน Philingo by Thai Study Abroad Consultant ได้ฟรี!</strong> เรามีประสบการณ์แนะนำนักเรียนไทยไปเรียนภาษาอังกฤษที่ฟิลิปปินส์มามากกว่า 1,000 คน และพร้อมช่วยคุณวางแผนทุกขั้นตอนตั้งแต่เลือกโรงเรียน จองห้องพัก ไปจนถึงเตรียมตัวก่อนเดินทาง</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์ราคาเท่าไหร่ต่อสัปดาห์?\nA: ราคาหอพักขึ้นอยู่กับประเภทห้อง โดยห้องพักรวม (Dormitory) เริ่มต้นที่ประมาณ 3,000–5,500 บาท/สัปดาห์, ห้องคู่อยู่ที่ 5,000–9,000 บาท/สัปดาห์, ห้องเดี่ยวอยู่ที่ 7,000–15,000 บาท/สัปดาห์ และห้อง Premium สูงถึง 25,000 บาท/สัปดาห์ ราคาเหล่านี้มักรวมอาหาร 3 มื้อ ค่าน้ำ ค่าไฟ และ Wi-Fi ไว้ด้วยแล้ว\n\nQ: ห้องพักรวม (Dormitory) ที่โรงเรียนในฟิลิปปินส์เหมาะกับใคร?\nA: ห้องพักรวมเหมาะกับผู้ที่มีงบจำกัด ชอบสังคม และต้องการฝึกภาษาอังกฤษกับเพื่อนๆ จากหลายประเทศ โดยส่วนใหญ่จะอยู่กัน 2–6 คนต่อห้อง มีเตียงและพื้นที่เก็บของส่วนตัว แต่ใช้ห้องน้ำร่วมกัน เหมาะมากสำหรับนักเรียนที่วางแผนเรียนระยะสั้น 2–4 สัปดาห์\n\nQ: ห้องเดี่ยวและห้องรวมในฟิลิปปินส์ต่างกันยังไง ควรเลือกอะไร?\nA: ห้องเดี่ยวให้ความเป็นส่วนตัวสูงกว่า เหมาะกับคนที่ต้องการโฟกัสการเรียนหรือทำงาน Remote ควบคู่ไปด้วย แต่ราคาสูงกว่าห้องรวมถึง 40–60% ส่วนห้องรวมช่วยให้ฝึกพูดภาษาอังกฤษในชีวิตประจำวันได้มากกว่า แนะนำให้เลือกตามงบประมาณและเป้าหมายการเรียนของตัวเอง\n\nQ: ห้องพักในโรงเรียนภาษาอังกฤษฟิลิปปินส์รวมอาหารด้วยไหม?\nA: ใช่ โรงเรียนภาษาอังกฤษในฟิลิปปินส์ส่วนใหญ่จะรวมค่าอาหาร 3 มื้อต่อวัน พร้อมค่าน้ำ ค่าไฟ และ Wi-Fi ไว้ในแพ็กเกจรวมกับค่าเรียนและที่พักแล้ว ทำให้ง่ายต่อการวางแผนงบประมาณ โดยแพ็กเกจรวมทุกอย่างเฉลี่ยอยู่ที่ประมาณ 35,000–70,000 บาท/เดือน ขึ้นอยู่กับโรงเรียนและประเภทห้องพัก	/api/storage/objects/uploads/15e949f5-b23a-4f5d-9a52-690febdf0d8a	tips	Philingo Team	ทีม Philingo	[]	หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์ ราคาและประเภทห้องพัก	หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์มีกี่แบบ? ตั้งแต่ห้องพักรวม 3,000 บาท/สัปดาห์ ถึงห้องสวีท 25,000 บาท รวมอาหาร 3 มื้อ พร้อมแนะนำวิธีเลือกห้องให้เหมาะกับงบและการเรียน	0	f	t	\N	2026-08-02 09:03:31.514035	2026-08-06 12:36:40.451	หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์, ห้องพักโรงเรียนภาษาฟิลิปปินส์, เรียนภาษาอังกฤษฟิลิปปินส์, ราคาห้องพักฟิลิปปินส์, ห้องพักรวมฟิลิปปินส์, ห้องเดี่ยวโรงเรียนภาษา, เรียนภาษาเซบู, โรงเรียนภาษาบาโกโลด, แพ็กเกจเรียนภาษาฟิลิปปินส์, ค่าใช้จ่ายเรียนภาษาอังกฤษฟิลิปปินส์
14	review-philinter-cebu-8-weeks	Review Philinter Academy Cebu 8 Weeks	รีวิวเรียน Philinter เซบู 8 สัปดาห์ สถาบันเก่าแก่ดีแค่ไหน?		รีวิว Philinter Academy เซบู 8 สัปดาห์ สถาบันเก่าแก่ที่ยังแข็งแกร่งในปี 2026		<h2>ทำไมเลือก Philinter?</h2><p>Philinter เป็นหนึ่งในสถาบันเก่าแก่ที่สุดในเซบู ดำเนินการมานานกว่า 30 ปี ชื่อเสียงด้านความน่าเชื่อถือและความสม่ำเสมอในการสอน</p><h2>ระบบการเรียน</h2><p>เรียน 8 ชั่วโมง/วัน มีทั้งคลาส 1-on-1 และ Group ระบบวัดผลรายสัปดาห์ชัดเจน มีการบ้านและ self-study ทุกวัน</p><h2>ผลลัพธ์</h2><p>Grammar แน่นขึ้นมาก Vocabulary เพิ่มขึ้นเห็นได้ชัด Speaking confidence ดีขึ้นจากที่แทบไม่กล้าพูดตอนแรก แนะนำสำหรับคนที่ต้องการฐาน Grammar ที่แข็งแกร่ง</p>	/api/storage/objects/uploads/41578fbe-e3ce-430a-a4ab-5583036b40f2	review	Philingo Team	น้องแก้ว · Philinter 8 สัปดาห์	["Philinter", "Grammar", "Cebu", "ESL"]			0	f	t	2026-08-06 14:35:53.284	2026-08-01 02:43:09.861765	2026-08-06 14:35:54.571	
34	sparta-semi-sparta-general-explained	Sparta Semi-Sparta General คืออะไร? โปรแกรมเรียนภาษาอังกฤษในฟิลิปปินส์แต่ละแบบต่างกันยังไง	Sparta Semi-Sparta General คืออะไร? โปรแกรมเรียนภาษาอังกฤษในฟิลิปปินส์แต่ละแบบต่างกันยังไง	ระบบ Sparta คืออะไร	\N	\N	<p><strong>Sparta, Semi-Sparta และ General คือระบบการจัดการเรียนรู้ของโรงเรียนสอนภาษาอังกฤษในฟิลิปปินส์</strong> ที่กำหนดว่านักเรียนต้องพูดภาษาอังกฤษมากน้อยแค่ไหนนอกห้องเรียน ทั้งสามระบบมีความเข้มข้นต่างกันชัดเจน ตั้งแต่ "ห้ามพูดภาษาอื่นเลย 24 ชั่วโมง" ไปจนถึง "มีอิสระเต็มที่หลังเลิกเรียน" และการเลือกระบบที่เหมาะสมส่งผลโดยตรงต่อพัฒนาการภาษาอังกฤษและความสุขในการเรียนของคุณ</p>\n\n<h2>Sparta, Semi-Sparta, General คืออะไร? ต่างกันตรงไหน?</h2>\n\n<p>ก่อนอื่นต้องเข้าใจว่า ทั้งสามระบบนี้ไม่ได้เกี่ยวกับ <strong>เนื้อหาในห้องเรียน</strong> แต่เกี่ยวกับ <strong>"กฎการใช้ภาษาอังกฤษนอกห้องเรียน"</strong> โดยตรง กล่าวคือ ไม่ว่าคุณจะเรียนโรงเรียนไหนในฟิลิปปินส์ คลาสภาษาอังกฤษภายในห้องเรียนจะเป็นภาษาอังกฤษอยู่แล้ว 100% แต่สิ่งที่ต่างกันคือ "คุณจะถูกบังคับให้พูดภาษาอังกฤษในเวลาพักหรือเปล่า?"</p>\n\n<h3>ระบบ Sparta คืออะไร?</h3>\n\n<p>ระบบ Sparta คือโปรแกรมที่เข้มงวดที่สุด นักเรียนต้อง<strong>พูดภาษาอังกฤษตลอด 24 ชั่วโมง</strong> ไม่ว่าจะอยู่ในห้องเรียน หอพัก โรงอาหาร หรือแม้แต่ตอนเดินทางภายในบริเวณโรงเรียน หากถูกจับได้ว่าพูดภาษาอื่น จะมีบทลงโทษ เช่น ถูกปรับเงิน 50–200 เปโซต่อครั้ง หรือต้องทำกิจกรรมเพิ่ม เช่น อ่านหนังสือพิมพ์ภาษาอังกฤษ หรือเขียน essay</p>\n\n<ul>\n  <li>พูดอังกฤษ 24 ชั่วโมง ทุกพื้นที่ในโรงเรียน</li>\n  <li>มีระบบตรวจจับและบทลงโทษชัดเจน</li>\n  <li>เหมาะสำหรับคนที่ต้องการพัฒนาเร็วที่สุดภายใน 4–8 สัปดาห์</li>\n  <li>ความเครียดสูง แต่ผลลัพธ์มักเห็นชัดเจน</li>\n  <li>โรงเรียนที่มีชื่อเสียงด้าน Sparta เช่น PINES Baguio, CIA Cebu</li>\n</ul>\n\n<h3>ระบบ Semi-Sparta คืออะไร?</h3>\n\n<p>Semi-Sparta คือโปรแกรมกึ่งกลาง นักเรียนต้องพูดภาษาอังกฤษ<strong>เฉพาะในพื้นที่ส่วนกลางของโรงเรียน</strong> เช่น โถงหน้า โรงอาหาร ห้องศึกษา แต่ได้รับอนุญาตให้พูดภาษาอื่นในห้องพักส่วนตัวหรือเวลาพักผ่อนส่วนตัว ระบบนี้ได้รับความนิยมมากที่สุดในหมู่นักเรียนไทย เพราะ <strong>balance ระหว่างการฝึกภาษาและความเป็นส่วนตัว</strong> ได้ดีที่สุด</p>\n\n<ul>\n  <li>พูดอังกฤษในพื้นที่ส่วนกลาง ห้องเรียน และกิจกรรมกลุ่ม</li>\n  <li>พูดภาษาอื่นได้ในห้องพักส่วนตัว</li>\n  <li>เหมาะสำหรับคนที่ต้องการพัฒนาอย่างสม่ำเสมอ ไม่กดดันจนเกินไป</li>\n  <li>ใช้เวลาเฉลี่ย 4–12 สัปดาห์ขึ้นกับเป้าหมาย</li>\n  <li>โรงเรียนส่วนใหญ่ใน Cebu และ Baguio มีระบบนี้ให้เลือก</li>\n</ul>\n\n<h3>ระบบ General คืออะไร?</h3>\n\n<p>General Program หรือบางโรงเรียนเรียกว่า "Non-Sparta" คือระบบที่<strong>ไม่มีกฎบังคับการใช้ภาษาอังกฤษนอกห้องเรียน</strong> นักเรียนมีอิสระเต็มที่หลังเลิกเรียน จะออกไปเดินเล่นในเมือง ท่องเที่ยว หรือพูดภาษาไทยกับเพื่อนก็ได้ทั้งหมด ระบบนี้เหมาะกับ<strong>คนที่มาเรียนระยะยาว 3–6 เดือนขึ้นไป</strong> หรือคนที่ต้องการเรียนภาษาอังกฤษควบคู่กับการสำรวจวัฒนธรรมฟิลิปปินส์</p>\n\n<ul>\n  <li>ไม่มีกฎบังคับการใช้ภาษาอังกฤษนอกห้องเรียน</li>\n  <li>เสรีภาพสูง เดินทาง ท่องเที่ยวได้</li>\n  <li>เหมาะกับผู้เรียนระยะยาว หรือคนที่มีพื้นฐานดีพอสมควรแล้ว</li>\n  <li>ความก้าวหน้าช้ากว่า Sparta แต่ Burnout น้อยกว่ามาก</li>\n  <li>นิยมในกลุ่มนักเรียนที่ทำงานแล้วและมาเรียนระหว่างลาพักร้อน</li>\n</ul>\n\n<h2>เปรียบเทียบตรงๆ: ระบบไหนเหมาะกับใคร?</h2>\n\n<p>การเลือกระบบที่ถูกต้องสำคัญมาก เพราะมันส่งผลต่อทั้ง <strong>ความก้าวหน้าในการเรียน</strong> และ <strong>ความสุขในชีวิตประจำวัน</strong> ลองดูตารางเปรียบเทียบด้านล่างนี้เพื่อตัดสินใจได้ง่ายขึ้น</p>\n\n<ul>\n  <li><strong>Sparta</strong> — เหมาะกับคนที่มีเวลาน้อย 4–8 สัปดาห์ ต้องการพัฒนาแบบเร่งด่วน มีวินัยสูง และพร้อมรับแรงกดดัน ค่าใช้จ่ายโดยเฉลี่ย 35,000–55,000 บาท/เดือน รวมค่าเรียนและที่พัก</li>\n  <li><strong>Semi-Sparta</strong> — เหมาะกับคนส่วนใหญ่! ต้องการพัฒนาอย่างสม่ำเสมอ ต้องการสมดุลระหว่างการเรียนและชีวิต เหมาะกับระยะ 4–12 สัปดาห์ ค่าใช้จ่ายโดยเฉลี่ย 40,000–65,000 บาท/เดือน</li>\n  <li><strong>General</strong> — เหมาะกับคนที่มาระยะยาว 3–6 เดือน หรือมาพร้อมกับแผนท่องเที่ยว หรือมีพื้นฐานดีแล้วและต้องการเพิ่มความคล่องแคล่ว ค่าใช้จ่ายโดยเฉลี่ย 35,000–60,000 บาท/เดือน</li>\n</ul>\n\n<h2>ระบบ Sparta ดีจริงไหม? หรือแค่การตลาด?</h2>\n\n<p>นี่เป็นคำถามที่นักเรียนไทยถามบ่อยมาก คำตอบตรงๆ คือ <strong>Sparta ได้ผลจริง แต่ไม่เหมาะกับทุกคน</strong> งานวิจัยด้านการเรียนรู้ภาษาพบว่า การ "immersion" หรือการจมตัวในภาษาเป้าหมายตลอดเวลา ช่วยให้สมองปรับตัวและสร้างความเคยชินในการคิดเป็นภาษาอังกฤษได้เร็วกว่าปกติ 2–3 เท่า</p>\n\n<p>อย่างไรก็ตาม หากคุณมีความเครียดสูงมาก สมองจะเข้าสู่โหมด "fight or flight" ซึ่งส่งผลเสียต่อการเรียนรู้ภาษา ดังนั้น <strong>คนที่ได้ประโยชน์จาก Sparta มากที่สุดคือ</strong> คนที่มีพื้นฐานภาษาอังกฤษระดับปานกลางขึ้นไป (ประมาณ A2–B1) ไม่ใช่ผู้เริ่มต้นสมบูรณ์ที่ยังไม่มีคำศัพท์พื้นฐาน</p>\n\n<h2>ค่าใช้จ่ายต่างกันไหมระหว่างสามระบบ?</h2>\n\n<p>โดยทั่วไป ค่าใช้จ่ายระหว่างสามระบบ<strong>ไม่ต่างกันมากนัก</strong> เพราะราคาขึ้นอยู่กับโรงเรียนและจำนวนคาบเรียนมากกว่า แต่โรงเรียนที่เป็น Sparta มักมีระบบ dormitory แบบ closed-campus ซึ่งอาจทำให้ต้องซื้อแพ็กเกจรวมที่พักและอาหาร 3 มื้อ ราคาโดยเฉลี่ยอยู่ที่</p>\n\n<ul>\n  <li>ค่าเรียน 4 สัปดาห์: <strong>25,000–45,000 บาท</strong> (ขึ้นอยู่กับจำนวนคาบ 4–8 คาบ/วัน)</li>\n  <li>ค่าที่พักในโรงเรียน (Dormitory): <strong>8,000–18,000 บาท/เดือน</strong></li>\n  <li>ค่าอาหาร 3 มื้อ/วัน: <strong>6,000–12,000 บาท/เดือน</strong></li>\n  <li>ค่าตั๋วเครื่องบินไทย–เซบู/มะนิลา: <strong>8,000–18,000 บาท</strong> (round trip)</li>\n</ul>\n\n<h2>สรุป: เลือกระบบไหนดี?</h2>\n\n<p>ถ้าต้องสรุปสั้นๆ คือ <strong>Semi-Sparta เหมาะกับคนส่วนใหญ่ที่เป็นนักเรียนไทย</strong> เพราะมันสร้างวินัยในการใช้ภาษาอังกฤษได้จริงในช่วงเวลาสำคัญ (โรงอาหาร กิจกรรมกลุ่ม พื้นที่ส่วนกลาง) โดยไม่ทำให้รู้สึกขังตัวเองจนเครียดเกินไป ส่วน Sparta เหมาะกับคนที่มีเวลาน้อยและต้องการผลลัพธ์เร็ว ขณะที่ General เหมาะกับคนที่มาระยะยาวหรือต้องการชีวิตที่สมดุล</p>\n\n<p>หากคุณยังไม่แน่ใจว่าระบบไหนเหมาะกับคุณ หรืออยากรู้ว่าโรงเรียนไหนในฟิลิปปินส์มีระบบที่ตรงกับเป้าหมายของคุณ <strong>ติดต่อ Philingo by Thai Study Abroad Consultant ขอคำปรึกษาฟรีได้เลย!</strong> ทีมงานมีประสบการณ์ช่วยนักเรียนไทยวางแผนเรียนภาษาอังกฤษในฟิลิปปินส์มากกว่า 1,000 คน พร้อมแนะนำโรงเรียนที่เหมาะกับระดับและเป้าหมายของคุณโดยเฉพาะ</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: Sparta กับ Semi-Sparta ต่างกันอย่างไรในทางปฏิบัติ?\nA: Sparta บังคับพูดภาษาอังกฤษตลอด 24 ชั่วโมงในทุกพื้นที่ของโรงเรียน รวมถึงในห้องพักด้วย หากพูดภาษาอื่นจะมีบทลงโทษเช่นถูกปรับเงิน 50–200 เปโซ ส่วน Semi-Sparta อนุญาตให้พูดภาษาอื่นในห้องพักส่วนตัวได้ แต่ต้องใช้ภาษาอังกฤษในพื้นที่ส่วนกลางและกิจกรรมต่างๆ ของโรงเรียน\n\nQ: ผู้เริ่มต้นที่ภาษาอังกฤษไม่แข็งแรงควรเลือกระบบไหน?\nA: ผู้เริ่มต้นที่มีพื้นฐานน้อย (ระดับ A1–A2) ควรเลือก Semi-Sparta มากกว่า Sparta เพราะ Sparta อาจทำให้เครียดจนเกินไปเมื่อยังไม่มีคำศัพท์พอ General Program ก็เป็นตัวเลือกได้หากมาเรียนระยะยาว เพราะจะมีเวลาค่อยๆ สร้างความมั่นใจก่อน\n\nQ: โรงเรียนในฟิลิปปินส์ที่มีระบบ Sparta มีที่ไหนบ้าง?\nA: โรงเรียนที่มีชื่อเสียงด้านระบบ Sparta ได้แก่ PINES International Academy ในบาเกียว, CIA (Center for International Education of Asia) ในเซบู และ HELP English Academy ในบาเกียว โดยโรงเรียนเหล่านี้มีระบบ closed-campus ชัดเจนและมีทีม English Monitor คอยตรวจสอบการใช้ภาษาอังกฤษของนักเรียนตลอดวัน\n\nQ: เรียนฟิลิปปินส์ระบบ Sparta ใช้เวลากี่สัปดาห์ถึงจะเห็นผล?\nA: โดยทั่วไปนักเรียนส่วนใหญ่เริ่มรู้สึกถึงความเปลี่ยนแปลงชัดเจนในสัปดาห์ที่ 3–4 คือพูดได้คล่องขึ้นและกล้าพูดมากขึ้น หลังจาก 8 สัปดาห์ (2 เดือน) ของ Sparta มักจะเห็นพัฒนาการด้าน Speaking และ Listening อย่างชัดเจน โดยเฉพาะในคนที่มีพื้นฐานระดับ A2 ขึ้นไป	/api/storage/objects/uploads/1ce1aba4-523e-45d3-9510-252ad53575ec	tips	Philingo Team	ทีม Philingo	[]	Sparta Semi-Sparta General คืออะไร? โปรแกรมเรียนอังกฤษฟิลิปปินส์	Sparta, Semi-Sparta และ General คือระบบเรียนภาษาอังกฤษในฟิลิปปินส์ที่ต่างกันชัดเจน เช็กความแตกต่าง กฎ และข้อดีของแต่ละระบบ พร้อมคำแนะนำว่าแบบไหนเหมาะกับคุณ	0	f	t	\N	2026-08-02 09:06:17.242952	2026-08-06 13:20:38.57	Sparta คืออะไร, Semi-Sparta คืออะไร, เรียนภาษาอังกฤษฟิลิปปินส์, โปรแกรมเรียนอังกฤษฟิลิปปินส์, Sparta Semi-Sparta General, เรียนอังกฤษที่ฟิลิปปินส์, ระบบ Sparta โรงเรียนฟิลิปปินส์, PINES Baguio, CIA Cebu, เรียนภาษาอังกฤษต่างประเทศ
41	tourist-attractions-cebu-philippines	ที่เที่ยวในเซบู	ที่เที่ยวในเซบู	เซบูเป็นเมืองใหญ่อันดับ 2 ของฟิลิปปินส์ ตั้งอยู่บนเกาะเซบูซึ่งมีความยาวประมาณ 225 กิโลเมตร มีสนามบินนานาชาติ Mactan-Cebu ซบู ฟิลิปปินส์ มีสถานที่ท่องเที่ยวหลากหลายครอบคลุมทั้งทะเลสวย วัฒนธรรมเก่าแก่กว่า 500 ปี	\N	\N	<p>เซบู ฟิลิปปินส์ มีสถานที่ท่องเที่ยวหลากหลายครอบคลุมทั้งทะเลสวย วัฒนธรรมเก่าแก่กว่า 500 ปี และห้างช้อปปิ้งระดับโลก ไม่ว่าจะเป็นวันหยุดสุดสัปดาห์หรือพักยาว 3-7 วัน เซบูตอบโจทย์ได้ครบในที่เดียว และค่าใช้จ่ายต่อวันอยู่ที่ประมาณ <strong>800–2,000 บาท</strong> ต่อคนเท่านั้น ถือว่าคุ้มมากเมื่อเทียบกับการเที่ยวในไทยหรือยุโรป</p>\n\n<h2>เซบูน่าเที่ยวแค่ไหน? ทำไมคนไทยถึงชอบมาเที่ยวที่นี่?</h2>\n\n<p>เซบูเป็นเมืองใหญ่อันดับ 2 ของฟิลิปปินส์ ตั้งอยู่บนเกาะเซบูซึ่งมีความยาวประมาณ 225 กิโลเมตร มีสนามบินนานาชาติ Mactan-Cebu เชื่อมตรงกับกรุงเทพฯ ใช้เวลาบินเพียง <strong>3 ชั่วโมง 30 นาที</strong> และมีเที่ยวบินตรงจากสุวรรณภูมิทุกวัน ทำให้สะดวกมากสำหรับคนไทยที่อยากหนีร้อนหรือพักสั้น</p>\n\n<p>สิ่งที่ทำให้เซบูโดดเด่นกว่าจุดหมายอื่นในฟิลิปปินส์ คือ <strong>ความหลากหลายของกิจกรรม</strong> ในพื้นที่ไม่ใหญ่มาก คุณสามารถดำน้ำดูฉลามวาฬในช่วงเช้า บ่ายเดินชมโบสถ์อายุ 450 ปี และเย็นช้อปปิ้งในห้างระดับพรีเมียมได้ในวันเดียวกัน นอกจากนี้ชาวเซบูยังเป็นมิตรกับนักท่องเที่ยวมาก และเกือบทุกคนพูดภาษาอังกฤษได้คล่อง</p>\n\n<h2>ที่เที่ยวในเซบูมีอะไรบ้าง? สถานที่ห้ามพลาดมีกี่แห่ง?</h2>\n\n<h3>ทะเลและกิจกรรมทางน้ำ — ไฮไลต์ที่ทุกคนต้องทำ</h3>\n\n<p><strong>Oslob Whale Shark Watching</strong> คือกิจกรรมยอดฮิตอันดับ 1 ของเซบู อยู่ห่างจากตัวเมืองประมาณ <strong>3–4 ชั่วโมง</strong> โดยรถยนต์ ที่นี่คุณจะได้ว่ายน้ำหรือดำน้ำตื้นใกล้ชิดฉลามวาฬขนาดยักษ์ ความยาว 6–10 เมตร ค่าเข้าร่วมกิจกรรมอยู่ที่ประมาณ <strong>1,000–1,500 บาท</strong> รวมอุปกรณ์ดำน้ำตื้น ควรออกเดินทางตั้งแต่ตี 4 เพราะฉลามวาฬมักจะมาตอนเช้ามืด และหลัง 12.00 น. กิจกรรมจะปิด</p>\n\n<p><strong>เกาะ Malapascua</strong> เป็นเกาะเล็กๆ ทางเหนือของเซบู ใช้เวลาเดินทางจากตัวเมืองประมาณ <strong>3.5 ชั่วโมง</strong> บวกนั่งเรือเฟอร์รี่อีก 30 นาที ที่นี่ขึ้นชื่อเรื่องการดำน้ำลึกพบฉลาม Thresher อย่างใกล้ชิด ราคาดำน้ำเริ่มต้น <strong>1,200–2,000 บาท</strong> ต่อ 2 dives และยังมีหาดทรายขาวสวยงามเหมาะกับนักท่องเที่ยวที่อยากพักแบบเงียบๆ</p>\n\n<p><strong>เกาะ Bantayan</strong> ทางเหนือเช่นกัน เป็นเกาะที่ยังไม่คราคร่ำด้วยนักท่องเที่ยว มีหาดทรายสีขาวและน้ำทะเลสีฟ้าใส ค่าเรือเฟอร์รี่ไปกลับอยู่ที่ราว <strong>400–600 บาท</strong> เหมาะสำหรับคนที่อยากหนีความวุ่นวาย</p>\n\n<p><strong>Kawasan Falls</strong> น้ำตกสีฟ้าเทอร์คอยซ์อันโด่งดัง อยู่ที่ Badian ห่างจากเซบูซิตี้ประมาณ <strong>3 ชั่วโมง</strong> กิจกรรมยอดนิยมคือ Canyoneering ล่องแก่งและกระโดดหน้าผาลงสู่น้ำตก ราคาแพ็กเกจ Canyoneering รวมไกด์ อยู่ที่ประมาณ <strong>800–1,200 บาท</strong> ต่อคน ใช้เวลาประมาณ 4–5 ชั่วโมง</p>\n\n<h3>วัฒนธรรมและประวัติศาสตร์ในเซบูซิตี้</h3>\n\n<p><strong>Basilica Minore del Santo Niño</strong> โบสถ์คาทอลิกที่เก่าแก่ที่สุดในฟิลิปปินส์ สร้างในปี ค.ศ. 1565 หรือกว่า <strong>450 ปีที่แล้ว</strong> ภายในประดิษฐานรูปปั้น Santo Niño หรือพระกุมารเยซูซึ่งชาวฟิลิปปินส์เคารพนับถืออย่างมาก เข้าชมฟรี เปิดทุกวันตั้งแต่เช้าจนถึงค่ำ ถือเป็น landmark ที่ต้องไปถ่ายรูปให้ได้สักครั้ง</p>\n\n<p><strong>Magellan's Cross</strong> ไม้กางเขนสัญลักษณ์การเผยแผ่ศาสนาคริสต์ในฟิลิปปินส์ โดยนักสำรวจ Magellan เมื่อปี ค.ศ. 1521 ตั้งอยู่ในศาลาเล็กๆ ห่างจากโบสถ์ Santo Niño เพียง <strong>50 เมตร</strong> เข้าชมฟรี เป็นจุดที่นักท่องเที่ยวมักเดินมาต่อกันในวันเดียว</p>\n\n<p><strong>Fort San Pedro</strong> ป้อมปราการสามเหลี่ยมที่เก่าแก่ที่สุดในฟิลิปปินส์ สร้างในปี ค.ศ. 1565 ค่าเข้าชมเพียง <strong>30 เปโซ หรือประมาณ 20 บาท</strong> ภายในมีพิพิธภัณฑ์เล็กๆ และสวนสวยริมอ่าว เหมาะสำหรับใครที่ชอบประวัติศาสตร์ยุคอาณานิคม</p>\n\n<p><strong>Taoist Temple</strong> วิหารเต๋าบนเนินเขา Beverly Hills ของเซบู เปิดให้เข้าชมฟรี วิวจากด้านบนมองเห็นตัวเมืองเซบูได้กว้าง เดินทางโดยแท็กซี่ใช้เวลาประมาณ <strong>15 นาที</strong> จาก IT Park และค่าแท็กซี่อยู่ที่ราว <strong>100–150 บาท</strong></p>\n\n<h3>ช้อปปิ้งและกินเที่ยวในเซบู</h3>\n\n<p>เซบูมีห้างสรรพสินค้าครบครันสำหรับนักช้อป โดย <strong>SM Seaside City Cebu</strong> เป็นหนึ่งในห้าง SM ที่ใหญ่ที่สุดในฟิลิปปินส์ มีพื้นที่กว่า <strong>400,000 ตารางเมตร</strong> ครอบคลุมแบรนด์ระดับสากล ร้านอาหาร ซูเปอร์มาร์เก็ต และโรงภาพยนตร์ <strong>Ayala Center Cebu</strong> เป็นห้างพรีเมียมที่นิยมในหมู่นักท่องเที่ยว มีร้านแบรนด์เนม คาเฟ่ดัง และ food hall ขนาดใหญ่</p>\n\n<p>สำหรับของที่ระลึก แนะนำให้ไปที่ <strong>Carbon Market</strong> ตลาดสดและตลาดของฝากที่ใหญ่ที่สุดในเซบู เปิดตั้งแต่เช้ามืด มีมะม่วงอบแห้ง ช็อกโกแลต tablea และสินค้าพื้นเมืองราคาถูกกว่าห้างมาก ของฝากยอดนิยมคือ <strong>mango dried</strong> ราคาถุงละ <strong>80–150 บาท</strong></p>\n\n<h2>วางแผนท่องเที่ยวเซบูกี่วันถึงจะพอ?</h2>\n\n<p>สำหรับนักท่องเที่ยวทั่วไปแนะนำ <strong>4–5 วัน</strong> เพื่อให้ครอบคลุมทั้งทะเล วัฒนธรรม และช้อปปิ้ง โดยแบ่งได้ดังนี้</p>\n\n<ul>\n  <li><strong>วันที่ 1:</strong> เดินทางถึง เช็คอิน เดินชม Basilica Santo Niño, Magellan's Cross, Fort San Pedro และช้อปปิ้งที่ Ayala Center</li>\n  <li><strong>วันที่ 2:</strong> ออกตี 4 ไป Oslob ดูฉลามวาฬ + แวะ Kawasan Falls ระหว่างทาง กลับถึงเมืองช่วงค่ำ</li>\n  <li><strong>วันที่ 3:</strong> เดินทางไปเกาะ Malapascua หรือ Bantayan พักค้างคืน</li>\n  <li><strong>วันที่ 4:</strong> เที่ยวเกาะเพิ่มเติม หรือกลับเซบูซิตี้ช้อปปิ้งที่ SM Seaside</li>\n  <li><strong>วันที่ 5:</strong> เที่ยวตลาด Carbon Market ซื้อของฝาก แล้วเดินทางกลับ</li>\n</ul>\n\n<p>ค่าที่พักในเซบูซิตี้เริ่มต้นที่ <strong>600 บาท/คืน</strong> สำหรับโรงแรมบัดเจ็ต และ <strong>1,500–3,000 บาท</strong> สำหรับโรงแรม 3–4 ดาวใกล้ IT Park หรือ Ayala</p>\n\n<h2>สรุป: เซบูเที่ยวได้ทุกสไตล์ ไม่ว่าจะชอบแบบไหน</h2>\n\n<p>เซบูเป็นจุดหมายที่สมบูรณ์แบบสำหรับนักท่องเที่ยวชาวไทยที่ต้องการประสบการณ์หลากหลายในงบประมาณที่ไม่สูง ตั้งแต่ดำน้ำดูฉลามวาฬในราคาพันกว่าบาท เดินชมโบสถ์ประวัติศาสตร์ฟรี จนถึงช้อปปิ้งในห้างใหญ่ระดับเอเชีย ทั้งหมดนี้อยู่บนเกาะเดียวที่เดินทางจากไทยได้ใน 3.5 ชั่วโมง</p>\n\n<p>หากคุณกำลังวางแผนมาเซบูเพื่อท่องเที่ยว หรือสนใจอยู่เซบูระยะยาวเพื่อเรียนภาษาอังกฤษควบคู่กับการท่องเที่ยว สามารถปรึกษาทีมงาน <strong>Philingo by Thai Study Abroad Consultant</strong> ได้ฟรี เราให้คำแนะนำเรื่องโรงเรียนสอนภาษาอังกฤษในเซบู แพ็กเกจที่พัก และการวางแผนใช้ชีวิตในฟิลิปปินส์ครบวงจร ติดต่อขอคำปรึกษาฟรีได้เลยวันนี้!</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: เซบูเที่ยวช่วงไหนดีที่สุด?\nA: ช่วงที่ดีที่สุดสำหรับการท่องเที่ยวเซบูคือเดือนธันวาคม–พฤษภาคม ซึ่งเป็นฤดูแล้ง ฝนน้อย ทะเลสงบ เหมาะกับกิจกรรมดำน้ำ โดยเฉพาะเดือนมกราคมซึ่งตรงกับงาน Sinulog Festival เทศกาลใหญ่ที่สุดของเซบูที่ดึงดูดนักท่องเที่ยวกว่า 2 ล้านคนต่อปี ควรจองที่พักล่วงหน้าอย่างน้อย 2–3 เดือนในช่วงนั้น\n\nQ: ไปดูฉลามวาฬที่ Oslob ต้องเตรียมอะไรบ้าง?\nA: ควรออกเดินทางจากเซบูซิตี้ตั้งแต่ตี 4–5 เพราะกิจกรรมจะเริ่มตั้งแต่ 6 โมงเช้าและปิดตอนเที่ยง เตรียมชุดว่ายน้ำ ครีมกันแดดแบบ reef-safe (ห้ามใช้ครีมกันแดดทั่วไปเพราะทำลายปะการัง) และค่าเข้าร่วมกิจกรรมประมาณ 1,000–1,500 บาท รวมอุปกรณ์ดำน้ำตื้นแล้ว สามารถจ้างรถเช่าหรือทัวร์แบบเหมาไปกลับได้ในราคาคนละ 800–1,200 บาท\n\nQ: เซบูซิตี้ใช้การเดินทางยังไง ต้องเช่ารถไหม?\nA: ในตัวเมืองเซบูมีสามล้อ (habal-habal) แท็กซี่ และแอป Grab ให้ใช้บริการสะดวก ราคา Grab ในเมืองเริ่มต้นที่ประมาณ 50–150 บาท ส่วนการเดินทางไปต่างเมืองอย่าง Oslob หรือ Kawasan Falls แนะนำให้เช่ารถพร้อมคนขับหรือจองทัวร์แบบกลุ่ม ราคาเช่ารถ 1 วันอยู่ที่ประมาณ 2,000–3,500 บาท รวมน้ำมันและคนขับ\n\nQ: เซบูปลอดภัยสำหรับนักท่องเที่ยวไทยไหม?\nA: เซบูถือเป็นหนึ่งในเมืองที่ค่อนข้างปลอดภัยสำหรับนักท่องเที่ยวในฟิลิปปินส์ โดยเฉพาะพื้นที่ท่องเที่ยวหลักอย่าง IT Park, Ayala Center และ SM Seaside ซึ่งมีระบบรักษาความปลอดภัยตลอด 24 ชั่วโมง แนะนำให้หลีกเลี่ยงการเดินคนเดียวในพื้นที่ที่ไม่คุ้นเคยตอนดึก และใช้ Grab แทนการโบกรถ เพื่อความปลอดภัยสูงสุด	/api/storage/objects/uploads/7db39e11-53d2-4c40-8a07-ce4ff030af35	life	Philingo Team	ทีม Philingo	[]	ที่เที่ยวเซบู ฟิลิปปินส์ ทะเล วัฒนธรรม ช้อปปิ้ง ครบจบที่เดียว	รวมที่เที่ยวเซบู ฟิลิปปินส์ ดูฉลามวาฬ ดำน้ำ น้ำตก Kawasan โบสถ์เก่าแก่ และช้อปปิ้ง ค่าใช้จ่ายแค่ 800-2,000 บาท/วัน บินตรงจากกรุงเทพฯ 3.5 ชั่วโมง	0	f	t	\N	2026-08-02 09:13:50.975842	2026-08-06 15:21:16.548	ที่เที่ยวเซบู, เที่ยวเซบูฟิลิปปินส์, เซบูฟิลิปปินส์, ดูฉลามวาฬเซบู, Kawasan Falls, เกาะ Malapascua, เกาะ Bantayan, Oslob, เที่ยวฟิลิปปินส์, เซบูซิตี้, ท่องเที่ยวเซบู, เที่ยวทะเลฟิลิปปินส์, แพลนเที่ยวเซบู
4	cost-of-studying-english-philippines	ค่าใช้จ่ายในการเรียนภาษาอังกฤษในฟิลิปปินส์	ค่าใช้จ่ายในการเรียนภาษาอังกฤษในฟิลิปปินส์เท่าไหร่?	เรียนภาษาอังกฤษที่ฟิลิปปินส์ใช้งบประมาณโดยเฉลี่ย <strong>35,000–70,000 บาทต่อเดือน</strong> โดยรวมค่าเรียน ค่าที่พักในโรงเรียน อาหาร 3 มื้อ และกิจกรรม เรียกได้ว่าคุ้มค่ากว่าการเรียนในยุโรปหรืออเมริกาถึง 3–5 เท่า ทั้งนี้ค่าใช้จ่ายจะแตกต่างกันตามเมือง ประเภทโรงเรียน และโปรแกรมที่เลือก	รายละเอียดค่าใช้จ่ายทั้งหมดที่เกี่ยวข้องกับการเรียนภาษาอังกฤษในฟิลิปปินส์	# Cost of Studying English in the Philippines\n\nThe Philippines is known for being one of the most affordable...	```html\n<p>เรียนภาษาอังกฤษที่ฟิลิปปินส์ใช้งบประมาณโดยเฉลี่ย <strong>35,000–70,000 บาทต่อเดือน</strong> โดยรวมค่าเรียน ค่าที่พักในโรงเรียน อาหาร 3 มื้อ และกิจกรรม เรียกได้ว่าคุ้มค่ากว่าการเรียนในยุโรปหรืออเมริกาถึง 3–5 เท่า ทั้งนี้ค่าใช้จ่ายจะแตกต่างกันตามเมือง ประเภทโรงเรียน และโปรแกรมที่เลือก</p>\n\n<h2>ค่าเรียนภาษาอังกฤษที่ฟิลิปปินส์เฉลี่ยเท่าไหร่ต่อเดือน?</h2>\n\n<p>ค่าเรียนภาษาอังกฤษที่ฟิลิปปินส์แบ่งออกเป็น 2 รูปแบบหลัก คือ <strong>แบบพักอยู่ในโรงเรียน (ESL Camp)</strong> และ <strong>แบบไปเรียนเองโดยไม่พักในโรงเรียน</strong> ซึ่งราคาต่างกันอย่างมีนัยสำคัญ</p>\n\n<h3>แบบพักในโรงเรียน (Full Board) — ตัวเลือกยอดนิยม</h3>\n<p>โปรแกรมนี้รวมค่าเรียน ค่าห้องพัก และอาหาร 3 มื้อไว้ในราคาเดียว สะดวกและประหยัดกว่าการจัดการเองทุกอย่าง ราคาโดยเฉลี่ยอยู่ที่:</p>\n<ul>\n  <li><strong>เมืองเซบู (Cebu)</strong>: 28,000–45,000 บาท/เดือน</li>\n  <li><strong>เมืองบาเกียว (Baguio)</strong>: 25,000–40,000 บาท/เดือน</li>\n  <li><strong>เมืองดาเวา (Davao)</strong>: 22,000–35,000 บาท/เดือน</li>\n  <li><strong>กรุงมะนิลา (Manila)</strong>: 35,000–60,000 บาท/เดือน</li>\n</ul>\n\n<h3>แบบไปเรียนเองไม่พักในโรงเรียน (Commuter)</h3>\n<p>หากต้องการประหยัดค่าใช้จ่ายและเลือกที่พักเอง สามารถเช่าอพาร์ตเมนต์นอกโรงเรียนในราคา <strong>6,000–12,000 บาท/เดือน</strong> รวมกับค่าเรียนเฉลี่ย 15,000–25,000 บาท/เดือน รวมแล้วอาจประหยัดกว่าแบบ Full Board ได้ถึง 20–30% แต่ต้องจัดการเรื่องอาหารและการเดินทางเอง</p>\n\n<h2>ค่าใช้จ่ายแต่ละประเภทที่ต้องรู้ก่อนไปเรียนฟิลิปปินส์</h2>\n\n<h3>ค่าวีซ่าและค่าธรรมเนียม</h3>\n<ul>\n  <li>คนไทยเข้าฟิลิปปินส์ได้ฟรีสูงสุด <strong>30 วัน</strong> โดยไม่ต้องขอวีซ่า</li>\n  <li>ต่อการพำนักครั้งแรก: <strong>3,000–4,000 บาท</strong></li>\n  <li>ต่อวีซ่าทุก 2 เดือนหลังจากนั้น: <strong>2,500–3,500 บาท/ครั้ง</strong></li>\n  <li>ค่า SSP (Special Study Permit) สำหรับเรียนนานกว่า 30 วัน: <strong>3,500–5,000 บาท</strong></li>\n</ul>\n\n<h3>ค่าตั๋วเครื่องบิน</h3>\n<ul>\n  <li>กรุงเทพฯ–เซบู (ตรง): <strong>4,000–9,000 บาท</strong> ไป-กลับ</li>\n  <li>กรุงเทพฯ–มะนิลา (ตรง): <strong>3,500–8,000 บาท</strong> ไป-กลับ</li>\n  <li>ราคาถูกสุดหากจองล่วงหน้า 2–3 เดือน ผ่านสายการบิน Cebu Pacific หรือ AirAsia</li>\n</ul>\n\n<h3>ค่าใช้จ่ายส่วนตัวและความบันเทิง</h3>\n<p>นอกจากค่าเรียนและที่พัก ยังมีค่าใช้จ่ายส่วนตัวที่ควรเผื่องบไว้ได้แก่:</p>\n<ul>\n  <li>ค่าอินเทอร์เน็ตเพิ่มเติม (ซิมการ์ด): <strong>500–1,000 บาท/เดือน</strong></li>\n  <li>ค่าเดินทางภายในเมือง (Jeepney/Grab): <strong>1,500–3,000 บาท/เดือน</strong></li>\n  <li>ค่าอาหารนอกโรงเรียน/ท่องเที่ยววันหยุด: <strong>3,000–8,000 บาท/เดือน</strong></li>\n  <li>ค่าประกันสุขภาพ (แนะนำมาก): <strong>1,500–3,000 บาท/เดือน</strong></li>\n</ul>\n\n<h2>เรียนที่เมืองไหนของฟิลิปปินส์คุ้มค่าที่สุด?</h2>\n\n<h3>เซบู (Cebu) — เมืองยอดนิยมอันดับ 1 สำหรับคนไทย</h3>\n<p>เซบูเป็นศูนย์กลางโรงเรียนสอนภาษาอังกฤษที่ใหญ่ที่สุดในฟิลิปปินส์ มีโรงเรียนให้เลือกมากกว่า <strong>50 แห่ง</strong> ในพื้นที่ Mandaue, Cebu City และ Lapu-Lapu งบโดยรวมต่อเดือนอยู่ที่ <strong>35,000–55,000 บาท</strong> พร้อมสิ่งอำนวยความสะดวกครบครันและมีชุมชนนักเรียนไทยขนาดใหญ่ที่ช่วยให้ปรับตัวได้ง่าย</p>\n\n<h3>บาเกียว (Baguio) — เมืองเย็น ค่าครองชีพต่ำ</h3>\n<p>บาเกียวตั้งอยู่บนภูเขาสูง 1,500 เมตร อากาศเย็นสบายตลอดปี 16–22 องศาเซลเซียส ค่าครองชีพถูกกว่าเซบูประมาณ <strong>10–20%</strong> งบเฉลี่ยต่อเดือนอยู่ที่ <strong>28,000–45,000 บาท</strong> เหมาะสำหรับคนที่ต้องการบรรยากาศเงียบสงบและต้องการเน้นการเรียนจริงจัง</p>\n\n<h3>ดาเวา (Davao) — ตัวเลือกราคาประหยัด</h3>\n<p>ดาเวาเป็นเมืองทางตอนใต้ที่มีชื่อเสียงด้านความปลอดภัยและราคาถูก ค่าใช้จ่ายรวมเฉลี่ยเพียง <strong>25,000–38,000 บาท/เดือน</strong> แต่มีจำนวนโรงเรียนน้อยกว่าเซบูและบาเกียว เหมาะสำหรับนักเรียนที่มีงบจำกัดแต่ต้องการคุณภาพการเรียนที่ดี</p>\n\n<h2>โปรแกรมเรียนมีกี่แบบ และราคาต่างกันอย่างไร?</h2>\n\n<p>โปรแกรมเรียนภาษาอังกฤษที่ฟิลิปปินส์แบ่งออกเป็นหลายรูปแบบ แต่ละแบบมีราคาและจุดเด่นที่แตกต่างกัน:</p>\n\n<ul>\n  <li><strong>General English (ESL ทั่วไป)</strong>: เน้นทักษะฟัง-พูด-อ่าน-เขียน ราคา <strong>20,000–35,000 บาท/เดือน</strong></li>\n  <li><strong>IELTS Preparation</strong>: เตรียมสอบ IELTS โดยเฉพาะ ราคา <strong>28,000–45,000 บาท/เดือน</strong></li>\n  <li><strong>TOEFL/TOEIC Preparation</strong>: สำหรับการสอบ TOEIC ที่ต้องการใช้ในการทำงาน ราคา <strong>25,000–40,000 บาท/เดือน</strong></li>\n  <li><strong>Business English</strong>: ภาษาอังกฤษเชิงธุรกิจ ราคา <strong>30,000–50,000 บาท/เดือน</strong></li>\n  <li><strong>Summer English Camp (4 สัปดาห์)</strong>: ราคาพิเศษสำหรับนักเรียน <strong>25,000–40,000 บาท</strong> ต่อคอร์ส</li>\n</ul>\n\n<p>โดยส่วนใหญ่ระยะเวลาที่คนไทยนิยมเรียนคือ <strong>4–12 สัปดาห์</strong> ซึ่งถือว่าได้ผลดีที่สุดเพราะสามารถเห็นพัฒนาการได้ชัดเจน และยังไม่ต้องใช้วีซ่าซับซ้อนมากนัก</p>\n\n<h2>สรุป: เตรียมงบเท่าไหร่ถึงจะพอสำหรับการเรียนที่ฟิลิปปินส์?</h2>\n\n<p>สำหรับการเรียนภาษาอังกฤษที่ฟิลิปปินส์ระยะเวลา <strong>1 เดือน</strong> ควรเตรียมงบทั้งหมดประมาณ <strong>40,000–65,000 บาท</strong> (รวมตั๋วเครื่องบิน วีซ่า ค่าเรียน-ที่พัก และค่าใช้จ่ายส่วนตัว) หากเรียน <strong>2–3 เดือน</strong> งบรวมจะอยู่ที่ <strong>80,000–160,000 บาท</strong> ซึ่งยังถือว่าคุ้มค่ามากเมื่อเทียบกับการเรียนในประเทศที่ใช้ภาษาอังกฤษเป็นภาษาหลักอย่างออสเตรเลียหรืออังกฤษที่อาจใช้งบสูงกว่าถึง 4–5 เท่า</p>\n\n<p>หากคุณยังไม่แน่ใจว่าควรเลือกโรงเรียนไหน เมืองไหน หรือโปรแกรมใดที่เหมาะกับเป้าหมายและงบประมาณของคุณ <strong>Philingo by Thai Study Abroad Consultant</strong> พร้อมให้คำปรึกษาฟรีโดยทีมที่มีประสบการณ์ส่งนักเรียนไทยไปฟิลิปปินส์มาแล้วมากกว่า 1,000 คน ติดต่อเราได้เลยวันนี้เพื่อรับแผนการเรียนและค่าใช้จ่ายที่เหมาะกับคุณโดยเฉพาะ</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: เรียนภาษาอังกฤษที่ฟิลิปปินส์ 1 เดือนใช้เงินเท่าไหร่?\nA: สำหรับการเรียน 1 เดือนที่ฟิลิปปินส์ควรเตรียมงบรวมประมาณ 40,000–65,000 บาท โดยรวมค่าตั๋วเครื่องบินไป-กลับ (4,000–9,000 บาท) ค่าเรียนและที่พักแบบ Full Board (25,000–45,000 บาท) และค่าใช้จ่ายส่วนตัวอื่นๆ อีกประมาณ 5,000–10,000 บาท ราคาจะแตกต่างกันขึ้นอยู่กับเมืองและโรงเรียนที่เลือก\n\nQ: เรียนภาษาอังกฤษที่เซบูกับบาเกียวต่างกันอย่างไร และราคาต่างกันมากไหม?\nA: เซบูเป็นเมืองใหญ่ริมทะเล มีโรงเรียนให้เลือกมากกว่า 50 แห่ง ค่าใช้จ่ายเฉลี่ย 35,000–55,000 บาท/เดือน เหมาะสำหรับคนที่ต้องการความหลากหลายและชีวิตสังคม ส่วนบาเกียวเป็นเมืองบนภูเขา อากาศเย็นสบาย ค่าใช้จ่ายถูกกว่าประมาณ 10–20% อยู่ที่ 28,000–45,000 บาท/เดือน เหมาะสำหรับคนที่ต้องการสมาธิในการเรียนและชอบอากาศเย็น\n\nQ: ต้องทำวีซ่าก่อนไปเรียนฟิลิปปินส์ไหม และค่าใช้จ่ายเท่าไหร่?\nA: คนไทยสามารถเข้าฟิลิปปินส์ได้โดยไม่ต้องขอวีซ่าล่วงหน้า สูงสุด 30 วัน แต่หากต้องการเรียนนานกว่านั้นต้องต่อการพำนักในราคา 3,000–4,000 บาท และขอ Special Study Permit (SSP) ที่ค่าธรรมเนียมประมาณ 3,500–5,000 บาท ซึ่งโรงเรียนส่วนใหญ่จะช่วยดำเนินการให้\n\nQ: โปรแกรมเรียน IELTS ที่ฟิลิปปินส์มีค่าใช้จ่ายเท่าไหร่ และใช้ระยะเวลานานแค่ไหน?\nA: โปรแกรมเตรียมสอบ IELTS ที่ฟิลิปปินส์มีค่าใช้จ่ายเฉลี่ย 28,000–45,000 บาท/เดือน (รวมที่พักและอาหาร) ระยะเวลาที่แนะนำคือ 4–12 สัปดาห์ขึ้นอยู่กับพื้นฐานของผู้เรียน นักเรียนส่วนใหญ่สามารถเพิ่มคะแนน IELTS ได้ 0.5–1.5 Band หลังจากเรียนเข้มข้น 8–12 สัปดาห์\n\nQ: เรียนที่ฟิลิปปินส์คุ้มค่ากว่าเรียนในไทยหรือประเทศอื่นอย่างไร?\nA: เรียนที่ฟิลิปปินส์คุ้มค่ากว่าชัดเจนเพราะได้เรียนกับครูเจ้าของภาษาในราคาที่ถูกกว่าออสเตรเลียหรืออังกฤษถึง 3–5 เท่า ค่าครองชีพที่ฟิลิปปินส์ต่ำมากทำให้งบ 40,000–65,000 บาท/เดือนรวมทุกอย่างได้ เมื่อเทียบกับออสเตรเลียที่ต้องใช้งบมากกว่า 150,000–200,000 บาท/เดือน นอกจากนี้การเรียนแบบ 1-on-1 ในฟิลิปปินส์ยังทำให้พัฒนาทักษะการพูดได้เร็วกว่าเรียนในชั้นเรียนขนาดใหญ่อย่างมีนัยสำคัญ\n```	/api/storage/objects/uploads/b26b514b-6df9-495d-962d-9683a7331230	Tips & Guides	Philingo Team	ทีม Philingo	["Budget", "Philippines", "Study Abroad"]	ค่าใช้จ่ายเรียนภาษาอังกฤษที่ฟิลิปปินส์ 2567	เรียนภาษาอังกฤษที่ฟิลิปปินส์ใช้เงินเท่าไหร่? รวมค่าเรียน ค่าที่พัก วีซ่า และค่าใช้จ่ายรายเดือน เฉลี่ย 35,000–70,000 บาท คุ้มกว่ายุโรป 3–5 เท่า	0	f	t	2024-03-01 00:00:00	2026-07-28 05:53:14.688377	2026-08-06 16:00:00.16	เรียนภาษาอังกฤษฟิลิปปินส์, ค่าใช้จ่ายเรียนฟิลิปปินส์, เรียนภาษาอังกฤษต่างประเทศ, โรงเรียนสอนภาษาอังกฤษฟิลิปปินส์, ESL ฟิลิปปินส์, เรียนภาษาอังกฤษเซบู, เรียนภาษาอังกฤษบาเกียว, ค่าเรียนภาษาอังกฤษต่อเดือน, เรียนต่อฟิลิปปินส์, งบเรียนฟิลิปปินส์
5	how-to-choose-english-school-philippines	การเลือกโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์	วิธีเลือกโรงเรียนภาษาอังกฤษที่ใช่ในฟิลิปปินส์	ก่อนเลือกโรงเรียน ต้องรู้ก่อนว่าคุณอยากได้อะไรจากการเรียนภาษาอังกฤษที่ฟิลิปปินส์ 5 ปัจจัยหลักที่ต้องเช็กก่อนเลือกโรงเรียน	ปัจจัยสำคัญที่ต้องพิจารณาเมื่อเลือกโรงเรียนภาษาอังกฤษในฟิลิปปินส์	# How to Choose the Right English School\n\nChoosing the right English school can make or break your learning experience...	```html\n<p>การเลือกโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ที่ใช่ไม่ใช่เรื่องยาก ถ้ารู้ว่าต้องดูอะไร โดยทั่วไปค่าใช้จ่ายรวมค่าเรียนและที่พักอยู่ที่ <strong>35,000–70,000 บาทต่อเดือน</strong> ขึ้นอยู่กับเมืองและโปรแกรมที่เลือก บทความนี้จะพาคุณเช็กลิสต์ทุกปัจจัยสำคัญก่อนตัดสินใจ ตั้งแต่เรื่องงบประมาณ รูปแบบการเรียน ไปจนถึงการเลือกเมืองที่เหมาะกับไลฟ์สไตล์คุณ</p>\n\n<h2>ทำไมฟิลิปปินส์ถึงเป็นตัวเลือกยอดนิยมสำหรับคนไทยที่อยากพัฒนาภาษาอังกฤษ?</h2>\n<p>ฟิลิปปินส์ถือเป็นจุดหมายอันดับต้น ๆ สำหรับการเรียนภาษาอังกฤษในเอเชีย ด้วยเหตุผลหลักคือ <strong>ค่าใช้จ่ายถูกกว่าประเทศที่ใช้ภาษาอังกฤษเป็นเจ้าของภาษาอย่างออสเตรเลียหรืออังกฤษถึง 50–70%</strong> ขณะที่คุณภาพการสอนยังคงมาตรฐานสูง ครูผู้สอนส่วนใหญ่จบการศึกษาระดับปริญญาตรีขึ้นไปด้านการศึกษาหรือภาษาอังกฤษโดยตรง และที่สำคัญ ชาวฟิลิปปินส์ใช้ภาษาอังกฤษในชีวิตประจำวันจริง ไม่ใช่แค่ในห้องเรียน ทำให้คุณได้ฝึกฝนตลอด 24 ชั่วโมง</p>\n<p>ปัจจุบันมีโรงเรียนสอนภาษาอังกฤษในฟิลิปปินส์มากกว่า <strong>200 แห่ง</strong> กระจายอยู่ใน 3 เมืองหลักคือ เซบู บาเกียว และมะนิลา แต่ละเมืองมีบรรยากาศและจุดเด่นต่างกันออกไป ซึ่งจะพูดถึงในหัวข้อถัดไป</p>\n\n<h2>เซบู บาเกียว หรือมะนิลา เมืองไหนเหมาะกับคุณ?</h2>\n<p>การเลือกเมืองเป็นขั้นตอนแรกที่หลายคนมองข้าม แต่จริง ๆ แล้วมีผลต่อประสบการณ์การเรียนมาก ลองดูข้อมูลเปรียบเทียบเบื้องต้นนี้:</p>\n<ul>\n  <li><strong>เซบู (Cebu):</strong> เมืองใหญ่อันดับ 2 ของฟิลิปปินส์ มีโรงเรียนให้เลือกมากที่สุดกว่า <strong>80 แห่ง</strong> อากาศอบอุ่น ใกล้ทะเล เหมาะกับคนที่อยากได้ประสบการณ์ครบ ทั้งเรียนและท่องเที่ยว ค่าครองชีพอยู่ที่ประมาณ <strong>18,000–28,000 บาทต่อเดือน</strong> รวมที่พักและอาหาร</li>\n  <li><strong>บาเกียว (Baguio):</strong> เมืองบนภูเขาที่ระดับความสูงประมาณ 1,500 เมตร อากาศเย็นสบายตลอดปี อุณหภูมิเฉลี่ย <strong>18–22 องศาเซลเซียส</strong> เหมาะกับคนที่เน้นเรียนจริงจัง บรรยากาศเงียบสงบ ค่าครองชีพถูกกว่าเซบูประมาณ 10–15%</li>\n  <li><strong>มะนิลา (Manila):</strong> เมืองหลวงที่มีชีวิตชีวา เหมาะกับคนที่ต้องการเรียนควบคู่กับการทำงานหรือต่อยอดธุรกิจ ค่าครองชีพสูงสุดในสามเมืองอยู่ที่ประมาณ <strong>25,000–35,000 บาทต่อเดือน</strong> แต่ก็มีสิ่งอำนวยความสะดวกครบครัน</li>\n</ul>\n\n<h2>โปรแกรมการเรียนแบบไหนที่ตรงกับเป้าหมายของคุณ?</h2>\n<p>ก่อนเลือกโรงเรียน ต้องรู้ก่อนว่าคุณอยากได้อะไรจากการเรียนภาษาอังกฤษที่ฟิลิปปินส์ โปรแกรมหลัก ๆ ที่มีให้เลือกแบ่งได้ดังนี้:</p>\n<ul>\n  <li><strong>General English:</strong> เหมาะสำหรับผู้เริ่มต้นหรือต้องการพัฒนาทักษะรอบด้าน ทั้งพูด ฟัง อ่าน เขียน ระยะเวลาขั้นต่ำที่แนะนำคือ <strong>4 สัปดาห์</strong> ค่าเรียนอยู่ที่ <strong>12,000–20,000 บาทต่อเดือน</strong></li>\n  <li><strong>IELTS / TOEIC Preparation:</strong> เน้นสอบวัดผล เหมาะกับคนที่ต้องการสมัครเรียนต่อต่างประเทศหรือใช้คะแนนในการทำงาน โปรแกรมมาตรฐาน 8–12 สัปดาห์ ค่าเรียนประมาณ <strong>15,000–25,000 บาทต่อเดือน</strong></li>\n  <li><strong>Business English:</strong> เน้นภาษาในบริบทธุรกิจ การประชุม การนำเสนอ อีเมลเชิงวิชาชีพ เหมาะกับมนุษย์ออฟฟิศที่ต้องใช้ภาษาอังกฤษในงาน</li>\n  <li><strong>ESL Intensive (1-on-1):</strong> เรียนตัวต่อตัวกับครู 6–8 ชั่วโมงต่อวัน พัฒนาได้เร็วที่สุด แต่ค่าใช้จ่ายสูงกว่าระบบกลุ่มประมาณ <strong>30–40%</strong></li>\n</ul>\n\n<h2>5 ปัจจัยหลักที่ต้องเช็กก่อนเลือกโรงเรียน</h2>\n<p>เมื่อรู้แล้วว่าอยากเรียนที่ไหนและโปรแกรมไหน ขั้นต่อมาคือเปรียบเทียบโรงเรียนอย่างละเอียด นี่คือ 5 ปัจจัยที่ไม่ควรมองข้าม:</p>\n<ul>\n  <li><strong>1. การรับรองมาตรฐาน (Accreditation):</strong> ตรวจสอบว่าโรงเรียนได้รับการรับรองจาก Bureau of Immigration (BI) ของฟิลิปปินส์ และควรมีใบรับรองจาก TESDA หรือ DepEd ซึ่งการันตีคุณภาพหลักสูตร</li>\n  <li><strong>2. อัตราส่วนครูต่อนักเรียน:</strong> โรงเรียนดีควรมีอัตราส่วนไม่เกิน <strong>1:8 สำหรับห้องเรียนกลุ่ม</strong> และ 1:1 สำหรับคลาสส่วนตัว ยิ่งน้อยยิ่งได้รับความใส่ใจมากขึ้น</li>\n  <li><strong>3. สัดส่วนนักเรียนชาติต่าง ๆ:</strong> หลายคนไม่รู้ว่านี่สำคัญมาก โรงเรียนที่มีนักเรียนเกาหลีหรือญี่ปุ่น 70–80% จะทำให้โอกาสฝึกภาษาอังกฤษนอกห้องเรียนน้อยลงมาก ควรเลือกโรงเรียนที่มีนักเรียนหลากหลายสัญชาติ</li>\n  <li><strong>4. ที่พักและสิ่งอำนวยความสะดวก:</strong> โรงเรียนส่วนใหญ่มีหอพักในรั้วโรงเรียน (Dormitory) ที่ค่าใช้จ่ายรวมอาหาร 3 มื้อ อยู่ที่ <strong>10,000–18,000 บาทต่อเดือน</strong> ตรวจสอบคุณภาพห้องนอน อินเทอร์เน็ต และห้องอาหารก่อนตัดสินใจ</li>\n  <li><strong>5. นโยบาย English Only Policy (EOP):</strong> โรงเรียนที่มีการบังคับใช้ EOP อย่างจริงจังจะช่วยให้คุณพัฒนาเร็วกว่าโรงเรียนที่ปล่อยผ่าน เพราะคุณถูกบังคับให้ใช้ภาษาอังกฤษตลอดเวลา แม้แต่ในช่วงอาหาร</li>\n</ul>\n\n<h2>งบประมาณที่ต้องเตรียมสำหรับการเรียนภาษาอังกฤษที่ฟิลิปปินส์</h2>\n<p>การวางแผนงบประมาณที่ดีจะช่วยให้คุณเลือกโรงเรียนได้ตรงกับความต้องการโดยไม่เกินกำลัง ตัวเลขด้านล่างนี้เป็นค่าเฉลี่ยในปี 2024–2025:</p>\n<ul>\n  <li><strong>ค่าเรียน:</strong> 12,000–25,000 บาทต่อเดือน ขึ้นกับโปรแกรมและโรงเรียน</li>\n  <li><strong>ค่าที่พักพร้อมอาหาร (ในโรงเรียน):</strong> 10,000–18,000 บาทต่อเดือน</li>\n  <li><strong>ค่าใช้จ่ายส่วนตัว (อินเทอร์เน็ต ของใช้ ท่องเที่ยว):</strong> 5,000–10,000 บาทต่อเดือน</li>\n  <li><strong>ค่าวีซ่าและค่าธรรมเนียม:</strong> ประมาณ 3,000–5,000 บาทต่อเดือน (Special Study Permit)</li>\n  <li><strong>ค่าตั๋วเครื่องบินไป-กลับ:</strong> 8,000–15,000 บาท ขึ้นกับช่วงเวลา</li>\n</ul>\n<p>รวมแล้วงบประมาณทั้งหมดสำหรับการเรียน <strong>1 เดือน</strong> อยู่ที่ประมาณ <strong>35,000–58,000 บาท</strong> และถ้าเรียน <strong>3 เดือน</strong> ซึ่งเป็นระยะเวลาที่นิยมมากที่สุด คาดว่าจะใช้งบรวมประมาณ <strong>90,000–150,000 บาท</strong> รวมทุกอย่างแล้ว</p>\n\n<h2>สัญญาณเตือนที่บอกว่าโรงเรียนนั้นไม่น่าเชื่อถือ</h2>\n<p>นอกจากจะรู้ว่าต้องดูอะไร ยังต้องรู้ด้วยว่าอะไรคือสัญญาณอันตราย (Red Flags) ที่บ่งบอกว่าโรงเรียนนั้นอาจไม่คุ้มค่า:</p>\n<ul>\n  <li>ไม่มีข้อมูลที่อยู่จริงหรือเบอร์โทรศัพท์ชัดเจน</li>\n  <li>ราคาถูกผิดปกติ เช่น ต่ำกว่า <strong>8,000 บาทต่อเดือน</strong> รวมทุกอย่าง ซึ่งไม่ใช่ราคาจริงในตลาด</li>\n  <li>ไม่มีรีวิวจากนักเรียนจริง หรือมีแต่รีวิวที่ดูเขียนขึ้นมาเอง</li>\n  <li>ไม่สามารถส่งเอกสาร I-20 หรือเอกสารสำหรับขอวีซ่าได้</li>\n  <li>ครูผู้สอนไม่มีคุณวุฒิด้านการสอนหรือภาษาอังกฤษโดยตรง</li>\n</ul>\n\n<h2>สรุป: เลือกโรงเรียนให้ตรงกับเป้าหมาย ไม่ใช่แค่ราคา</h2>\n<p>การเลือกโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ที่ดีที่สุดไม่ใช่การเลือกโรงเรียนที่ถูกที่สุดหรือแพงที่สุด แต่คือการเลือกโรงเรียนที่ <strong>ตอบโจทย์เป้าหมายของคุณมากที่สุด</strong> ไม่ว่าจะเป็นการสอบ IELTS, การพัฒนาทักษะการสื่อสาร หรือการเตรียมตัวทำงานในบริษัทข้ามชาติ ใช้เช็กลิสต์ 5 ข้อข้างต้นเป็นจุดเริ่มต้น และอย่าลืมคำนวณงบประมาณจริงก่อนตัดสินใจ</p>\n<p>หากคุณยังไม่แน่ใจว่าโรงเรียนไหนหรือโปรแกรมไหนเหมาะกับคุณที่สุด <strong>Philingo by Thai Study Abroad Consultant</strong> พร้อมให้คำปรึกษาฟรีโดยทีมที่มีประสบการณ์ด้านการศึกษาในฟิลิปปินส์โดยตรง ช่วยคุณวางแผนตั้งแต่เลือกโรงเรียน จัดการวีซ่า ไปจนถึงเตรียมตัวก่อนเดินทาง ติดต่อเราได้เลยวันนี้เพื่อไม่ให้พลาดโอกาสเรียนในราคาที่คุ้มค่าที่สุด</p>\n\nคำถามที่พบบ่อย (FAQ)\n\nQ: เรียนภาษาอังกฤษที่ฟิลิปปินส์ใช้งบเดือนละเท่าไหร่?\n\nA: ค่าใช้จ่ายรวมค่าเรียน ที่พัก อาหาร และค่าใช้จ่ายส่วนตัวอยู่ที่ประมาณ 35,000–58,000 บาทต่อเดือน ขึ้นอยู่กับเมืองและโปรแกรมที่เลือก โดยบาเกียวจะมีค่าครองชีพถูกที่สุด ส่วนมะนิลาแพงสุดในสามเมืองหลัก\n\nQ: ควรเรียนที่เซบูหรือบาเกียวดีกว่ากัน?\n\nA: ขึ้นอยู่กับไลฟ์สไตล์และเป้าหมาย หากต้องการบรรยากาศการเรียนที่เน้นจริงจัง อากาศเย็น และค่าใช้จ่ายน้อยกว่า บาเกียวเหมาะกว่า แต่ถ้าต้องการโรงเรียนให้เลือกหลากหลาย มีกิจกรรมและสถานที่ท่องเที่ยว เซบูตอบโจทย์มากกว่าด้วยโรงเรียนกว่า 80 แห่งให้เปรียบเทียบ\n\nQ: ต้องเรียนนานแค่ไหนถึงจะพูดภาษาอังกฤษได้คล่อง?\n\nA: สำหรับคนที่มีพื้นฐานระดับกลาง การเรียนแบบ Intensive 1-on-1 ที่ฟิลิปปินส์เป็นเวลา 8–12 สัปดาห์ มักเห็นผลลัพธ์ที่ชัดเจน แต่ถ้าต้องการพัฒนาจากระดับเริ่มต้นให้สื่อสารได้อย่างมั่นใจ แนะนำอย่างน้อย 3–4 เดือน เพราะสมองต้องการเวลาในการปรับตัวกับการคิดเป็นภาษาใหม่\n\nQ: โรงเรียนในฟิลิปปินส์มีวีซ่าให้หรือเปล่า?\n\nA: โรงเรียนที่ได้รับการรับรองจากรัฐบาลฟิลิปปินส์จะออกเอกสาร Special Study Permit (SSP) ให้กับนักเรียนต่างชาติ ซึ่งอนุญาตให้พำนักได้นานถึง 6 เดือนและต่ออายุได้ โดยค่าธรรมเนียมวีซ่าและ SSP รวมกันอยู่ที่ประมาณ 3,000–5,000 บาทต่อเดือน ทางโรงเรียนมักช่วยดำเนินการให้ทั้งหมด\n\nQ: ฟิลิปปินส์ปลอดภัยสำหรับนักเรียนไทยไหม?\n\nA: เมืองที่มีโรงเรียนภาษาอังกฤษหลักอย่างเซบู บาเกียว และมะนิลา (โดยเฉพาะย่าน BGC และ Makati) ถือว่าปลอดภัยสำหรับนักเรียนต่างชาติ โรงเรียนส่วนใหญ่มีหอพักในรั้วโรงเรียนพร้อมระบบรักษาความปลอดภัย 24 ชั่วโมง และมีกฎ English Only Policy ที่ช่วยสร้างสภาพแวดล้อมการเรียนที่มีระเบียบวินัย\n```	/api/storage/objects/uploads/f374c4f7-8b47-49e1-81e0-79185b5d1e7b	Tips & Guides	Philingo Team	ทีม Philingo	["Tips", "School Selection", "Philippines"]	เลือกโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ให้ปัง ครบทุกปัจจัย	เปรียบเทียบโรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ เซบู บาเกียว มะนิลา ค่าใช้จ่าย 35,000–70,000 บาท/เดือน พร้อมเช็กลิสต์เลือกโปรแกรมให้ตรงเป้าหมาย	0	t	t	2024-03-15 00:00:00	2026-07-28 05:53:14.688377	2026-08-06 16:06:34.123	โรงเรียนสอนภาษาอังกฤษฟิลิปปินส์, เรียนภาษาอังกฤษที่ฟิลิปปินส์, เรียนภาษาอังกฤษเซบู, เรียนภาษาอังกฤษบาเกียว, เรียนภาษาอังกฤษมะนิลา, ค่าเรียนภาษาอังกฤษฟิลิปปินส์, เรียนภาษาอังกฤษต่างประเทศ, เรียนภาษาอังกฤษราคาถูก, เรียนต่อฟิลิปปินส์, IELTS ฟิลิปปินส์, TOEIC ฟิลิปปินส์, คนไทยเรียนภาษาอังกฤษฟิลิปปินส์
\.


--
-- TOC entry 3688 (class 0 OID 16585)
-- Dependencies: 238
-- Data for Name: contact_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.contact_submissions (id, name, email, phone, subject, message, utm_source, utm_medium, utm_campaign, ip_address, status, admin_notes, created_at) FROM stdin;
1	ทดสอบระบบ	philingoedu@gmail.com	061-656-4159	ทดสอบระบบอีเมล auto	ระบบส่งอีเมลอัตโนมัติทำงานได้ปกติ	\N	\N	\N	127.0.0.1	new	\N	2026-07-31 07:27:44.685375
2	ทดสอบระบบ	info@thaistudyabroad.com	061-656-4159	ทดสอบระบบอีเมล auto	ระบบส่งอีเมลอัตโนมัติทำงานได้ปกติ	\N	\N	\N	127.0.0.1	new	\N	2026-07-31 07:28:44.201767
3	ทดสอบ สมหญิง	info@thaistudyabroad.com	082-111-2222	สอบถามเรื่องหลักสูตร IELTS	สนใจเรียน IELTS ที่ CIA ระยะเวลา 3 เดือน งบประมาณ 80,000 บาท	\N	\N	\N	127.0.0.1	new	\N	2026-07-31 07:41:40.426833
4	สมชาย ใจดี	info@thaistudyabroad.com	081-234-5678	ขอใบเสนอราคา (Quotation)	LINE ID: @somchai_test\nสนใจ CIA 3 เดือน งบ 80,000 บาท	\N	\N	\N	127.0.0.1	new	\N	2026-07-31 07:46:22.094216
5	RegrTest		08000	\N	\N	\N	\N	\N	127.0.0.1	new	\N	2026-07-31 08:01:22.257066
\.


--
-- TOC entry 3670 (class 0 OID 16456)
-- Dependencies: 220
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.courses (id, slug, title, title_th, subtitle, subtitle_th, icon_name, description, description_th, duration, duration_th, suitable_for, suitable_for_th, price_display, price_display_th, color_class, badge, badge_th, features, is_featured, is_active, sort_order, created_at, updated_at, school_slug, timetable_config, meta_title, meta_description, hero_banner_url, curriculum_details) FROM stdin;
1	general-english	General English (ESL)	ภาษาอังกฤษทั่วไป	\N	\N	BookOpen	\N	\N	4-24 สัปดาห์	\N	\N	\N	เริ่มต้น 35,000 บาท/เดือน	\N	bg-blue-100 text-blue-600	\N	\N	[]	f	t	1	2026-07-28 05:50:56.813329	2026-07-28 05:50:56.813329	\N	\N	\N	\N	\N	null
2	ielts-preparation	IELTS Preparation	เตรียมสอบ IELTS	\N	\N	GraduationCap	\N	\N	8-12 สัปดาห์	\N	\N	\N	เริ่มต้น 42,000 บาท/เดือน	\N	bg-red-100 text-red-600	\N	\N	[]	f	t	2	2026-07-28 05:50:56.821047	2026-07-28 05:50:56.821047	\N	\N	\N	\N	\N	null
3	toeic-preparation	TOEIC Preparation	เตรียมสอบ TOEIC	\N	\N	GraduationCap	\N	\N	4-12 สัปดาห์	\N	\N	\N	เริ่มต้น 38,000 บาท/เดือน	\N	bg-orange-100 text-orange-600	\N	\N	[]	f	t	3	2026-07-28 05:50:56.826028	2026-07-28 05:50:56.826028	\N	\N	\N	\N	\N	null
4	business-english	Business English	ภาษาอังกฤษเพื่อธุรกิจ	\N	\N	Briefcase	\N	\N	4-8 สัปดาห์	\N	\N	\N	เริ่มต้น 45,000 บาท/เดือน	\N	bg-purple-100 text-purple-600	\N	\N	[]	f	t	4	2026-07-28 05:50:56.831962	2026-07-28 05:50:56.831962	\N	\N	\N	\N	\N	null
5	junior-camp	Junior Camp	แคมป์เยาวชน (ปิดเทอม)	\N	\N	Baby	\N	\N	3-4 สัปดาห์	\N	\N	\N	เริ่มต้น 65,000 บาท/โปรแกรม	\N	bg-green-100 text-green-600	\N	\N	[]	f	t	5	2026-07-28 05:50:56.839414	2026-07-28 05:50:56.839414	\N	\N	\N	\N	\N	null
6	family-program	Family Program	หลักสูตรครอบครัว	\N	\N	Users	\N	\N	4-12 สัปดาห์	\N	\N	\N	เริ่มต้น 80,000 บาท/ครอบครัว/เดือน	\N	bg-pink-100 text-pink-600	\N	\N	[]	f	t	6	2026-07-28 05:50:56.845262	2026-07-28 05:50:56.845262	\N	\N	\N	\N	\N	null
7	online-english	Online English	เรียนภาษาออนไลน์	\N	\N	Monitor	\N	\N	ตามต้องการ	\N	\N	\N	เริ่มต้น 250 บาท/คลาส	\N	bg-sky-100 text-sky-600	\N	\N	[]	f	t	7	2026-07-28 05:50:56.850369	2026-07-28 05:50:56.850369	\N	\N	\N	\N	\N	null
8	university-pathway	University Pathway	เรียนต่อมหาวิทยาลัย	\N	\N	Map	\N	\N	12-24 สัปดาห์	\N	\N	\N	เริ่มต้น 45,000 บาท/เดือน	\N	bg-yellow-100 text-yellow-600	\N	\N	[]	f	t	8	2026-07-28 05:50:56.856087	2026-07-28 05:50:56.856087	\N	\N	\N	\N	\N	null
9	ielts-guarantee	IELTS Score Guarantee	IELTS Guarantee	\N	\N	Shield	\N	\N	12-24 สัปดาห์	\N	\N	\N	เริ่มต้น 95,000 บาท	\N	bg-emerald-100 text-emerald-700	การันตีคะแนน!	\N	[]	f	t	9	2026-07-28 05:50:56.862448	2026-07-28 05:50:56.862448	\N	\N	\N	\N	\N	null
10	online-business-english	Online Business English	Online Business English	\N	\N	Laptop	\N	\N	4-12 สัปดาห์ (ออนไลน์)	\N	\N	\N	เริ่มต้น 350 บาท/คลาส	\N	bg-violet-100 text-violet-700	\N	\N	[]	f	t	10	2026-07-28 05:50:56.866528	2026-07-28 05:50:56.866528	\N	\N	\N	\N	\N	null
11	callan-method	Callan Intensive Speaking	Callan Method	\N	\N	Globe2	\N	\N	4-16 สัปดาห์	\N	\N	\N	เริ่มต้น 32,000 บาท/เดือน	\N	bg-cyan-100 text-cyan-700	\N	\N	[]	f	t	11	2026-07-28 05:50:56.871442	2026-07-28 05:50:56.871442	\N	\N	\N	\N	\N	null
12	sparta-intensive	Intensive Sparta Program	Intensive Sparta	\N	\N	Clock	\N	\N	4-24 สัปดาห์	\N	\N	\N	เริ่มต้น 38,000 บาท/เดือน	\N	bg-red-100 text-red-700	\N	\N	[]	f	t	12	2026-07-28 05:50:56.876041	2026-07-28 05:50:56.876041	\N	\N	\N	\N	\N	null
17	conversation-english	Conversation English	ภาษาอังกฤษสนทนา	Speak English confidently in any situation	พูดภาษาอังกฤษได้อย่างมั่นใจในทุกสถานการณ์	MessageSquare	Focus on speaking and conversational English with native-style teachers for real-world communication.	เน้นการพูดและการสนทนาภาษาอังกฤษกับครูสไตล์เจ้าของภาษาเพื่อการสื่อสารในชีวิตจริง	4-12 weeks	4-12 สัปดาห์	Anyone wanting to improve speaking confidence	ทุกคนที่ต้องการพัฒนาความมั่นใจในการพูด	from $680/4 weeks	เริ่มต้น ฿24,000/4 สัปดาห์	bg-pink-500	Speaking Focus	เน้นการพูด	["Daily Conversation Practice", "Pronunciation Coaching", "Role-Playing", "Discussion Groups"]	f	t	5	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
18	kids-english	Kids' English Program	โปรแกรมภาษาอังกฤษสำหรับเด็ก	Fun and effective English for children	ภาษาอังกฤษที่สนุกและมีประสิทธิภาพสำหรับเด็ก	Star	Special English program designed for children aged 6-15 with fun activities and structured learning.	โปรแกรมภาษาอังกฤษพิเศษที่ออกแบบมาสำหรับเด็กอายุ 6-15 ปี พร้อมกิจกรรมสนุกสนานและการเรียนรู้ที่มีโครงสร้าง	4-12 weeks	4-12 สัปดาห์	Children aged 6-15 years	เด็กอายุ 6-15 ปี	from $600/4 weeks	เริ่มต้น ฿21,000/4 สัปดาห์	bg-yellow-500	Kid's Special	สำหรับเด็กโดยเฉพาะ	["Fun Learning Activities", "Storytelling", "Games & Songs", "Safe Environment"]	f	t	6	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
19	academic-english	Academic English	ภาษาอังกฤษเชิงวิชาการ	English for university and academic purposes	ภาษาอังกฤษสำหรับมหาวิทยาลัยและวัตถุประสงค์ทางวิชาการ	GraduationCap	Academic English program for students planning to attend English-speaking universities.	โปรแกรมภาษาอังกฤษเชิงวิชาการสำหรับนักเรียนที่วางแผนจะเข้าเรียนที่มหาวิทยาลัยที่ใช้ภาษาอังกฤษ	8-24 weeks	8-24 สัปดาห์	University-bound students	นักเรียนที่วางแผนเข้าศึกษามหาวิทยาลัย	from $850/4 weeks	เริ่มต้น ฿30,000/4 สัปดาห์	bg-violet-500	Academic	วิชาการ	["Essay Writing", "Research Skills", "Academic Vocabulary", "Presentation Skills"]	f	t	7	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
20	toefl-preparation	TOEFL Preparation	เตรียมสอบ TOEFL	Master the TOEFL for US university admission	เชี่ยวชาญ TOEFL เพื่อเข้าศึกษามหาวิทยาลัยในสหรัฐฯ	Award	Comprehensive TOEFL preparation covering all sections: Reading, Listening, Speaking, and Writing.	การเตรียมสอบ TOEFL อย่างครอบคลุมครอบคลุมทุกส่วน: การอ่าน การฟัง การพูด และการเขียน	4-16 weeks	4-16 สัปดาห์	Students applying to US and Canadian universities	นักเรียนที่สมัครเข้ามหาวิทยาลัยในสหรัฐฯ และแคนาดา	from $920/4 weeks	เริ่มต้น ฿33,000/4 สัปดาห์	bg-cyan-500	US University	มหาวิทยาลัยในสหรัฐฯ	["TOEFL Mock Tests", "All 4 Sections", "Score Improvement", "Online Practice"]	f	t	8	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
21	volunteer-english	Volunteer + English Program	โปรแกรมอาสาสมัคร + ภาษาอังกฤษ	Learn English while giving back to the community	เรียนภาษาอังกฤษไปพร้อมกับตอบแทนสังคม	Heart	Unique program combining English classes with community volunteer work in the Philippines.	โปรแกรมสุดพิเศษที่รวมเรียนภาษาอังกฤษกับงานอาสาสมัครชุมชนในฟิลิปปินส์	4-12 weeks	4-12 สัปดาห์	Social-minded learners aged 18+	ผู้เรียนที่มีจิตสาธารณะอายุ 18 ปีขึ้นไป	from $750/4 weeks	เริ่มต้น ฿26,500/4 สัปดาห์	bg-rose-500	Unique Experience	ประสบการณ์ไม่เหมือนใคร	["English Classes", "Volunteer Work", "Cultural Exchange", "Community Impact"]	f	t	9	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
22	intensive-english	Intensive English Program	โปรแกรมภาษาอังกฤษเข้มข้น	Maximum improvement in minimum time	พัฒนาสูงสุดในเวลาน้อยที่สุด	Zap	Our most intensive program with 8+ hours of English study per day for rapid improvement.	โปรแกรมที่เข้มข้นที่สุดของเรา พร้อมการเรียนภาษาอังกฤษมากกว่า 8 ชั่วโมงต่อวันเพื่อพัฒนาอย่างรวดเร็ว	4-24 weeks	4-24 สัปดาห์	Motivated learners with limited time	ผู้เรียนที่มีแรงจูงใจสูงและมีเวลาจำกัด	from $950/4 weeks	เริ่มต้น ฿34,000/4 สัปดาห์	bg-red-500	Fast Track	เร่งรัด	["8+ Hours Daily", "One-on-One & Group", "Rapid Progress", "Immersion Environment"]	t	t	10	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
23	eap	English for Academic Purposes (EAP)	ภาษาอังกฤษเพื่อวัตถุประสงค์ทางวิชาการ (EAP)	Specialized English for academic success	ภาษาอังกฤษเฉพาะทางเพื่อความสำเร็จทางวิชาการ	FileText	EAP is designed for students who need English skills for academic study in English-speaking environments.	EAP ออกแบบมาสำหรับนักเรียนที่ต้องการทักษะภาษาอังกฤษสำหรับการศึกษาในสภาพแวดล้อมที่ใช้ภาษาอังกฤษ	8-24 weeks	8-24 สัปดาห์	Graduate and postgraduate students	นักศึกษาระดับบัณฑิตศึกษาและหลังปริญญา	from $880/4 weeks	เริ่มต้น ฿31,500/4 สัปดาห์	bg-slate-500	Academic	วิชาการ	["Academic Writing", "Critical Thinking", "Research Skills", "Thesis Writing"]	f	t	11	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
24	english-plus-internship	English + Internship	ภาษาอังกฤษ + ฝึกงาน	Learn English and gain work experience	เรียนภาษาอังกฤษและได้รับประสบการณ์ทำงาน	Building	Combine English language learning with a real internship placement in the Philippines.	ผสมผสานการเรียนภาษาอังกฤษกับการฝึกงานจริงในฟิลิปปินส์	12-24 weeks	12-24 สัปดาห์	Young professionals aged 18-30	มืออาชีพรุ่นใหม่อายุ 18-30 ปี	from $1,200/12 weeks	เริ่มต้น ฿43,000/12 สัปดาห์	bg-teal-500	Work Experience	ประสบการณ์ทำงาน	["English Classes", "Internship Placement", "Work Permit Support", "Career Mentoring"]	f	t	12	2026-07-28 05:53:14.660816	2026-07-28 05:53:14.660816	\N	\N	\N	\N	\N	null
\.


--
-- TOC entry 3703 (class 0 OID 16676)
-- Dependencies: 253
-- Data for Name: event_registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_registrations (id, event_id, name, email, phone, line_id, note, email_sent, registered_at) FROM stdin;
\.


--
-- TOC entry 3701 (class 0 OID 16661)
-- Dependencies: 251
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, title_th, title, description_th, description, event_date, event_time, venue_th, venue, meet_url, image_url, event_type, cta_text_th, cta_url, seats_total, seats_remaining, is_featured, is_active, sort_order, created_at, updated_at) FROM stdin;
1	งานสัมมนาเรียนต่อฟิลิปปินส์ ออนไลน์ 2026	Philingo Cebu Online Education Fair 2026	พบกับตัวแทน 7 สถาบันชั้นนำในเซบู เปรียบเทียบหลักสูตร ค่าใช้จ่าย และสิทธิพิเศษเฉพาะผู้เข้าร่วมงาน! · รอบเช้า 10:00–11:00 น. · รอบบ่าย 14:00–15:00 น. · ผ่าน Google Meet	Meet representatives from 7 leading Cebu English schools online. Morning round 10:00–11:00 · Afternoon round 14:00–15:00 · via Google Meet. Free registration, exclusive promotions for attendees.	2026-08-29	รอบเช้า 10:00–11:00 น. / รอบบ่าย 14:00–15:00 น. (เวลาไทย)	ออนไลน์ผ่าน Google Meet (29 ส.ค. – 12 ก.ย. 2569)	Online via Google Meet (29 Aug – 12 Sep 2026)		/api/storage/objects/uploads/ecef0246-a0b6-4e20-9fda-6b00e99ae43c	online	🎟️ ลงทะเบียนเข้าร่วมงานฟรี	register free	500	500	t	t	1	2026-07-30 06:09:02.942161	2026-08-06 14:55:13.405
\.


--
-- TOC entry 3674 (class 0 OID 16490)
-- Dependencies: 224
-- Data for Name: faqs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faqs (id, question, question_th, answer, answer_th, category, is_active, sort_order, created_at, updated_at) FROM stdin;
1	Do I need visa to study in Philippines?	ต้องทำวีซ่าเพื่อไปเรียนที่ฟิลิปปินส์ไหม?	Thai citizens can enter Philippines visa-free for up to 30 days. For longer stays, we help arrange a Student Visa (SSP).	คนไทยไม่ต้องทำวีซ่าเพื่อเข้าฟิลิปปินส์ได้นานถึง 30 วัน หากเรียนนานกว่านั้น Philingo จะช่วยจัดการ Student Visa (SSP) ให้	วีซ่า	t	1	2026-07-28 05:50:56.882557	2026-07-28 05:50:56.882557
2	What is the cost of living in Philippines?	ค่าครองชีพที่ฟิลิปปินส์เป็นอย่างไร?	Living costs are lower than Thailand. Food, transportation, and entertainment are affordable.	ค่าครองชีพที่ฟิลิปปินส์โดยรวมถูกกว่าไทย ค่าอาหาร ค่าเดินทาง และค่าบันเทิงราคาย่อมเยา	ทั่วไป	t	2	2026-07-28 05:50:56.888141	2026-07-28 05:50:56.888141
3	Is Philippines safe for Thai students?	ฟิลิปปินส์ปลอดภัยสำหรับนักเรียนไทยไหม?	Yes, major study destinations like Cebu and Baguio are safe tourist cities with many Thai students.	ปลอดภัยครับ เมืองเซบูและบาเกียวที่นักเรียนไทยนิยมไปเรียนเป็นเมืองท่องเที่ยวที่ปลอดภัยและมีนักเรียนไทยจำนวนมาก	ความปลอดภัย	t	3	2026-07-28 05:50:56.894492	2026-07-28 05:50:56.894492
4	How long should I study?	ควรเรียนนานเท่าไหร่?	4-8 weeks for basic improvement, 12+ weeks for significant IELTS/TOEIC score gains. We recommend 3 months minimum.	หากต้องการพัฒนาพื้นฐาน 4-8 สัปดาห์ก็เพียงพอ แต่ถ้าต้องการคะแนน IELTS/TOEIC ที่ชัดเจน แนะนำ 12 สัปดาห์ขึ้นไป	หลักสูตร	t	4	2026-07-28 05:50:56.898713	2026-07-28 05:50:56.898713
5	What is included in the package price?	ราคาแพ็กเกจรวมอะไรบ้าง?	Packages typically include: tuition, dormitory, 3 meals/day, airport transfer, and orientation.	แพ็กเกจโดยทั่วไปรวม: ค่าเรียน ที่พัก อาหาร 3 มื้อ รถรับส่งสนามบิน และปฐมนิเทศ	ราคา	t	5	2026-07-28 05:50:56.905418	2026-07-28 05:50:56.905418
6	Can I work part-time while studying?	เรียนไปทำงาน Part-time ได้ไหม?	No, student visa does not allow part-time work in Philippines.	ไม่ได้ครับ วีซ่านักเรียนไม่อนุญาตให้ทำงาน Part-time ที่ฟิลิปปินส์	ทั่วไป	t	6	2026-07-28 05:50:56.909719	2026-07-28 05:50:56.909719
7	How do I apply?	สมัครเรียนอย่างไร?	Contact Philingo via LINE or fill the Apply form on our website. We'll guide you through the entire process.	ติดต่อ Philingo ผ่าน LINE หรือกรอกแบบฟอร์มสมัครบนเว็บไซต์ เราจะดูแลทุกขั้นตอนให้ครบ	การสมัคร	t	7	2026-07-28 05:50:56.919798	2026-07-28 05:50:56.919798
8	Do you help with accommodation?	ช่วยเรื่องที่พักด้วยไหม?	Yes, all partner schools have on-campus dormitories. We also assist with off-campus options.	ใช่ครับ โรงเรียนพาร์ทเนอร์ทุกแห่งมีหอพักในโรงเรียน เราช่วยจัดการที่พักนอกโรงเรียนได้เช่นกัน	ที่พัก	t	8	2026-07-28 05:50:56.925714	2026-07-28 05:50:56.925714
9	Why study English in the Philippines?	ทำไมต้องเรียนภาษาอังกฤษในฟิลิปปินส์?	The Philippines offers affordable English education with native-level English speakers, modern facilities, and a welcoming culture. It's one of the most cost-effective destinations in Asia for English study.	ฟิลิปปินส์มีการศึกษาภาษาอังกฤษที่ราคาไม่แพงพร้อมผู้พูดภาษาอังกฤษระดับเจ้าของภาษา สิ่งอำนวยความสะดวกทันสมัย และวัฒนธรรมที่เป็นมิตร เป็นหนึ่งในจุดหมายปลายทางที่คุ้มค่าที่สุดในเอเชียสำหรับการเรียนภาษาอังกฤษ	General	t	1	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
10	What is the average cost of studying English in the Philippines?	ค่าใช้จ่ายเฉลี่ยในการเรียนภาษาอังกฤษในฟิลิปปินส์เท่าไหร่?	The average cost ranges from $600-$1,200 per month including accommodation, meals, and tuition. This is significantly more affordable compared to studying in English-speaking countries like the US, UK, or Australia.	ค่าใช้จ่ายเฉลี่ยอยู่ที่ประมาณ 21,000-43,000 บาทต่อเดือน รวมค่าที่พัก ค่าอาหาร และค่าเล่าเรียน ซึ่งราคาไม่แพงกว่าการเรียนในประเทศที่ใช้ภาษาอังกฤษอย่างสหรัฐฯ อังกฤษ หรือออสเตรเลียอย่างมาก	Costs	t	2	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
11	Do I need a visa to study in the Philippines?	ฉันต้องมีวีซ่าเพื่อเรียนในฟิลิปปินส์ไหม?	Thai citizens can enter the Philippines without a visa for up to 30 days. For longer stays, you can extend your stay at the Bureau of Immigration. Schools often assist with visa extensions.	คนไทยสามารถเข้าฟิลิปปินส์ได้โดยไม่ต้องมีวีซ่าสูงสุด 30 วัน สำหรับการพักนานขึ้น คุณสามารถต่อระยะเวลาพักได้ที่สำนักงานตรวจคนเข้าเมือง โรงเรียนมักช่วยเรื่องการต่อวีซ่า	Visa	t	3	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
22	How long should I study?	ควรเรียนนานเท่าไหร่?	4-8 weeks for basic improvement, 12+ weeks for significant IELTS/TOEIC score gains. We recommend 3 months minimum.	หากต้องการพัฒนาพื้นฐาน 4-8 สัปดาห์ก็เพียงพอ แต่ถ้าต้องการคะแนน IELTS/TOEIC ที่ชัดเจน แนะนำ 12 สัปดาห์ขึ้นไป	หลักสูตร	t	4	2026-07-29 16:02:24.973809	2026-07-29 16:02:24.973809
12	What is the minimum age to study at these schools?	อายุขั้นต่ำในการเรียนที่โรงเรียนเหล่านี้คือเท่าไหร่?	Most schools accept students aged 16 and above for adult programs. Some schools have special programs for children aged 6-15. Please check each school's specific requirements.	โรงเรียนส่วนใหญ่รับนักเรียนอายุ 16 ปีขึ้นไปสำหรับโปรแกรมผู้ใหญ่ บางโรงเรียนมีโปรแกรมพิเศษสำหรับเด็กอายุ 6-15 ปี กรุณาตรวจสอบข้อกำหนดเฉพาะของแต่ละโรงเรียน	Eligibility	t	4	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
13	What is the best time to study English in the Philippines?	ช่วงเวลาที่ดีที่สุดในการเรียนภาษาอังกฤษในฟิลิปปินส์คือเมื่อไหร่?	The Philippines is a year-round destination. The dry season (November to May) is generally the most popular time. The rainy season (June to October) can be great for lower prices and fewer students.	ฟิลิปปินส์เป็นจุดหมายตลอดทั้งปี ฤดูแล้ง (พฤศจิกายนถึงพฤษภาคม) มักเป็นช่วงที่ได้รับความนิยมมากที่สุด ฤดูฝน (มิถุนายนถึงตุลาคม) อาจเป็นช่วงที่ดีสำหรับราคาที่ต่ำกว่าและนักเรียนน้อยกว่า	General	t	5	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
14	What level of English do I need to start?	ฉันต้องมีระดับภาษาอังกฤษเท่าไหร่จึงจะเริ่มเรียนได้?	Most schools accept complete beginners. You will take a placement test on arrival to determine your current level, and you will be placed in the appropriate class.	โรงเรียนส่วนใหญ่รับผู้เริ่มต้นอย่างสมบูรณ์ คุณจะทำแบบทดสอบการจัดระดับเมื่อมาถึงเพื่อกำหนดระดับปัจจุบันของคุณ และคุณจะถูกจัดในชั้นเรียนที่เหมาะสม	Eligibility	t	6	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
15	Can I work while studying in the Philippines?	ฉันสามารถทำงานขณะเรียนในฟิลิปปินส์ได้ไหม?	Student visa holders are generally not permitted to work in the Philippines. We recommend focusing on your studies during your time there.	ผู้ถือวีซ่านักเรียนโดยทั่วไปไม่ได้รับอนุญาตให้ทำงานในฟิลิปปินส์ เราแนะนำให้มุ่งเน้นการเรียนระหว่างที่อยู่ที่นั่น	Visa	t	7	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
16	Does Philingo provide airport pickup?	Philingo มีบริการรับส่งสนามบินไหม?	Yes, we can arrange airport pickup for you through the school. This service usually costs $10-20 and can be arranged when you book your program.	ใช่ เราสามารถจัดเตรียมบริการรับส่งสนามบินให้คุณผ่านทางโรงเรียน บริการนี้มักจะมีค่าใช้จ่ายประมาณ 350-700 บาท และสามารถจัดเตรียมได้เมื่อคุณจองโปรแกรม	Services	t	8	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
17	What happens if I am not happy with my school?	จะเกิดอะไรขึ้นถ้าฉันไม่พอใจกับโรงเรียนของฉัน?	We provide ongoing support throughout your stay. If you have issues with your school, contact your Philingo advisor and we will help mediate or find alternative solutions.	เราให้การสนับสนุนอย่างต่อเนื่องตลอดการพักของคุณ หากคุณมีปัญหากับโรงเรียน ติดต่อที่ปรึกษา Philingo ของคุณ และเราจะช่วยไกล่เกลี่ยหรือหาทางเลือกอื่น	Services	t	9	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
18	How do I apply for a school through Philingo?	ฉันสมัครเข้าโรงเรียนผ่าน Philingo ได้อย่างไร?	Simply fill out our application form on the website or contact us via Line or Facebook. Our advisors will guide you through the entire process including school selection, enrollment, visa, and accommodation.	เพียงกรอกแบบฟอร์มใบสมัครบนเว็บไซต์หรือติดต่อเราผ่าน Line หรือ Facebook ที่ปรึกษาของเราจะแนะนำคุณตลอดกระบวนการทั้งหมดรวมถึงการเลือกโรงเรียน การลงทะเบียน วีซ่า และที่พัก	Application	t	10	2026-07-28 05:53:14.699266	2026-07-28 05:53:14.699266
19	Do I need visa to study in Philippines?	ต้องทำวีซ่าเพื่อไปเรียนที่ฟิลิปปินส์ไหม?	Thai citizens can enter Philippines visa-free for up to 30 days. For longer stays, we help arrange a Student Visa (SSP).	คนไทยไม่ต้องทำวีซ่าเพื่อเข้าฟิลิปปินส์ได้นานถึง 30 วัน หากเรียนนานกว่านั้น Philingo จะช่วยจัดการ Student Visa (SSP) ให้	วีซ่า	t	1	2026-07-29 16:02:24.961948	2026-07-29 16:02:24.961948
20	What is the cost of living in Philippines?	ค่าครองชีพที่ฟิลิปปินส์เป็นอย่างไร?	Living costs are lower than Thailand. Food, transportation, and entertainment are affordable.	ค่าครองชีพที่ฟิลิปปินส์โดยรวมถูกกว่าไทย ค่าอาหาร ค่าเดินทาง และค่าบันเทิงราคาย่อมเยา	ทั่วไป	t	2	2026-07-29 16:02:24.96833	2026-07-29 16:02:24.96833
21	Is Philippines safe for Thai students?	ฟิลิปปินส์ปลอดภัยสำหรับนักเรียนไทยไหม?	Yes, major study destinations like Cebu and Baguio are safe tourist cities with many Thai students.	ปลอดภัยครับ เมืองเซบูและบาเกียวที่นักเรียนไทยนิยมไปเรียนเป็นเมืองท่องเที่ยวที่ปลอดภัยและมีนักเรียนไทยจำนวนมาก	ความปลอดภัย	t	3	2026-07-29 16:02:24.971339	2026-07-29 16:02:24.971339
23	What is included in the package price?	ราคาแพ็กเกจรวมอะไรบ้าง?	Packages typically include: tuition, dormitory, 3 meals/day, airport transfer, and orientation.	แพ็กเกจโดยทั่วไปรวม: ค่าเรียน ที่พัก อาหาร 3 มื้อ รถรับส่งสนามบิน และปฐมนิเทศ	ราคา	t	5	2026-07-29 16:02:24.976514	2026-07-29 16:02:24.976514
24	Can I work part-time while studying?	เรียนไปทำงาน Part-time ได้ไหม?	No, student visa does not allow part-time work in Philippines.	ไม่ได้ครับ วีซ่านักเรียนไม่อนุญาตให้ทำงาน Part-time ที่ฟิลิปปินส์	ทั่วไป	t	6	2026-07-29 16:02:24.979284	2026-07-29 16:02:24.979284
25	How do I apply?	สมัครเรียนอย่างไร?	Contact Philingo via LINE or fill the Apply form on our website. We'll guide you through the entire process.	ติดต่อ Philingo ผ่าน LINE หรือกรอกแบบฟอร์มสมัครบนเว็บไซต์ เราจะดูแลทุกขั้นตอนให้ครบ	การสมัคร	t	7	2026-07-29 16:02:24.983252	2026-07-29 16:02:24.983252
26	Do you help with accommodation?	ช่วยเรื่องที่พักด้วยไหม?	Yes, all partner schools have on-campus dormitories. We also assist with off-campus options.	ใช่ครับ โรงเรียนพาร์ทเนอร์ทุกแห่งมีหอพักในโรงเรียน เราช่วยจัดการที่พักนอกโรงเรียนได้เช่นกัน	ที่พัก	t	8	2026-07-29 16:02:24.985884	2026-07-29 16:02:24.985884
27	Do I need visa to study in Philippines?	ต้องทำวีซ่าเพื่อไปเรียนที่ฟิลิปปินส์ไหม?	Thai citizens can enter Philippines visa-free for up to 30 days. For longer stays, we help arrange a Student Visa (SSP).	คนไทยไม่ต้องทำวีซ่าเพื่อเข้าฟิลิปปินส์ได้นานถึง 30 วัน หากเรียนนานกว่านั้น Philingo จะช่วยจัดการ Student Visa (SSP) ให้	วีซ่า	t	1	2026-07-29 16:15:10.468438	2026-07-29 16:15:10.468438
28	What is the cost of living in Philippines?	ค่าครองชีพที่ฟิลิปปินส์เป็นอย่างไร?	Living costs are lower than Thailand. Food, transportation, and entertainment are affordable.	ค่าครองชีพที่ฟิลิปปินส์โดยรวมถูกกว่าไทย ค่าอาหาร ค่าเดินทาง และค่าบันเทิงราคาย่อมเยา	ทั่วไป	t	2	2026-07-29 16:15:10.471642	2026-07-29 16:15:10.471642
29	Is Philippines safe for Thai students?	ฟิลิปปินส์ปลอดภัยสำหรับนักเรียนไทยไหม?	Yes, major study destinations like Cebu and Baguio are safe tourist cities with many Thai students.	ปลอดภัยครับ เมืองเซบูและบาเกียวที่นักเรียนไทยนิยมไปเรียนเป็นเมืองท่องเที่ยวที่ปลอดภัยและมีนักเรียนไทยจำนวนมาก	ความปลอดภัย	t	3	2026-07-29 16:15:10.47516	2026-07-29 16:15:10.47516
30	How long should I study?	ควรเรียนนานเท่าไหร่?	4-8 weeks for basic improvement, 12+ weeks for significant IELTS/TOEIC score gains. We recommend 3 months minimum.	หากต้องการพัฒนาพื้นฐาน 4-8 สัปดาห์ก็เพียงพอ แต่ถ้าต้องการคะแนน IELTS/TOEIC ที่ชัดเจน แนะนำ 12 สัปดาห์ขึ้นไป	หลักสูตร	t	4	2026-07-29 16:15:10.478189	2026-07-29 16:15:10.478189
31	What is included in the package price?	ราคาแพ็กเกจรวมอะไรบ้าง?	Packages typically include: tuition, dormitory, 3 meals/day, airport transfer, and orientation.	แพ็กเกจโดยทั่วไปรวม: ค่าเรียน ที่พัก อาหาร 3 มื้อ รถรับส่งสนามบิน และปฐมนิเทศ	ราคา	t	5	2026-07-29 16:15:10.481764	2026-07-29 16:15:10.481764
32	Can I work part-time while studying?	เรียนไปทำงาน Part-time ได้ไหม?	No, student visa does not allow part-time work in Philippines.	ไม่ได้ครับ วีซ่านักเรียนไม่อนุญาตให้ทำงาน Part-time ที่ฟิลิปปินส์	ทั่วไป	t	6	2026-07-29 16:15:10.485045	2026-07-29 16:15:10.485045
33	How do I apply?	สมัครเรียนอย่างไร?	Contact Philingo via LINE or fill the Apply form on our website. We'll guide you through the entire process.	ติดต่อ Philingo ผ่าน LINE หรือกรอกแบบฟอร์มสมัครบนเว็บไซต์ เราจะดูแลทุกขั้นตอนให้ครบ	การสมัคร	t	7	2026-07-29 16:15:10.490925	2026-07-29 16:15:10.490925
34	Do you help with accommodation?	ช่วยเรื่องที่พักด้วยไหม?	Yes, all partner schools have on-campus dormitories. We also assist with off-campus options.	ใช่ครับ โรงเรียนพาร์ทเนอร์ทุกแห่งมีหอพักในโรงเรียน เราช่วยจัดการที่พักนอกโรงเรียนได้เช่นกัน	ที่พัก	t	8	2026-07-29 16:15:10.494659	2026-07-29 16:15:10.494659
35	Do I need visa to study in Philippines?	ต้องทำวีซ่าเพื่อไปเรียนที่ฟิลิปปินส์ไหม?	Thai citizens can enter Philippines visa-free for up to 30 days. For longer stays, we help arrange a Student Visa (SSP).	คนไทยไม่ต้องทำวีซ่าเพื่อเข้าฟิลิปปินส์ได้นานถึง 30 วัน หากเรียนนานกว่านั้น Philingo จะช่วยจัดการ Student Visa (SSP) ให้	วีซ่า	t	1	2026-07-29 16:25:34.277965	2026-07-29 16:25:34.277965
36	What is the cost of living in Philippines?	ค่าครองชีพที่ฟิลิปปินส์เป็นอย่างไร?	Living costs are lower than Thailand. Food, transportation, and entertainment are affordable.	ค่าครองชีพที่ฟิลิปปินส์โดยรวมถูกกว่าไทย ค่าอาหาร ค่าเดินทาง และค่าบันเทิงราคาย่อมเยา	ทั่วไป	t	2	2026-07-29 16:25:34.281489	2026-07-29 16:25:34.281489
37	Is Philippines safe for Thai students?	ฟิลิปปินส์ปลอดภัยสำหรับนักเรียนไทยไหม?	Yes, major study destinations like Cebu and Baguio are safe tourist cities with many Thai students.	ปลอดภัยครับ เมืองเซบูและบาเกียวที่นักเรียนไทยนิยมไปเรียนเป็นเมืองท่องเที่ยวที่ปลอดภัยและมีนักเรียนไทยจำนวนมาก	ความปลอดภัย	t	3	2026-07-29 16:25:34.283567	2026-07-29 16:25:34.283567
38	How long should I study?	ควรเรียนนานเท่าไหร่?	4-8 weeks for basic improvement, 12+ weeks for significant IELTS/TOEIC score gains. We recommend 3 months minimum.	หากต้องการพัฒนาพื้นฐาน 4-8 สัปดาห์ก็เพียงพอ แต่ถ้าต้องการคะแนน IELTS/TOEIC ที่ชัดเจน แนะนำ 12 สัปดาห์ขึ้นไป	หลักสูตร	t	4	2026-07-29 16:25:34.286702	2026-07-29 16:25:34.286702
39	What is included in the package price?	ราคาแพ็กเกจรวมอะไรบ้าง?	Packages typically include: tuition, dormitory, 3 meals/day, airport transfer, and orientation.	แพ็กเกจโดยทั่วไปรวม: ค่าเรียน ที่พัก อาหาร 3 มื้อ รถรับส่งสนามบิน และปฐมนิเทศ	ราคา	t	5	2026-07-29 16:25:34.289129	2026-07-29 16:25:34.289129
40	Can I work part-time while studying?	เรียนไปทำงาน Part-time ได้ไหม?	No, student visa does not allow part-time work in Philippines.	ไม่ได้ครับ วีซ่านักเรียนไม่อนุญาตให้ทำงาน Part-time ที่ฟิลิปปินส์	ทั่วไป	t	6	2026-07-29 16:25:34.292409	2026-07-29 16:25:34.292409
41	How do I apply?	สมัครเรียนอย่างไร?	Contact Philingo via LINE or fill the Apply form on our website. We'll guide you through the entire process.	ติดต่อ Philingo ผ่าน LINE หรือกรอกแบบฟอร์มสมัครบนเว็บไซต์ เราจะดูแลทุกขั้นตอนให้ครบ	การสมัคร	t	7	2026-07-29 16:25:34.295129	2026-07-29 16:25:34.295129
42	Do you help with accommodation?	ช่วยเรื่องที่พักด้วยไหม?	Yes, all partner schools have on-campus dormitories. We also assist with off-campus options.	ใช่ครับ โรงเรียนพาร์ทเนอร์ทุกแห่งมีหอพักในโรงเรียน เราช่วยจัดการที่พักนอกโรงเรียนได้เช่นกัน	ที่พัก	t	8	2026-07-29 16:25:34.298223	2026-07-29 16:25:34.298223
43	Do I need visa to study in Philippines?	ต้องทำวีซ่าเพื่อไปเรียนที่ฟิลิปปินส์ไหม?	Thai citizens can enter Philippines visa-free for up to 30 days. For longer stays, we help arrange a Student Visa (SSP).	คนไทยไม่ต้องทำวีซ่าเพื่อเข้าฟิลิปปินส์ได้นานถึง 30 วัน หากเรียนนานกว่านั้น Philingo จะช่วยจัดการ Student Visa (SSP) ให้	วีซ่า	t	1	2026-07-30 15:17:58.733257	2026-07-30 15:17:58.733257
44	What is the cost of living in Philippines?	ค่าครองชีพที่ฟิลิปปินส์เป็นอย่างไร?	Living costs are lower than Thailand. Food, transportation, and entertainment are affordable.	ค่าครองชีพที่ฟิลิปปินส์โดยรวมถูกกว่าไทย ค่าอาหาร ค่าเดินทาง และค่าบันเทิงราคาย่อมเยา	ทั่วไป	t	2	2026-07-30 15:17:58.740259	2026-07-30 15:17:58.740259
45	Is Philippines safe for Thai students?	ฟิลิปปินส์ปลอดภัยสำหรับนักเรียนไทยไหม?	Yes, major study destinations like Cebu and Baguio are safe tourist cities with many Thai students.	ปลอดภัยครับ เมืองเซบูและบาเกียวที่นักเรียนไทยนิยมไปเรียนเป็นเมืองท่องเที่ยวที่ปลอดภัยและมีนักเรียนไทยจำนวนมาก	ความปลอดภัย	t	3	2026-07-30 15:17:58.7424	2026-07-30 15:17:58.7424
46	How long should I study?	ควรเรียนนานเท่าไหร่?	4-8 weeks for basic improvement, 12+ weeks for significant IELTS/TOEIC score gains. We recommend 3 months minimum.	หากต้องการพัฒนาพื้นฐาน 4-8 สัปดาห์ก็เพียงพอ แต่ถ้าต้องการคะแนน IELTS/TOEIC ที่ชัดเจน แนะนำ 12 สัปดาห์ขึ้นไป	หลักสูตร	t	4	2026-07-30 15:17:58.745873	2026-07-30 15:17:58.745873
47	What is included in the package price?	ราคาแพ็กเกจรวมอะไรบ้าง?	Packages typically include: tuition, dormitory, 3 meals/day, airport transfer, and orientation.	แพ็กเกจโดยทั่วไปรวม: ค่าเรียน ที่พัก อาหาร 3 มื้อ รถรับส่งสนามบิน และปฐมนิเทศ	ราคา	t	5	2026-07-30 15:17:58.749513	2026-07-30 15:17:58.749513
48	Can I work part-time while studying?	เรียนไปทำงาน Part-time ได้ไหม?	No, student visa does not allow part-time work in Philippines.	ไม่ได้ครับ วีซ่านักเรียนไม่อนุญาตให้ทำงาน Part-time ที่ฟิลิปปินส์	ทั่วไป	t	6	2026-07-30 15:17:58.758115	2026-07-30 15:17:58.758115
49	How do I apply?	สมัครเรียนอย่างไร?	Contact Philingo via LINE or fill the Apply form on our website. We'll guide you through the entire process.	ติดต่อ Philingo ผ่าน LINE หรือกรอกแบบฟอร์มสมัครบนเว็บไซต์ เราจะดูแลทุกขั้นตอนให้ครบ	การสมัคร	t	7	2026-07-30 15:17:58.761049	2026-07-30 15:17:58.761049
50	Do you help with accommodation?	ช่วยเรื่องที่พักด้วยไหม?	Yes, all partner schools have on-campus dormitories. We also assist with off-campus options.	ใช่ครับ โรงเรียนพาร์ทเนอร์ทุกแห่งมีหอพักในโรงเรียน เราช่วยจัดการที่พักนอกโรงเรียนได้เช่นกัน	ที่พัก	t	8	2026-07-30 15:17:58.764233	2026-07-30 15:17:58.764233
\.


--
-- TOC entry 3690 (class 0 OID 16596)
-- Dependencies: 240
-- Data for Name: form_submissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_submissions (id, type, name, email, phone, school_interest, program_interest, start_date, duration, budget, message, utm_source, utm_medium, utm_campaign, status, admin_notes, created_at) FROM stdin;
1	consult	ทดสอบ		0816564159	\N	\N	\N	\N	\N	LINE ID: @testline\nทดสอบส่งฟอร์มปรึกษา	\N	\N	\N	new	\N	2026-07-31 07:37:41.924053
2	consult	RegrTest		08000	\N	\N	\N	\N	\N	\N	\N	\N	\N	new	\N	2026-07-31 08:01:22.822263
\.


--
-- TOC entry 3684 (class 0 OID 16559)
-- Dependencies: 234
-- Data for Name: gallery_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gallery_items (id, title, title_th, image_url, category, caption, caption_th, is_active, sort_order, created_at, updated_at) FROM stdin;
14	\N	หอพักโรงเรียนภาษาอังกฤษฟิลิปปินส์ มีห้องกี่แบบ ราคาเท่าไหร่ ต้องเลือกแบบไหน	/api/gallery/image/fetched-1785686001816-ijakk299zbp.jpg	\N	\N	\N	f	0	2026-08-02 15:53:23.893643	2026-08-06 14:19:20.022
3	\N	นักเรียน Philingo	/api/gallery/image/fetched-1785655191677-ada1gcmsnis.jpg	student	\N	\N	f	0	2026-08-02 07:19:51.678279	2026-08-06 14:24:30.588
4	\N	นักเรียน Philingo	/api/gallery/image/fetched-1785655191785-wepohps5bp.jpg	student	\N	\N	f	0	2026-08-02 07:19:51.786799	2026-08-06 14:24:33.555
20	\N	สายการบินที่บินตรงจากไทยไปเซบู ฟิลิปปินส์ เปรียบเทียบราคาและเวลาบิน	/api/gallery/image/fetched-1785686020132-28g69r5mvyq.jpg	other	\N	\N	f	0	2026-08-02 15:53:42.177313	2026-08-06 14:25:39.732
7	\N	เรียนตัวต่อตัววันละ 4 ชั่วโมง	/api/storage/objects/uploads/fbe59a0f-47a7-4811-b728-187798b27eb9	other	\N	\N	t	0	2026-08-02 15:53:01.080528	2026-08-06 14:52:32.306
8	\N	เรียนภาษากับอาจารย์ Native speaker	/api/storage/objects/uploads/fd2ab447-3ac7-4645-97e6-dd9b7f70e67d	other	\N	\N	t	0	2026-08-02 15:53:05.982688	2026-08-06 14:52:57.196
6	\N	บรรยากาศกรุ๊ปคลาสไม่เกิน 6 คน	/api/storage/objects/uploads/59948c80-cc91-45f9-88ca-9ba138392675	other	\N	\N	t	0	2026-08-02 15:52:57.495399	2026-08-06 14:53:49.469
15	\N	หลังเลิกเรียนไปออกกำลังกาย	/api/storage/objects/uploads/621beb6c-285e-4de8-836b-c6de29ac95b3	other	\N	\N	t	0	2026-08-02 15:53:26.533915	2026-08-06 14:55:13.864
10	\N	น้องฟ้ามุ่ย เรียนภาษาที่ Phininter Academy	/api/storage/objects/uploads/58c3e9ca-68df-4a06-9d78-cc5d14f3d974	student	\N	\N	t	0	2026-08-02 15:53:12.089835	2026-08-06 14:15:37.237
13	\N	Sparta Semi-Sparta General คืออะไร? โปรแกรมเรียนภาษาอังกฤษในฟิลิปปินส์แต่ละแบบต่างกันยังไง	/api/gallery/image/fetched-1785685999175-fclb3ds2yau.jpg	\N	\N	\N	f	0	2026-08-02 15:53:21.227039	2026-08-06 14:19:15.824
16	\N	เมืองบาเกียว ฟิลิปปินส์ คืออะไร? ทำไมถึงเป็นเมืองยอดนิยมของนักเรียนไทย	/api/gallery/image/fetched-1785686009152-sigyjy4hwfb.jpg	other	\N	\N	f	0	2026-08-02 15:53:31.133702	2026-08-06 14:19:33.638
17	\N	วิธีเดินทางจากกรุงเทพไปบาเกียว ฟิลิปปินส์ ไปยังไง ไกลแค่ไหน	/api/gallery/image/fetched-1785686012049-ut6uq2f3vq.jpg	other	\N	\N	f	0	2026-08-02 15:53:33.808927	2026-08-06 14:19:41.813
18	\N	วิธีเดินทางจากกรุงเทพไปเซบู ฟิลิปปินส์ ต่อเครื่องที่ไหน ใช้เวลาเท่าไหร่	/api/gallery/image/fetched-1785686014405-u8hd7yfro3.jpg	other	\N	\N	f	0	2026-08-02 15:53:36.498702	2026-08-06 14:19:47.805
21	\N	รีวิวเรียน QQ English เซบู 8 สัปดาห์ คุ้มไหม?	/api/gallery/image/fetched-1785686022765-aykdjmdq7n7.jpg	other	\N	\N	f	0	2026-08-02 15:53:44.829658	2026-08-06 14:21:50.082
9	\N	น้องแก้ว เรียนภาษาที่ Phininter Academy	/api/storage/objects/uploads/bcbc4835-d1c9-404b-87cc-040d39cce8b7	student	\N	\N	t	0	2026-08-02 15:53:09.070825	2026-08-06 14:53:14.507
12	\N	ห้างสรรพสินค้าดังในฟิลิปปินส์ SM Mall Ayala Robinson ช้อปปิ้งได้ที่ไหนบ้าง	/api/gallery/image/fetched-1785685996120-5oayl3wz1i.jpg	other	\N	\N	f	0	2026-08-02 15:53:18.202023	2026-08-06 14:20:27.467
11	\N	เบื่ออาหารโรงเรียน? สั่ง Grab Food ในฟิลิปปินส์ยังไง ราคาถูกไหม อาหารไทยมีไหม	/api/gallery/image/fetched-1785685993745-ihlat8odbj.jpg	other	\N	\N	f	0	2026-08-02 15:53:15.529785	2026-08-06 14:20:32.596
19	\N	Local Fee คืออะไร? ค่าใช้จ่ายพิเศษที่ต้องรู้ก่อนไปเรียนที่ฟิลิปปินส์	/api/gallery/image/fetched-1785686017098-q4ylyzprnc.jpg	other	\N	\N	f	0	2026-08-02 15:53:39.135271	2026-08-06 14:21:34.893
22	\N	รีวิวเรียน MONOL International เซบู 8 สัปดาห์	/api/gallery/image/fetched-1785686025427-6qy67mbizlo.jpg	other	\N	\N	f	0	2026-08-02 15:53:47.507843	2026-08-06 14:21:54.746
26	\N	รีวิวเรียน SMEAG เซบู 10 สัปดาห์ โรงเรียน Premium คุ้มค่าไหม?	/api/gallery/image/fetched-1785686036096-42sroqjop7s.jpg	other	\N	\N	f	0	2026-08-02 15:53:58.170801	2026-08-06 14:22:17.073
23	\N	รีวิวเรียน B'Cebu Language School 6 สัปดาห์	/api/gallery/image/fetched-1785686028098-e1r7a1dlgyu.jpg	other	\N	\N	f	0	2026-08-02 15:53:50.148339	2026-08-06 14:22:02.188
24	\N	รีวิวเรียน Philinter เซบู 8 สัปดาห์ สถาบันเก่าแก่ดีแค่ไหน?	/api/gallery/image/fetched-1785686030745-zd0vrc515wi.jpg	other	\N	\N	f	0	2026-08-02 15:53:52.82023	2026-08-06 14:22:06.686
25	\N	รีวิวเรียน PINES เซบู 6 สัปดาห์ ประหยัดแต่ได้ผล?	/api/gallery/image/fetched-1785686033421-flzq9uurc04.jpg	other	\N	\N	f	0	2026-08-02 15:53:55.496933	2026-08-06 14:22:11.573
1	Test fetch	ทดสอบดึงรูป	/api/gallery/image/fetched-1785655105146-myqxemytmam.jpg	other	\N	\N	f	0	2026-08-02 07:18:25.14963	2026-08-06 14:24:23.22
2	\N	นักเรียน Philingo	/api/gallery/image/fetched-1785655191577-xwl4s8swawa.jpg	other	\N	\N	f	0	2026-08-02 07:19:51.578145	2026-08-06 14:24:27.749
5	\N	ทดสอบ GCS	/api/gallery/image/fetched-1785657670104-7et34s3o70h.jpg	other	\N	\N	f	0	2026-08-02 08:01:11.8172	2026-08-06 14:24:40.32
27	\N	รีวิวเรียน I.BREEZE เซบู 8 สัปดาห์ สถาบันซ่อนเร้นที่น่าสนใจ	/api/gallery/image/fetched-1785686038758-lgobfbjgra9.jpg	other	\N	\N	f	0	2026-08-02 15:54:00.83685	2026-08-06 14:22:22.01
29	\N	รีวิวเรียน BECI เซบู 12 สัปดาห์ เน้น IELTS	/api/gallery/image/fetched-1785686044082-xuw38zqo08t.jpg	other	\N	\N	f	0	2026-08-02 15:54:06.169981	2026-08-06 14:22:26.815
30	\N	รีวิวเรียน CIA Cebu 4 สัปดาห์ ได้ผลจริงไหม?	/api/gallery/image/fetched-1785686046759-cnxzh4veiua.jpg	other	\N	\N	f	0	2026-08-02 15:54:08.823677	2026-08-06 14:22:30.655
31	\N	คนไทย: คู่มือวีซ่าฉบับสมบูรณ์สำหรับการเรียนในฟิลิปปินส์	/api/gallery/image/fetched-1785686049523-7g4pghev1jw.jpg	other	\N	\N	f	0	2026-08-02 15:54:11.525458	2026-08-06 14:22:39.455
32	\N	วิธีเลือกโรงเรียนภาษาอังกฤษที่ใช่ในฟิลิปปินส์	/api/gallery/image/fetched-1785686052222-eywr55tsz9b.jpg	other	\N	\N	f	0	2026-08-02 15:54:14.201946	2026-08-06 14:22:48.189
33	\N	ค่าใช้จ่ายในการเรียนภาษาอังกฤษในฟิลิปปินส์เท่าไหร่?	/api/gallery/image/fetched-1785686055373-o3ykpq2qm2f.jpg	other	\N	\N	f	0	2026-08-02 15:54:17.462059	2026-08-06 14:22:55.838
38	\N	CIA banner test	/api/gallery/image/fetched-1785691783649-14hcjzo3iow.jpg	other	\N	\N	f	0	2026-08-02 17:29:45.746745	2026-08-06 14:23:01.58
37	\N	ทดสอบ	/api/gallery/image/fetched-1785691201773-og7pkyrq6h.jpg	other	\N	\N	f	0	2026-08-02 17:20:03.848116	2026-08-06 14:23:05.588
36	\N	ทำไมต้องเรียนภาษาอังกฤษในฟิลิปปินส์?	/api/gallery/image/fetched-1785686064143-orba9s1ss1a.jpg	other	\N	\N	f	0	2026-08-02 15:54:26.166269	2026-08-06 14:23:10.903
35	\N	IELTS vs TOEFL: การสอบใดเหมาะกับคุณ?	/api/gallery/image/fetched-1785686060697-rgbhgmt7g09.jpg	other	\N	\N	f	0	2026-08-02 15:54:22.792484	2026-08-06 14:23:15.825
34	\N	เซบู vs บาเกียว: ควรเรียนที่เมืองไหนดี?	/api/gallery/image/fetched-1785686058056-dso5xbxrqkv.jpg	other	\N	\N	f	0	2026-08-02 15:54:20.108897	2026-08-06 14:23:22.506
28	\N	รีวิวเรียน CPILS เซบู 4 สัปดาห์ พัฒนาเร็วจริงไหม?	/api/gallery/image/fetched-1785686041433-nexacqz64e.jpg	other	\N	\N	f	0	2026-08-02 15:54:03.492665	2026-08-06 14:23:28.121
\.


--
-- TOC entry 3697 (class 0 OID 16633)
-- Dependencies: 247
-- Data for Name: newsletter_campaigns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_campaigns (id, subject, body, sent_at, recipient_count, status, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 3699 (class 0 OID 16645)
-- Dependencies: 249
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.newsletter_subscribers (id, email, name, source, is_active, created_at, unsubscribed_at, phone, line_id) FROM stdin;
1	philingoedu@gmail.com	ทดสอบระบบ	contact	true	2026-07-31 07:27:44.781761	\N	061-656-4159	\N
6	test-seminar-reg@philingo.co.th	ทดสอบ ระบบ	seminar	true	2026-08-02 04:32:45.064164	\N	0812345678	\N
2	info@thaistudyabroad.com	อภิชยา มะโนลา	contact	true	2026-07-31 07:28:44.221297	\N	0956362445	\N
\.


--
-- TOC entry 3682 (class 0 OID 16545)
-- Dependencies: 232
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partners (id, name, logo_url, website_url, type, is_active, sort_order, created_at, updated_at) FROM stdin;
1	CIA (Cebu International Academy)	\N	https://www.cia-school.com	school	t	1	2026-07-29 16:15:10.560178	2026-07-29 16:15:10.560178
2	QQ English	\N	https://www.qq-english.com	school	t	2	2026-07-29 16:15:10.570691	2026-07-29 16:15:10.570691
3	Philinter Academy	\N	https://www.philinter.com	school	t	3	2026-07-29 16:15:10.573996	2026-07-29 16:15:10.573996
4	CPILS	\N	https://www.cpils.com	school	t	4	2026-07-29 16:15:10.577073	2026-07-29 16:15:10.577073
5	EV Academy	\N	https://www.evacademy.com	school	t	5	2026-07-29 16:15:10.579976	2026-07-29 16:15:10.579976
6	PINES International Academy	\N	https://www.pinesinternational.com	school	t	6	2026-07-29 16:15:10.583484	2026-07-29 16:15:10.583484
7	SMEAG Global School	\N	https://www.smeag.com	school	t	7	2026-07-29 16:15:10.586957	2026-07-29 16:15:10.586957
8	B'Cebu Language School	\N	https://www.bcebu.com	school	t	8	2026-07-29 16:15:10.589887	2026-07-29 16:15:10.589887
9	CG Education Center	\N	https://www.cgeducation.com	school	t	9	2026-07-29 16:15:10.5925	2026-07-29 16:15:10.5925
10	ACEC	\N	https://www.acec-english.com	school	t	10	2026-07-29 16:15:10.596928	2026-07-29 16:15:10.596928
11	OIA Baguio	\N	\N	school	t	11	2026-07-29 16:15:10.599598	2026-07-29 16:15:10.599598
12	We Academy Iloilo	\N	\N	school	t	12	2026-07-29 16:15:10.602333	2026-07-29 16:15:10.602333
13	GITC Cebu	\N	\N	school	t	13	2026-07-29 16:15:10.605672	2026-07-29 16:15:10.605672
14	CIA (Cebu International Academy)	\N	https://www.cia-school.com	school	t	1	2026-07-29 16:25:34.322268	2026-07-29 16:25:34.322268
15	QQ English	\N	https://www.qq-english.com	school	t	2	2026-07-29 16:25:34.325404	2026-07-29 16:25:34.325404
16	Philinter Academy	\N	https://www.philinter.com	school	t	3	2026-07-29 16:25:34.329404	2026-07-29 16:25:34.329404
17	CPILS	\N	https://www.cpils.com	school	t	4	2026-07-29 16:25:34.331974	2026-07-29 16:25:34.331974
18	EV Academy	\N	https://www.evacademy.com	school	t	5	2026-07-29 16:25:34.335001	2026-07-29 16:25:34.335001
19	PINES International Academy	\N	https://www.pinesinternational.com	school	t	6	2026-07-29 16:25:34.337589	2026-07-29 16:25:34.337589
20	SMEAG Global School	\N	https://www.smeag.com	school	t	7	2026-07-29 16:25:34.340531	2026-07-29 16:25:34.340531
21	B'Cebu Language School	\N	https://www.bcebu.com	school	t	8	2026-07-29 16:25:34.343666	2026-07-29 16:25:34.343666
22	CG Education Center	\N	https://www.cgeducation.com	school	t	9	2026-07-29 16:25:34.346105	2026-07-29 16:25:34.346105
23	ACEC	\N	https://www.acec-english.com	school	t	10	2026-07-29 16:25:34.348689	2026-07-29 16:25:34.348689
24	OIA Baguio	\N	\N	school	t	11	2026-07-29 16:25:34.351981	2026-07-29 16:25:34.351981
25	We Academy Iloilo	\N	\N	school	t	12	2026-07-29 16:25:34.354392	2026-07-29 16:25:34.354392
26	GITC Cebu	\N	\N	school	t	13	2026-07-29 16:25:34.358224	2026-07-29 16:25:34.358224
27	CIA (Cebu International Academy)	\N	https://www.cia-school.com	school	t	1	2026-07-30 15:17:58.790953	2026-07-30 15:17:58.790953
28	QQ English	\N	https://www.qq-english.com	school	t	2	2026-07-30 15:17:58.795225	2026-07-30 15:17:58.795225
29	Philinter Academy	\N	https://www.philinter.com	school	t	3	2026-07-30 15:17:58.798118	2026-07-30 15:17:58.798118
30	CPILS	\N	https://www.cpils.com	school	t	4	2026-07-30 15:17:58.800571	2026-07-30 15:17:58.800571
31	EV Academy	\N	https://www.evacademy.com	school	t	5	2026-07-30 15:17:58.803542	2026-07-30 15:17:58.803542
32	PINES International Academy	\N	https://www.pinesinternational.com	school	t	6	2026-07-30 15:17:58.80681	2026-07-30 15:17:58.80681
33	SMEAG Global School	\N	https://www.smeag.com	school	t	7	2026-07-30 15:17:58.81035	2026-07-30 15:17:58.81035
34	B'Cebu Language School	\N	https://www.bcebu.com	school	t	8	2026-07-30 15:17:58.812582	2026-07-30 15:17:58.812582
35	CG Education Center	\N	https://www.cgeducation.com	school	t	9	2026-07-30 15:17:58.814932	2026-07-30 15:17:58.814932
36	ACEC	\N	https://www.acec-english.com	school	t	10	2026-07-30 15:17:58.818326	2026-07-30 15:17:58.818326
37	OIA Baguio	\N	\N	school	t	11	2026-07-30 15:17:58.821646	2026-07-30 15:17:58.821646
38	We Academy Iloilo	\N	\N	school	t	12	2026-07-30 15:17:58.823844	2026-07-30 15:17:58.823844
39	GITC Cebu	\N	\N	school	t	13	2026-07-30 15:17:58.826557	2026-07-30 15:17:58.826557
\.


--
-- TOC entry 3680 (class 0 OID 16531)
-- Dependencies: 230
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.promotions (id, title, title_th, description, description_th, terms, terms_th, image_url, discount_text, discount_text_th, expires_at, is_featured, is_active, sort_order, created_at, updated_at, original_price_th, discount_price_th, seats_remaining, bonus_th) FROM stdin;
8	IELTS Guarantee Package — PINES Baguio	แพ็คเกจ IELTS รับประกันผล — PINES บาเกียว	Study IELTS at PINES International Academy, Baguio. Score guarantee or free extra weeks	เรียน IELTS ที่ PINES International Academy เมืองบาเกียว รับประกันคะแนน หรือเรียนฟรีเพิ่ม	\N	\N	https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop	Score Guarantee	รับประกันคะแนน	2026-10-31 00:00:00	t	t	2	2026-07-30 15:17:58.833877	2026-07-30 15:17:58.833877	฿160,000	฿149,000	5	รับประกันคะแนน IELTS 6.0+ หรือเรียนต่อฟรี 4 สัปดาห์
4	Early Bird Cebu Summer Package	โปรแกรมเซบูซัมเมอร์ Early Bird	Book 12 weeks ESL + accommodation at CIA or QQ English before the deadline and get exclusive discounts	จองล่วงหน้า 12 สัปดาห์ ESL + ที่พัก ที่ CIA หรือ QQ English รับส่วนลดพิเศษ	\N	\N	https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&h=400&fit=crop	Save ฿15,000	ประหยัด ฿15,000	2026-09-28 00:00:00	t	t	1	2026-07-29 16:25:34.361551	2026-07-29 16:25:34.361551	฿135,000	฿120,000	8	ฟรีค่าสมัคร + กระเป๋าเป้ Philingo
2	IELTS Guarantee Package — PINES Baguio	แพ็คเกจ IELTS รับประกันผล — PINES บาเกียว	Study IELTS at PINES International Academy, Baguio. Score guarantee or free extra weeks	เรียน IELTS ที่ PINES International Academy เมืองบาเกียว รับประกันคะแนน หรือเรียนฟรีเพิ่ม	\N	\N	https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop	Score Guarantee	รับประกันคะแนน	2026-10-31 00:00:00	t	t	2	2026-07-29 16:15:10.613663	2026-07-29 16:15:10.613663	฿160,000	฿149,000	5	รับประกันคะแนน IELTS 6.0+ หรือเรียนต่อฟรี 4 สัปดาห์
5	IELTS Guarantee Package — PINES Baguio	แพ็คเกจ IELTS รับประกันผล — PINES บาเกียว	Study IELTS at PINES International Academy, Baguio. Score guarantee or free extra weeks	เรียน IELTS ที่ PINES International Academy เมืองบาเกียว รับประกันคะแนน หรือเรียนฟรีเพิ่ม	\N	\N	https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop	Score Guarantee	รับประกันคะแนน	2026-10-31 00:00:00	t	t	2	2026-07-29 16:25:34.365666	2026-07-29 16:25:34.365666	฿160,000	฿149,000	5	รับประกันคะแนน IELTS 6.0+ หรือเรียนต่อฟรี 4 สัปดาห์
3	Iloilo Intro Package — New Destination	โปรแกรม Iloilo แนะนำ — จุดหมายใหม่	First-time Iloilo students get special introductory rates at We Academy or GITC Iloilo	นักเรียนใหม่ที่เลือก Iloilo รับราคาพิเศษที่ We Academy หรือ GITC Iloilo	\N	\N	https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop	฿8,000 off	ลด ฿8,000	2026-11-30 00:00:00	f	t	3	2026-07-29 16:15:10.617422	2026-07-29 16:15:10.617422	฿95,000	฿87,000	10	ฟรีค่าสมัคร + บริการรับส่งสนามบิน
6	Iloilo Intro Package — New Destination	โปรแกรม Iloilo แนะนำ — จุดหมายใหม่	First-time Iloilo students get special introductory rates at We Academy or GITC Iloilo	นักเรียนใหม่ที่เลือก Iloilo รับราคาพิเศษที่ We Academy หรือ GITC Iloilo	\N	\N	https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop	฿8,000 off	ลด ฿8,000	2026-11-30 00:00:00	f	t	3	2026-07-29 16:25:34.368499	2026-07-29 16:25:34.368499	฿95,000	฿87,000	10	ฟรีค่าสมัคร + บริการรับส่งสนามบิน
1		โปรแกรมเซบูซัมเมอร์ Early Bird	Book 12 weeks ESL + accommodation at CIA or QQ English before the deadline and get exclusive discounts	จองล่วงหน้า 12 สัปดาห์ ESL + ที่พัก ที่ CIA หรือ QQ English รับส่วนลดพิเศษ	\N	\N	/api/uploads/1785423300267-ovhaidzn5s8.png	Save ฿15,000	ประหยัด ฿15,000	2026-09-28 00:00:00	t	t	1	2026-07-29 16:15:10.609423	2026-07-30 14:55:06.107	฿135,000	฿120,000	8	ฟรีค่าสมัคร + กระเป๋าเป้ Philingo
7	Early Bird Cebu Summer Package	โปรแกรมเซบูซัมเมอร์ Early Bird	Book 12 weeks ESL + accommodation at CIA or QQ English before the deadline and get exclusive discounts	จองล่วงหน้า 12 สัปดาห์ ESL + ที่พัก ที่ CIA หรือ QQ English รับส่วนลดพิเศษ	\N	\N	/api/uploads/1785423300267-ovhaidzn5s8.png	Save ฿15,000	ประหยัด ฿15,000	2026-09-28 00:00:00	t	t	1	2026-07-30 15:17:58.829754	2026-07-30 15:17:58.829754	฿135,000	฿120,000	8	ฟรีค่าสมัคร + กระเป๋าเป้ Philingo
9	Iloilo Intro Package — New Destination	โปรแกรม Iloilo แนะนำ — จุดหมายใหม่	First-time Iloilo students get special introductory rates at We Academy or GITC Iloilo	นักเรียนใหม่ที่เลือก Iloilo รับราคาพิเศษที่ We Academy หรือ GITC Iloilo	\N	\N	https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop	฿8,000 off	ลด ฿8,000	2026-11-30 00:00:00	f	t	3	2026-07-30 15:17:58.837149	2026-07-30 15:17:58.837149	฿95,000	฿87,000	10	ฟรีค่าสมัคร + บริการรับส่งสนามบิน
\.


--
-- TOC entry 3668 (class 0 OID 16433)
-- Dependencies: 218
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schools (id, slug, name, name_th, tagline, tagline_th, city, country, logo_url, cover_image_url, rating, students_count, nationality_count, founded_year, description, description_th, highlights, facilities, programs, photos, youtube_id, website_url, map_url, accent_class, tags, is_featured, is_active, sort_order, created_at, updated_at, pricing_config, timetable_config, seo_title, seo_description, seo_keywords, seo_h1_override, seo_marketing_meta) FROM stdin;
39	ibreeze	I.BREEZE	ไอ.บรีซ	ESL | Semi-Sparta | Mactan Island	ESL | Semi-Sparta | Mactan	Mactan, Cebu City	Philippines	\N	\N	4.5	120+	7+ ชาติ	2013	\N	\N	[]	[]	[]	["https://picsum.photos/seed/ibreeze-1/900/600", "https://picsum.photos/seed/ibreeze-2/900/600", "https://picsum.photos/seed/ibreeze-3/900/600"]	\N	https://cebuibreeze.com	\N	from-cyan-500 to-sky-500	["ESL", "Semi-Sparta", "Speaking"]	f	t	16	2026-07-29 16:02:24.837148	2026-08-06 13:32:47.097	{"rooms": [{"id": "ib1_single_room", "name": "IB1 Single Room", "nameTh": "ห้องเดี่ยว (IB1)", "pricePerFourWeeks": 1270}, {"id": "ib1_twin_room", "name": "IB1 Twin Room", "nameTh": "ห้องแฝด (Twin) (IB1)", "pricePerFourWeeks": 900}, {"id": "ib1_triple_room", "name": "IB1 Triple Room", "nameTh": "ห้อง 3 คน (Triple) (IB1)", "pricePerFourWeeks": 790}, {"id": "ib1_quad_room", "name": "IB1 Quad Room", "nameTh": "ห้อง 4 คน (Quad) (IB1)", "pricePerFourWeeks": 720}, {"id": "ib2_single_room", "name": "IB2 Single Room", "nameTh": "ห้องเดี่ยว (IB2)", "pricePerFourWeeks": 1320}, {"id": "ib2_twin_room", "name": "IB2 Twin Room", "nameTh": "ห้องแฝด (Twin) (IB2)", "pricePerFourWeeks": 950}, {"id": "ib2_quad_room", "name": "IB2 Quad Room", "nameTh": "ห้อง 4 คน (Quad) (IB2)", "pricePerFourWeeks": 750}, {"id": "condo_regular_single", "name": "Condo Regular Single", "nameTh": "Regular Single (Condo)", "pricePerFourWeeks": 1390}, {"id": "condo_super_single", "name": "Condo Super Single", "nameTh": "Super Single (Condo)", "pricePerFourWeeks": 1420}, {"id": "condo_regular_twin", "name": "Condo Regular Twin", "nameTh": "Regular Twin (Condo)", "pricePerFourWeeks": 1050}, {"id": "condo_super_twin", "name": "Condo Super Twin", "nameTh": "Super Twin (Condo)", "pricePerFourWeeks": 1070}, {"id": "condo_family_unit", "name": "Condo Family Unit", "nameTh": "Family Unit (Condo)", "pricePerFourWeeks": 890}], "courses": [{"id": "power_esl", "name": "Power ESL", "nameTh": "ESL Power", "pricePerFourWeeks": 990}, {"id": "intensive_beginner", "name": "Intensive Beginner", "nameTh": "ESL Intensive Beginner", "pricePerFourWeeks": 990}, {"id": "light_esl", "name": "Light ESL", "nameTh": "ESL Light", "pricePerFourWeeks": 840}, {"id": "intensive_speaking", "name": "Intensive Speaking", "nameTh": "ESL Intensive Speaking", "pricePerFourWeeks": 770}, {"id": "ielts_starter", "name": "IELTS Starter", "nameTh": "IELTS Starter", "pricePerFourWeeks": 990}, {"id": "ielts_target", "name": "IELTS Target", "nameTh": "IELTS Target", "pricePerFourWeeks": 1190}, {"id": "toeic_target", "name": "TOEIC Target", "nameTh": "TOEIC Preparation (Target)", "pricePerFourWeeks": 1020}, {"id": "junior_esl_yle", "name": "Junior ESL & YLE", "nameTh": "Junior ESL & YLE", "pricePerFourWeeks": 1290}, {"id": "general_business_bec", "name": "General Business & BEC", "nameTh": "General Business & BEC", "pricePerFourWeeks": 890}], "promoRules": [{"id": "a796a3ee-f778-4b29-adad-15dc997a7f68", "label": "August 2026 — ห้อง 2 คน (IB1 & IB2) ลด $150/4wk", "enabled": true, "roomIds": ["ib1_twin_room", "ib2_twin_room"], "minWeeks": 4, "courseIds": [], "promoCode": "AUG2026", "discountType": "perFourWeeksUsd", "discountValue": 150}, {"id": "e95eb23b-75f3-4c3e-9066-ce80eacebf28", "label": "August 2026 — ห้อง 3 คน (IB1) ลด $300/4wk", "enabled": true, "roomIds": ["ib1_triple_room"], "minWeeks": 4, "courseIds": [], "promoCode": "AUG2026", "discountType": "perFourWeeksUsd", "discountValue": 300}, {"id": "f7a67120-2374-4fb3-9aef-93aaa45e673c", "label": "August 2026 — ห้อง 4 คน (IB1 & IB2) ลด $300/4wk", "enabled": true, "roomIds": ["ib1_quad_room", "ib2_quad_room"], "minWeeks": 4, "courseIds": [], "promoCode": "AUG2026", "discountType": "perFourWeeksUsd", "discountValue": 300}], "enrollmentFee": 150, "promoDiscount": {"label": "ส่วนลด Promotion เมื่อลงทะเบียนเรียน 4 สัปดาห์ขึ้นไป", "enabled": false, "minWeeks": 4, "discountPerFourWeeks": 100}, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 22700, "8": 36840, "12": 54250, "16": 65690, "20": 77730, "24": 89170}, "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5}	\N	\N	\N	\N	\N	\N
1	cia	CIA (Cebu International Academy)	ซีไอเอ เซบู			Mactan, Cebu	Philippines	/api/storage/objects/uploads/c97ba1a5-e603-48f5-9647-61ff4c8d7943	\N	4.8	800+	15+ ชาติ	2003	\N	**ซีไอเอ เซบู — โรงเรียนสอนภาษาอังกฤษที่จะเปลี่ยนชีวิตคุณในแบบที่ไม่คาดคิด**\n\nถ้าคุณกำลังมองหาสถานที่เรียนภาษาอังกฤษที่ไม่ใช่แค่ "ไปเที่ยวพร้อมเรียน" แต่อยากได้ผลลัพธ์จริง ๆ กลับบ้าน ซีไอเอ เซบู (CIA - Cebu International Academy) คืออีกหนึ่งตัวเลือกที่คุณไม่ควรมองข้าม สถาบันแห่งนี้ตั้งอยู่ที่เมืองแมคตัน เกาะเซบู ประเทศฟิลิปปินส์ เป็นที่รู้จักในหมู่นักเรียนต่างชาติในฐานะโรงเรียนที่มีระบบการเรียนเข้มข้นแบบ เซมิ-สปาร์ตา (Semi-Sparta) พร้อมวิทยาเขตใหม่ที่ออกแบบมาเพื่อการเรียนรู้โดยเฉพาะ\n\n**จุดเด่นที่ทำให้ซีไอเอ เซบู แตกต่างจากที่อื่น**\n\nสิ่งที่ทำให้ซีไอเอ เซบู โดดเด่นคือระบบการเรียนแบบเซมิ-สปาร์ตา ซึ่งหมายความว่าคุณจะได้เรียนอย่างมีวินัยและต่อเนื่อง มีตารางเรียนที่ชัดเจน แต่ยังคงมีเวลาส่วนตัวให้พักผ่อนและปรับตัวได้ ไม่เคร่งเครียดจนเกินไปอย่างระบบสปาร์ตาเต็มรูปแบบ เหมาะมากสำหรับคนที่อยากพัฒนาภาษาอย่างจริงจัง แต่ยังต้องการความสมดุลในชีวิต นอกจากนี้ วิทยาเขตแห่งใหม่ยังมาพร้อมสิ่งอำนวยความสะดวกที่ทันสมัย บรรยากาศสะอาด โปร่ง และเอื้อต่อการเรียนรู้อย่างเต็มที่\n\n**คอร์สที่เปิดสอน — เลือกได้ตามเป้าหมายของคุณ**\n\nซีไอเอ เซบู มีคอร์สให้เลือกหลากหลายตามวัตถุประสงค์ของแต่ละคน ไม่ว่าจะเป็นคอร์ส อีเอสแอล (ESL - English as a Second Language) ปกติ สำหรับผู้ที่ต้องการพัฒนาทักษะภาษาอังกฤษทั่วไปในราคา 900 ดอลลาร์ต่อ 4 สัปดาห์ หรือจะเลือกคอร์สอีเอสแอลเข้มข้น (Intensive) ที่เพิ่มชั่วโมงเรียนขึ้นในราคา 1,000 ดอลลาร์ต่อ 4 สัปดาห์\n\nสำหรับคนที่มีเป้าหมายชัดเจน ไม่ว่าจะเป็นการสอบ ไอเอลทีเอส (IELTS) เพื่อศึกษาต่อต่างประเทศ หรือสอบ โทอิก (TOEIC) เพื่อเพิ่มโอกาสในการทำงาน ทางสถาบันก็มีคอร์สเฉพาะทางรองรับ คอร์สไอเอลทีเอสและคอร์สภาษาอังกฤษธุรกิจ (Business English) ราคา 1,050 ดอลลาร์ต่อ 4 สัปดาห์ ส่วนคอร์สโทอิกอยู่ที่ 1,000 ดอลลาร์ต่อ 4 สัปดาห์ รูปแบบการเรียนผสมผสานทั้งการเรียนแบบตัวต่อตัว (One-on-One) และเรียนกลุ่ม ทำให้ได้ฝึกทั้งความมั่นใจในการพูดและทักษะการฟัง อ่าน เขียนอย่างครบถ้วน\n\n**สถานที่ตั้งและบรรยากาศที่น่าอยู่**\n\nแมคตัน เซบู เป็นเกาะเล็ก ๆ ที่อยู่ติดกับตัวเมืองเซบู เดินทางสะดวกมากเพราะสนามบินนานาชาติเซบู (Mactan-Cebu International Airport) ตั้งอยู่บนเกาะนี้เลย แทบไม่ต้องเสียเวลาในการเดินทางหลังลงเครื่อง บรรยากาศโดยรอบเป็นเมืองที่คึกคักแต่ไม่วุ่นวาย มีร้านอาหาร ห้างสรรพสินค้า และสถานที่ท่องเที่ยวให้สำรวจในวันหยุด รวมทั้งยังมีชายหาดสวยงามไม่ไกลจากสถาบัน เหมาะสำหรับการพักผ่อนหลังวันเรียนที่เหนื่อยล้า\n\n**สิ่งอำนวยความสะดวกครบครัน พร้อมห้องพักหลายแบบ**\n\nซีไอเอ เซบู มีห้องพักให้เลือกตามงบประมาณและความชอบส่วนตัว ตั้งแต่ห้องพัก 4 คน (Quad) ในราคา 750 ดอลลาร์ต่อ 4 สัปดาห์ ห้อง 3 คน (Triple) 850 ดอลลาร์ ห้อง 2 คน (Twin) 1,100 ดอลลาร์ ไปจนถึงห้องเดี่ยวแบบสแตนดาร์ด (Standard) 1,500 ดอลลาร์ และห้องเดี่ยวแบบพรีเมียม (Premium) 1,700 ดอลลาร์ต่อ 4 สัปดาห์ ราคาห้องพักรวมอาหารและสิ่งอำนวยความสะดวกพื้นฐาน ภายในวิทยาเขตมีพื้นที่ศึกษาเพิ่มเติม อินเทอร์เน็ตความเร็วสูง และสิ่งอำนวยความสะดวกที่จำเป็นสำหรับการใช้ชีวิตและการเรียนอย่างครบครัน\n\n**ทำไมถึงควรเลือกเรียนที่ซีไอเอ เซบู?**\n\nถ้าคุณอยากพัฒนาภาษาอังกฤษอย่างได้ผลจริง ไม่ใช่แค่ท่องศัพท์หรือเรียนแบบผ่าน ๆ ซีไอเอ เซบู คือคำตอบที่ใช่ ด้วยระบบการเรียนที่เข้มแต่ไม่กดดันเกินไป วิทยาเขตใหม่ที่ทันสมัย คอร์สที่ตอบโจทย์หลากหลายเป้าหมาย และทำเลที่เดินทางง่าย ทำให้ที่นี่เหมาะกับทั้งนักศึกษาและวัยทำงานที่อยากยกระดับทักษะภาษาอย่างจริงจัง\n\nสนใจข้อมูลเพิ่มเติมได้ที่ [www.cebucia.com](https://www.cebucia.com) แล้วเริ่มต้นก้าวแรกสู่ภาษาอังกฤษที่ดีกว่าเดิมได้เลยวันนี้!	[]	[]	[]	["/api/storage/objects/uploads/797aeb20-470f-4127-acbc-bdded9b4811a", "/api/storage/objects/uploads/3d8ebe0e-6020-465b-aa65-6830bdcc940f", "/api/storage/objects/uploads/4df5417c-d74b-4aba-b369-b5d765c8031b"]	xakFGnjP5pg	https://www.cebucia.com		from-red-800 to-red-600	["Semi-Sparta", "New Campus", "IELTS", "TOEIC"]	t	t	0	2026-07-28 05:50:56.770268	2026-08-06 16:41:11.307	{"rooms": [{"id": "quad", "name": "Quad Room", "nameTh": "ห้อง 4 คน (Quad)", "photos": ["/api/storage/objects/uploads/843cb2ed-28ea-4f4f-8322-291d3507dd4c"], "pricePerFourWeeks": 750}, {"id": "triple", "name": "Triple Room", "nameTh": "ห้อง 3 คน (Triple)", "photos": ["/api/storage/objects/uploads/68dd1668-a4cd-4467-9513-8258eaa69544"], "pricePerFourWeeks": 850}, {"id": "twin", "name": "Twin Room", "nameTh": "ห้อง 2 คน (Twin)", "photos": ["/api/storage/objects/uploads/434265fd-2b8f-471a-b262-32aa39c25261"], "pricePerFourWeeks": 1100}, {"id": "single_standard", "name": "Single Standard", "nameTh": "ห้องเดี่ยว Standard", "pricePerFourWeeks": 1500}, {"id": "single_premium", "name": "Single Premium", "nameTh": "ห้องเดี่ยว Premium", "pricePerFourWeeks": 1700}], "videos": [{"id": "yt-cia-1", "type": "youtube", "title": "CIA Cebu International Academy — Campus Tour", "titleTh": "วีดีโอแนะนำ CIA (Cebu International Academy)", "youtubeId": "xakFGnjP5pg"}], "courses": [{"id": "esl_regular", "name": "ESL Regular", "nameTh": "ESL ปกติ", "pricePerFourWeeks": 900}, {"id": "esl_intensive", "name": "ESL Intensive", "nameTh": "ESL เข้มข้น", "pricePerFourWeeks": 1000}, {"id": "ielts", "name": "IELTS", "nameTh": "IELTS", "pricePerFourWeeks": 1050}, {"id": "toeic", "name": "TOEIC", "nameTh": "TOEIC", "pricePerFourWeeks": 1000}, {"id": "business", "name": "Business English", "nameTh": "Business English", "pricePerFourWeeks": 1050}], "enrollmentFee": 100, "promoDiscount": {"label": "ส่วนลด Promotion เมื่อลงทะเบียนเรียน 4 สัปดาห์ขึ้นไป", "enabled": true, "minWeeks": 4, "discountPerFourWeeks": 100}, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 25200, "8": 37330, "12": 55240, "16": 66780, "20": 78320, "24": 89860}, "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5}	\N	ซีไอเอ เซบู เรียนภาษาอังกฤษฟิลิปปินส์ ระบบเซมิ-สปาร์ตา	ซีไอเอ เซบู โรงเรียนสอนภาษาอังกฤษที่ฟิลิปปินส์ ระบบเซมิ-สปาร์ตา คอร์ส ESL, IELTS, TOEIC เริ่มต้น 900 ดอลลาร์ต่อ 4 สัปดาห์ วิทยาเขตใหม่ใจกลางแมคตัน เซบู ใกล้สนามบิน	ซีไอเอ เซบู, เรียนภาษาอังกฤษฟิลิปปินส์, CIA Cebu, เรียนภาษาอังกฤษเซบู, โรงเรียนภาษาอังกฤษฟิลิปปินส์, เซมิ-สปาร์ตา, คอร์ส IELTS ฟิลิปปินส์, คอร์ส TOEIC ฟิลิปปินส์, ESL ฟิลิปปินส์, เรียนต่อฟิลิปปินส์, แมคตัน เซบู, ราคาเรียนภาษาอังกฤษฟิลิปปินส์		🎓 ซีไอเอ เซบู เรียนภาษาอังกฤษแบบเข้มข้น ได้ผลจริง! เริ่มต้นแค่ 900 ดอลลาร์ ดูรายละเอียดเลย
7	smeag	SMEAG Global School	สเมก โกลบอล สคูล	\N	\N	Cebu City	Philippines	\N	\N	4.8	1200+	20+ ชาติ	1996	\N	\N	[]	[]	[]	["https://picsum.photos/seed/smeag-1/900/600", "https://picsum.photos/seed/smeag-2/900/600", "https://picsum.photos/seed/smeag-3/900/600"]	\N	https://www.smeag.com	\N	from-red-600 to-orange-600	["Sparta", "IELTS Guarantee", "Big Campus"]	t	t	0	2026-07-28 05:50:56.801114	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
2	qq-english	QQ English	คิวคิว อิงลิช	\N	\N	IT Park, Cebu	Philippines	\N	\N	4.7	500+	12+ ชาติ	2008	\N	\N	[]	[]	[]	["https://picsum.photos/seed/qq-cebu-1/900/600", "https://picsum.photos/seed/qq-cebu-2/900/600", "https://picsum.photos/seed/qq-cebu-3/900/600"]	\N	https://www.qqenglish.com	\N	from-sky-500 to-blue-600	["Callan Method", "ESL", "IELTS", "IT Park"]	t	t	0	2026-07-28 05:50:56.778304	2026-07-31 03:52:20.118153	{"rooms": [], "courses": [{"id": "esl-4-1to1", "name": "ESL 4 Periods (1:1)", "nameTh": "4 คาบ ตัวต่อตัว", "packagePrices": {"4": 1575, "8": 2955, "12": 4359, "16": 5763, "20": 7167, "24": 8571}, "pricePerFourWeeks": 0}, {"id": "esl-4-2-group", "name": "ESL 4:2 (1:1 + Group)", "nameTh": "4:2 ตัวต่อตัว + กลุ่ม", "packagePrices": {"4": 1675, "8": 3148, "12": 4648, "16": 6149, "20": 7649, "24": 9149}, "pricePerFourWeeks": 0}, {"id": "esl-6-1to1", "name": "ESL 6 Periods (1:1)", "nameTh": "6 คาบ ตัวต่อตัว", "packagePrices": {"4": 1869, "8": 3590, "12": 5312, "16": 7033, "20": 8755, "24": 10477}, "pricePerFourWeeks": 0}, {"id": "esl-6-2-group", "name": "ESL 6:2 (1:1 + Group)", "nameTh": "6:2 ตัวต่อตัว + กลุ่ม", "packagePrices": {"4": 1969, "8": 3783, "12": 5601, "16": 7419, "20": 9237, "24": 11055}, "pricePerFourWeeks": 0}, {"id": "esl-8-1to1", "name": "ESL 8 Periods (1:1)", "nameTh": "8 คาบ ตัวต่อตัว (เข้มข้นที่สุด)", "packagePrices": {"4": 2228, "8": 4309, "12": 6389, "16": 8470, "20": 10551, "24": 12632}, "pricePerFourWeeks": 0}], "enrollmentFee": 0, "promoDiscount": {"label": "", "enabled": false, "minWeeks": 4, "discountPerFourWeeks": 0}, "bundledPackage": true, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 13440, "8": 20700, "12": 33185, "16": 39755, "20": 46325, "24": 52895}, "packageIncludes": "รวม: ค่าเล่าเรียน + ที่พัก (แคปซูล) + อาหาร 3 มื้อ + รับสนามบิน + ค่าสมัคร", "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5}	\N	\N	\N	\N	\N	\N
50	jic-academy	JIC Academy	เจไอซี อคาเดมี	Japanese Management | ESL | Business | บาเกียว	บริหารญี่ปุ่น | ESL | Business	Baguio City	Philippines	\N	\N	4.5	150+	8+ ชาติ	2008	\N	\N	[]	[]	[]	["https://picsum.photos/seed/jic-academy-baguio-1/900/600", "https://picsum.photos/seed/jic-academy-baguio-2/900/600", "https://picsum.photos/seed/jic-academy-baguio-3/900/600"]	\N	https://baguiojic.com	\N	from-red-500 to-orange-500	["Japanese Mgmt", "ESL", "Business"]	f	t	27	2026-07-29 16:02:24.875776	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
51	aj-academy	A&J Academy	เอแอนด์เจ อคาเดมี	ESL | Speaking Focus | อากาศเย็น | บาเกียว	ESL | Speaking | อากาศเย็น บาเกียว	Baguio City	Philippines	\N	\N	4.4	100+	6+ ชาติ	2013	\N	\N	[]	[]	[]	["https://picsum.photos/seed/aj-academy-baguio-1/900/600", "https://picsum.photos/seed/aj-academy-baguio-2/900/600", "https://picsum.photos/seed/aj-academy-baguio-3/900/600"]	\N	https://anjacademy.com	\N	from-pink-500 to-rose-500	["ESL", "Speaking", "Affordable"]	f	t	28	2026-07-29 16:02:24.878676	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
41	genius-english	Genius English Professionals	จีเนียส อิงลิช	Sparta | IELTS | ESL | Cebu City	Sparta | IELTS | เซบู	Cebu City	Philippines	\N	\N	4.6	300+	10+ ชาติ	2009	\N	\N	[]	[]	[]	["https://www.studyenglishgenius.com/wp-content/uploads/2024/10/world-img.png"]	\N	https://studyenglishgenius.com	\N	from-rose-500 to-red-500	["Sparta", "IELTS", "ESL"]	f	t	18	2026-07-29 16:02:24.846715	2026-07-31 03:50:14.133	null	\N	\N	\N	\N	\N	\N
56	hana-academy	HANA Academy	ฮานะ อคาเดมี	ESL | Japanese Management | Clark Freeport	ESL | บริหารญี่ปุ่น | คลาร์ก	Clark Freeport Zone	Philippines	\N	\N	4.5	200+	8+ ชาติ	2010	\N	\N	[]	[]	[]	["https://static.readdy.ai/image/d000806ada85d387ffa3466a860b2591/a230d66120a2eb409773744ab047dc32.jpeg"]	\N	https://clarkhana.com	\N	from-pink-600 to-rose-600	["ESL", "Japanese Mgmt", "Clark"]	f	t	33	2026-07-29 16:02:24.894817	2026-07-31 03:50:25.144	null	\N	\N	\N	\N	\N	\N
62	enderun	Enderun Language Center	เอ็นเดอรัน แลงกวิจ เซ็นเตอร์	Premium ESL | BGC Manila | Business	พรีเมียม | BGC | Business | มะนิลา	BGC, Manila	Philippines	\N	\N	4.7	200+	10+ ชาติ	2007	\N	\N	[]	[]	[]	["https://www.enderuncolleges.com/wp-content/uploads/2020/03/campus-compressor.jpg"]	\N	https://www.enderuncolleges.com	\N	from-purple-600 to-indigo-600	["Premium", "BGC", "Business", "IELTS"]	f	t	39	2026-07-29 16:02:24.92008	2026-07-31 03:50:29.111	null	\N	\N	\N	\N	\N	\N
68	columbus-english	Columbus English Academy	โคลัมบัส อิงลิช อคาเดมี	โรงเรียนขนาดเล็ก | ดูแลแบบครอบครัว | Jaro	โรงเรียนเล็ก | ครอบครัว | อิโลอิโล	Jaro, Iloilo City	Philippines	\N	\N	4.4	80+	5+ ชาติ	2014	\N	\N	[]	[]	[]	["https://picsum.photos/seed/columbus-english-iloilo-1/900/600", "https://picsum.photos/seed/columbus-english-iloilo-2/900/600", "https://picsum.photos/seed/columbus-english-iloilo-3/900/600"]	\N	\N	\N	from-rose-500 to-pink-500	["Small School", "ESL", "Family Atmosphere"]	f	t	45	2026-07-29 16:02:24.943636	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
8	pines	PINES International Academy	ไพนส์ อินเตอร์เนชั่นแนล	\N	\N	Baguio City	Philippines	\N	\N	4.9	700+	15+ ชาติ	1994	\N	\N	[]	[]	[]	["https://picsum.photos/seed/pines-baguio-1/900/600", "https://picsum.photos/seed/pines-baguio-2/900/600", "https://picsum.photos/seed/pines-baguio-3/900/600"]	\N	https://pinesacademy.com	\N	from-teal-700 to-emerald-700	["Sparta", "Baguio", "Cool Weather", "IELTS"]	t	t	0	2026-07-28 05:50:56.807093	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
32	gitc	GITC (Green International Technological College)	จีไอทีซี เซบู	ESL & IELTS & TOEIC | La Paz, Cebu City	ESL, IELTS, TOEIC | ค่าเรียนประหยัด	La Paz, Cebu City	Philippines	\N	\N	4.4	250+	10+ ชาติ	2003	\N	\N	[]	[]	[]	["https://picsum.photos/seed/gitc-1/900/600", "https://picsum.photos/seed/gitc-2/900/600", "https://picsum.photos/seed/gitc-3/900/600"]	\N	http://gitc.edu.ph	\N	from-green-600 to-emerald-600	["ESL", "IELTS", "TOEIC"]	f	t	8	2026-07-29 16:02:24.795458	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
65	gitc-iloilo	GITC Iloilo (Green International Technological College)	จีไอทีซี อิโลอิโล	นิยมจากนักเรียนญี่ปุ่น–เกาหลี | ESL | La Paz	นิยมจากนักเรียนญี่ปุ่น–เกาหลี | ESL	La Paz, Iloilo City	Philippines	\N	\N	4.5	200+	8+ ชาติ	2005	\N	\N	[]	[]	[]	["https://picsum.photos/seed/gitc-iloilo-iloilo-1/900/600", "https://picsum.photos/seed/gitc-iloilo-iloilo-2/900/600", "https://picsum.photos/seed/gitc-iloilo-iloilo-3/900/600"]	\N	http://gitc.edu.ph	\N	from-teal-500 to-emerald-600	["ESL", "IELTS", "TOEIC", "Quiet Atmosphere"]	f	t	42	2026-07-29 16:02:24.934847	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
33	english-fella	English Fella	อิงลิช เฟลลา	Semi-Sparta | IT Park | Speaking Focus	Semi-Sparta | IT Park | Speaking	IT Park, Cebu City	Philippines	\N	\N	4.5	200+	8+ ชาติ	2012	\N	\N	[]	[]	[]	["https://picsum.photos/seed/english-fella-1/900/600", "https://picsum.photos/seed/english-fella-2/900/600", "https://picsum.photos/seed/english-fella-3/900/600"]	\N	https://englishfella.com	\N	from-blue-500 to-cyan-500	["Semi-Sparta", "ESL", "Speaking", "IT Park"]	f	t	10	2026-07-29 16:02:24.808964	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
34	cpi	Cebu Pelis Institute (CPI)	ซีพีไอ เซบู	สถาบันเก่าแก่ | ESL | Affordable | Cebu City	สถาบันเก่าแก่ | ค่าเรียนประหยัด	Cebu City	Philippines	\N	\N	4.4	150+	6+ ชาติ	2007	\N	\N	[]	[]	[]	["https://picsum.photos/seed/cpi-1/900/600", "https://picsum.photos/seed/cpi-2/900/600", "https://picsum.photos/seed/cpi-3/900/600"]	\N	https://www.cebucpi.com	\N	from-gray-600 to-gray-500	["ESL", "Affordable", "Cebu City"]	f	t	11	2026-07-29 16:02:24.813127	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
35	cella	CELLA English Academy	เซลล่า อิงลิช	General English | IELTS | Friendly Atmosphere	ESL ทั่วไป | IELTS | บรรยากาศเป็นกันเอง	Cebu City	Philippines	\N	\N	4.5	150+	7+ ชาติ	2010	\N	\N	[]	[]	[]	["https://picsum.photos/seed/cella-1/900/600", "https://picsum.photos/seed/cella-2/900/600", "https://picsum.photos/seed/cella-3/900/600"]	\N	https://www.cellaenglish.com	\N	from-teal-500 to-green-500	["ESL", "IELTS", "General English"]	f	t	12	2026-07-29 16:02:24.816751	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
36	cg-academy	CG Academy	ซีจี อคาเดมี	Callan & General English | ESL | Cebu City	Callan Method | ESL | เซบู	Cebu City	Philippines	\N	\N	4.4	120+	6+ ชาติ	2008	\N	\N	[]	[]	[]	["https://picsum.photos/seed/cg-academy-1/900/600", "https://picsum.photos/seed/cg-academy-2/900/600", "https://picsum.photos/seed/cg-academy-3/900/600"]	\N	https://www.cgesl.com	\N	from-indigo-500 to-blue-500	["Callan", "ESL", "General English"]	f	t	13	2026-07-29 16:02:24.820355	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
37	ims-academy	IMS Academy	ไอเอ็มเอส อคาเดมี	Intensive ESL | IELTS | Small Class Size	เรียนเข้มข้น | ห้องเรียนเล็ก	Cebu City	Philippines	\N	\N	4.5	130+	7+ ชาติ	2011	\N	\N	[]	[]	[]	["https://picsum.photos/seed/ims-academy-1/900/600", "https://picsum.photos/seed/ims-academy-2/900/600", "https://picsum.photos/seed/ims-academy-3/900/600"]	\N	https://imsacademy.net	\N	from-purple-500 to-indigo-500	["Intensive", "ESL", "IELTS", "Small Class"]	f	t	14	2026-07-29 16:02:24.824533	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
38	glc-english	GLC English Academy	จีแอลซี อิงลิช	General English | IELTS | Cebu	General English | IELTS | เซบู	Cebu City	Philippines	\N	\N	4.4	100+	6+ ชาติ	2009	\N	\N	[]	[]	[]	["https://picsum.photos/seed/glc-english-1/900/600", "https://picsum.photos/seed/glc-english-2/900/600", "https://picsum.photos/seed/glc-english-3/900/600"]	\N	https://glcenglish.com	\N	from-green-500 to-teal-500	["ESL", "IELTS", "General English"]	f	t	15	2026-07-29 16:02:24.82939	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
40	winning-english	Winning English Academy	วินนิ่ง อิงลิช	Winning Method | ESL | IELTS | Cebu	Winning Method | ESL | IELTS	Cebu City	Philippines	\N	\N	4.5	150+	8+ ชาติ	2014	\N	\N	[]	[]	[]	["https://picsum.photos/seed/winning-english-1/900/600", "https://picsum.photos/seed/winning-english-2/900/600", "https://picsum.photos/seed/winning-english-3/900/600"]	\N	https://winningenglishschool.com	\N	from-yellow-500 to-orange-500	["ESL", "IELTS", "Winning Method"]	f	t	17	2026-07-29 16:02:24.843047	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
42	3d-academy	3D Academy	ทรีดี อคาเดมี	3D Learning System | ESL | Business | Cebu	3D System | ESL | Business	Cebu City	Philippines	\N	\N	4.5	200+	8+ ชาติ	2011	\N	\N	[]	[]	[]	["https://picsum.photos/seed/3d-academy-1/900/600", "https://picsum.photos/seed/3d-academy-2/900/600", "https://picsum.photos/seed/3d-academy-3/900/600"]	\N	https://3d-universal.com	\N	from-violet-500 to-purple-500	["3D System", "ESL", "Business"]	f	t	19	2026-07-29 16:02:24.850046	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
43	idea-english	IDEA English Academy	ไอเดีย อิงลิช	IDEA Method | IELTS | ESL | Cebu City	IDEA Method | IELTS | ESL	Cebu City	Philippines	\N	\N	4.5	150+	8+ ชาติ	2012	\N	\N	[]	[]	[]	["https://picsum.photos/seed/idea-english-1/900/600", "https://picsum.photos/seed/idea-english-2/900/600", "https://picsum.photos/seed/idea-english-3/900/600"]	\N	https://ideaenglish.net	\N	from-amber-500 to-yellow-500	["IDEA Method", "IELTS", "ESL"]	f	t	20	2026-07-29 16:02:24.852646	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
44	btes	BTES	บีทีอีเอส เซบู	Sparta | IELTS | TOEIC | Cebu City	Sparta | IELTS | TOEIC | เซบู	Cebu City	Philippines	\N	\N	4.5	200+	8+ ชาติ	2010	\N	\N	[]	[]	[]	["https://picsum.photos/seed/btes-1/900/600", "https://picsum.photos/seed/btes-2/900/600", "https://picsum.photos/seed/btes-3/900/600"]	\N	https://btes.ph	\N	from-red-500 to-pink-500	["Sparta", "IELTS", "TOEIC"]	f	t	21	2026-07-29 16:02:24.855355	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
47	beci	BECI Academy	เบซี อคาเดมี	Sparta | ESL | IELTS | บาเกียว	Sparta | ESL | IELTS | บาเกียว	Baguio City	Philippines	\N	\N	4.6	300+	10+ ชาติ	2007	\N	\N	[]	[]	[]	["https://picsum.photos/seed/beci-baguio-1/900/600", "https://picsum.photos/seed/beci-baguio-2/900/600", "https://picsum.photos/seed/beci-baguio-3/900/600"]	\N	https://beciedu.com	\N	from-emerald-600 to-green-600	["Sparta", "ESL", "IELTS"]	f	t	24	2026-07-29 16:02:24.863549	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
48	monol	MONOL International Education Center	โมนอล อินเตอร์เนชั่นแนล	Sparta | สถาบันขนาดใหญ่ | IELTS | บาเกียว	Sparta | วิทยาเขตใหญ่ | IELTS	Baguio City	Philippines	\N	\N	4.7	500+	15+ ชาติ	2002	\N	\N	[]	[]	[]	["https://picsum.photos/seed/monol-baguio-1/900/600", "https://picsum.photos/seed/monol-baguio-2/900/600", "https://picsum.photos/seed/monol-baguio-3/900/600"]	\N	https://monol.edu.ph	\N	from-blue-700 to-blue-600	["Sparta", "IELTS", "Big Campus", "Korean Mgmt"]	f	t	25	2026-07-29 16:02:24.86702	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
49	help-english	HELP English Academy	เฮลป์ อิงลิช อคาเดมี	Semi-Sparta | ESL | Affordable | บาเกียว	Semi-Sparta | ราคาประหยัด | บาเกียว	Baguio City	Philippines	\N	\N	4.5	150+	7+ ชาติ	2010	\N	\N	[]	[]	[]	["https://picsum.photos/seed/help-english-baguio-1/900/600", "https://picsum.photos/seed/help-english-baguio-2/900/600", "https://picsum.photos/seed/help-english-baguio-3/900/600"]	\N	https://helpenglish.org	\N	from-sky-500 to-blue-500	["Semi-Sparta", "ESL", "Affordable"]	f	t	26	2026-07-29 16:02:24.872246	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
3	philinter	Philinter Academy	ฟิลินเตอร์ อคาเดมี	\N	\N	Mactan, Cebu	Philippines	\N	\N	4.7	400+	10+ ชาติ	2003	\N	\N	[]	[]	[]	["https://picsum.photos/seed/philinter-1/900/600", "https://picsum.photos/seed/philinter-2/900/600", "https://picsum.photos/seed/philinter-3/900/600"]	\N	https://www.philinter.com	\N	from-green-800 to-green-600	["Business English", "Speaking", "Cambridge"]	t	t	0	2026-07-28 05:50:56.782413	2026-07-31 03:52:20.118153	{"rooms": [{"id": "dorm-single", "name": "Dormitory Single", "nameTh": "หอพักซิงเกิ้ล", "pricePerFourWeeks": 1400}, {"id": "dorm-double", "name": "Dormitory Double", "nameTh": "หอพักดับเบิ้ล", "pricePerFourWeeks": 970}, {"id": "dorm-triple", "name": "Dormitory Triple", "nameTh": "หอพักทริปเปิ้ล", "pricePerFourWeeks": 810}, {"id": "azon-single", "name": "AZON Condo Single", "nameTh": "AZON คอนโด ซิงเกิ้ล", "pricePerFourWeeks": 1690}, {"id": "azon-double", "name": "AZON Condo Double", "nameTh": "AZON คอนโด ดับเบิ้ล", "pricePerFourWeeks": 1100}, {"id": "azon-triple", "name": "AZON Condo Triple", "nameTh": "AZON คอนโด ทริปเปิ้ล", "pricePerFourWeeks": 890}], "courses": [{"id": "intensive-esl", "name": "Intensive ESL", "nameTh": "อินเทนซีฟ ESL", "pricePerFourWeeks": 1000}, {"id": "general-esl", "name": "General ESL", "nameTh": "เจนเนอรัล ESL", "pricePerFourWeeks": 870}, {"id": "ips", "name": "Intensive Power Speaking", "nameTh": "อินเทนซีฟ พาวเวอร์ สปีกกิ้ง", "pricePerFourWeeks": 1100}, {"id": "light-esl", "name": "Light ESL", "nameTh": "ไลต์ ESL", "pricePerFourWeeks": 750}, {"id": "ielts-intensive", "name": "IELTS Intensive", "nameTh": "IELTS อินเทนซีฟ", "pricePerFourWeeks": 1120}, {"id": "ielts-guar-8", "name": "IELTS Guarantee (8 wks)", "nameTh": "IELTS การันตี 8 สัปดาห์", "pricePerFourWeeks": 1120}, {"id": "ielts-guar-12", "name": "IELTS Guarantee (12 wks)", "nameTh": "IELTS การันตี 12 สัปดาห์", "pricePerFourWeeks": 1120}, {"id": "toeic-regular", "name": "TOEIC Regular", "nameTh": "TOEIC เรกูลาร์", "pricePerFourWeeks": 1040}, {"id": "toeic-guar-12", "name": "TOEIC Guarantee (12 wks)", "nameTh": "TOEIC การันตี 12 สัปดาห์", "pricePerFourWeeks": 1040}, {"id": "focus-industry", "name": "Focus Industry", "nameTh": "โฟกัส อินดัสทรี", "pricePerFourWeeks": 1190}, {"id": "basic-business", "name": "Basic Business", "nameTh": "เบสิค บิสสิเนส", "pricePerFourWeeks": 1060}, {"id": "advanced-business", "name": "Advanced Business", "nameTh": "แอดวานซ์ บิสสิเนส", "pricePerFourWeeks": 1110}, {"id": "premium-speaking", "name": "Premium Speaking (8wk min)", "nameTh": "พรีเมียม สปีกกิ้ง (ขั้นต่ำ 8 สป.)", "pricePerFourWeeks": 1400}, {"id": "junior-speaking", "name": "Junior Speaking (4-6 wks)", "nameTh": "จูเนียร์ สปีกกิ้ง", "pricePerFourWeeks": 1400}, {"id": "junior-esl", "name": "Junior ESL (7-17 yrs)", "nameTh": "จูเนียร์ ESL อายุ 7-17 ปี", "pricePerFourWeeks": 1300}, {"id": "junior-ielts", "name": "Junior IELTS (12-17 yrs)", "nameTh": "จูเนียร์ IELTS อายุ 12-17 ปี", "pricePerFourWeeks": 1450}], "enrollmentFee": 120, "promoDiscount": {"label": "ส่วนลดพิเศษสำหรับนักเรียน Philingo (12 สัปดาห์ขึ้นไป)", "enabled": true, "minWeeks": 12, "discountPerFourWeeks": 50}, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 22900, "8": 35040, "12": 52960, "16": 63400, "20": 74350, "24": 85800}, "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5, "localFeesByWeekAzon": {"4": 25100, "8": 38440, "12": 57560, "16": 69200, "20": 81350, "24": 94000}}	\N	\N	\N	\N	\N	\N
4	b-cebu	B'Cebu Language School	บี เซบู แลงกวิจ สคูล	\N	\N	Banilad, Cebu	Philippines	\N	\N	4.6	300+	10+ ชาติ	2015	\N	\N	[]	[]	[]	["https://picsum.photos/seed/bcebu-1/900/600", "https://picsum.photos/seed/bcebu-2/900/600", "https://picsum.photos/seed/bcebu-3/900/600"]	\N	https://bcebu.com	\N	from-blue-700 to-indigo-700	["New Campus", "Intensive", "IELTS"]	f	t	0	2026-07-28 05:50:56.786107	2026-07-31 03:52:20.118153	{"rooms": [{"id": "bcebu-single", "name": "Single Room", "nameTh": "ห้องเดี่ยว (Single)", "pricePerFourWeeks": 1350}, {"id": "bcebu-single-outer", "name": "Single (Outer View)", "nameTh": "ห้องเดี่ยว วิวด้านนอก", "pricePerFourWeeks": 1400}, {"id": "bcebu-twin-living", "name": "Twin+Living Room", "nameTh": "ห้องแฝด + ห้องนั่งเล่น (Twin+LR)", "pricePerFourWeeks": 1250}, {"id": "bcebu-twin", "name": "Twin Room", "nameTh": "ห้องแฝด (Twin)", "pricePerFourWeeks": 950}, {"id": "bcebu-2plus1", "name": "Triple 2+1 (Female only)", "nameTh": "2+1 ห้อง (หญิงเท่านั้น)", "pricePerFourWeeks": 900}, {"id": "bcebu-triple", "name": "Triple Room", "nameTh": "ห้อง 3 คน (Triple)", "pricePerFourWeeks": 750}], "courses": [{"id": "bcebu-speed-esl", "name": "Speed ESL (4×1:1 + 2 Group + 2 Optional)", "nameTh": "Speed ESL", "pricePerFourWeeks": 900}, {"id": "bcebu-intensive-esl", "name": "Intensive ESL (6×1:1 + 2 Optional)", "nameTh": "Intensive ESL", "pricePerFourWeeks": 1050}, {"id": "bcebu-sparta", "name": "B'Sparta (5×1:1 + 2 Group + 3 Sparta + 2 Self-Study)", "nameTh": "B'Sparta", "pricePerFourWeeks": 1050}, {"id": "bcebu-lite-esl-4", "name": "Lite ESL 4 (4×1:1)", "nameTh": "Lite ESL 4", "pricePerFourWeeks": 750}, {"id": "bcebu-lite-esl-2", "name": "Lite ESL 2 (2×1:1, อายุ 40+ ปีขึ้นไป)", "nameTh": "Lite ESL 2 (อายุ 40+)", "pricePerFourWeeks": 400}, {"id": "bcebu-business", "name": "Business English (4×1:1 + 2 Group + 2 Optional)", "nameTh": "Business English", "pricePerFourWeeks": 1050}, {"id": "bcebu-ielts", "name": "IELTS (4×1:1 + 2 Group + Morning Voca + 2 Mock)", "nameTh": "IELTS", "pricePerFourWeeks": 1000}, {"id": "bcebu-ielts-sparta", "name": "IELTS Sparta (4×1:1 + 2 Group + Sparta + 2 Mock + 2 Self-Study)", "nameTh": "IELTS Sparta", "pricePerFourWeeks": 1050}, {"id": "bcebu-ielts-guar", "name": "IELTS Guarantee (12 สัปดาห์เท่านั้น)", "nameTh": "IELTS Guarantee (12สป.เท่านั้น)", "pricePerFourWeeks": 1150}, {"id": "bcebu-junior-esl", "name": "Junior ESL (6×1:1, ป.ต้น–ม.ต้น)", "nameTh": "Junior ESL (ป.ต้น–ม.ต้น)", "pricePerFourWeeks": 1250}, {"id": "bcebu-kids-center", "name": "Kids Center (อายุ 4–6 ปี ไม่ได้เรียนอนุบาล)", "nameTh": "Kids Center (4–6 ปี)", "pricePerFourWeeks": 950}], "enrollmentFee": 100, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 21500, "8": 34630, "12": 51030, "16": 61460, "20": 71890, "24": 82320}, "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5}	\N	\N	\N	\N	\N	\N
12	bcebu	B'Cebu Language School	บีเซบู แลงกวิจ สคูล	Top-rated school with premium facilities	โรงเรียนระดับสูงพร้อมสิ่งอำนวยความสะดวกระดับพรีเมียม	Baguio City	Philippines	\N	\N	4.7	300+	22+	2008	B'Cebu Language School is a premium English school known for its excellent facilities and high-quality teaching.	B'Cebu Language School เป็นโรงเรียนภาษาอังกฤษระดับพรีเมียมที่ขึ้นชื่อเรื่องสิ่งอำนวยความสะดวกและการสอนคุณภาพสูง	["Premium Facilities", "Certified Filipino Teachers", "Modern Classrooms", "Visa Support"]	["Olympic Pool", "Gym", "Study Hall", "Cafeteria", "Wi-Fi"]	[{"w4": 850, "w8": 1600, "w12": 2300, "name": "Intensive English", "nameTh": "อิงลิชอินเทนซิฟ", "duration": "4-24 weeks"}]	["https://picsum.photos/seed/bcebu-baguio-1/900/600", "https://picsum.photos/seed/bcebu-baguio-2/900/600", "https://picsum.photos/seed/bcebu-baguio-3/900/600"]	\N	https://bcebu.com	\N	from-orange-500 to-orange-700	["Intensive", "Premium", "IELTS"]	t	t	4	2026-07-28 05:53:14.615929	2026-07-31 03:52:20.118153	{"rooms": [{"id": "bcebu-single", "name": "Single Room", "nameTh": "ห้องเดี่ยว (Single)", "pricePerFourWeeks": 1350}, {"id": "bcebu-single-outer", "name": "Single (Outer View)", "nameTh": "ห้องเดี่ยว วิวด้านนอก", "pricePerFourWeeks": 1400}, {"id": "bcebu-twin-living", "name": "Twin+Living Room", "nameTh": "ห้องแฝด + ห้องนั่งเล่น (Twin+LR)", "pricePerFourWeeks": 1250}, {"id": "bcebu-twin", "name": "Twin Room", "nameTh": "ห้องแฝด (Twin)", "pricePerFourWeeks": 950}, {"id": "bcebu-2plus1", "name": "Triple 2+1 (Female only)", "nameTh": "2+1 ห้อง (หญิงเท่านั้น)", "pricePerFourWeeks": 900}, {"id": "bcebu-triple", "name": "Triple Room", "nameTh": "ห้อง 3 คน (Triple)", "pricePerFourWeeks": 750}], "courses": [{"id": "bcebu-speed-esl", "name": "Speed ESL (4×1:1 + 2 Group + 2 Optional)", "nameTh": "Speed ESL", "pricePerFourWeeks": 900}, {"id": "bcebu-intensive-esl", "name": "Intensive ESL (6×1:1 + 2 Optional)", "nameTh": "Intensive ESL", "pricePerFourWeeks": 1050}, {"id": "bcebu-sparta", "name": "B'Sparta (5×1:1 + 2 Group + 3 Sparta + 2 Self-Study)", "nameTh": "B'Sparta", "pricePerFourWeeks": 1050}, {"id": "bcebu-lite-esl-4", "name": "Lite ESL 4 (4×1:1)", "nameTh": "Lite ESL 4", "pricePerFourWeeks": 750}, {"id": "bcebu-lite-esl-2", "name": "Lite ESL 2 (2×1:1, อายุ 40+ ปีขึ้นไป)", "nameTh": "Lite ESL 2 (อายุ 40+)", "pricePerFourWeeks": 400}, {"id": "bcebu-business", "name": "Business English (4×1:1 + 2 Group + 2 Optional)", "nameTh": "Business English", "pricePerFourWeeks": 1050}, {"id": "bcebu-ielts", "name": "IELTS (4×1:1 + 2 Group + Morning Voca + 2 Mock)", "nameTh": "IELTS", "pricePerFourWeeks": 1000}, {"id": "bcebu-ielts-sparta", "name": "IELTS Sparta (4×1:1 + 2 Group + Sparta + 2 Mock + 2 Self-Study)", "nameTh": "IELTS Sparta", "pricePerFourWeeks": 1050}, {"id": "bcebu-ielts-guar", "name": "IELTS Guarantee (12 สัปดาห์เท่านั้น)", "nameTh": "IELTS Guarantee (12สป.เท่านั้น)", "pricePerFourWeeks": 1150}, {"id": "bcebu-junior-esl", "name": "Junior ESL (6×1:1, ป.ต้น–ม.ต้น)", "nameTh": "Junior ESL (ป.ต้น–ม.ต้น)", "pricePerFourWeeks": 1250}, {"id": "bcebu-kids-center", "name": "Kids Center (อายุ 4–6 ปี ไม่ได้เรียนอนุบาล)", "nameTh": "Kids Center (4–6 ปี)", "pricePerFourWeeks": 950}], "enrollmentFee": 100, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 21000, "8": 31440, "12": 47150, "16": 56890, "20": 66630, "24": 76370}, "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5}	\N	\N	\N	\N	\N	\N
5	cpils	CPILS	ซีพีไอแอลเอส	\N	\N	Cebu City	Philippines	\N	\N	4.7	600+	15+ ชาติ	1999	\N	\N	[]	[]	[]	["https://picsum.photos/seed/cpils-1/900/600", "https://picsum.photos/seed/cpils-2/900/600", "https://picsum.photos/seed/cpils-3/900/600"]	\N	https://www.cpils.com	\N	from-orange-500 to-amber-600	["Native Teachers", "ESL", "TOEIC", "IELTS"]	f	t	0	2026-07-28 05:50:56.791386	2026-07-31 03:52:20.118153	{"rooms": [{"id": "cpils-single", "name": "Single Dormitory", "nameTh": "ห้องเดี่ยว (Single Dorm)", "pricePerFourWeeks": 995}, {"id": "cpils-twin", "name": "Twin Dormitory", "nameTh": "ห้องแฝด (Twin Dorm)", "pricePerFourWeeks": 840}, {"id": "cpils-triple", "name": "Triple Dormitory", "nameTh": "ห้อง 3 คน (Triple Dorm)", "pricePerFourWeeks": 775}, {"id": "cpils-quad", "name": "Quadruple Dormitory", "nameTh": "ห้อง 4 คน (Quad Dorm)", "pricePerFourWeeks": 700}, {"id": "cpils-prem-single", "name": "Premium Single", "nameTh": "ห้องเดี่ยว Premium", "pricePerFourWeeks": 1085}, {"id": "cpils-prem-twin", "name": "Premium Twin", "nameTh": "ห้องแฝด Premium", "pricePerFourWeeks": 910}, {"id": "cpils-prem-triple", "name": "Premium Triple", "nameTh": "ห้อง 3 คน Premium", "pricePerFourWeeks": 850}, {"id": "cpils-prem-quad", "name": "Premium Quadruple", "nameTh": "ห้อง 4 คน Premium", "pricePerFourWeeks": 780}], "courses": [{"id": "cpils-esl-light", "name": "ESL Light", "nameTh": "ESL Light (คอร์สเบา)", "pricePerFourWeeks": 600}, {"id": "cpils-general-esl", "name": "General ESL / ESL Plus", "nameTh": "General ESL / ESL Plus", "pricePerFourWeeks": 935}, {"id": "cpils-esl-premium", "name": "ESL Premium", "nameTh": "ESL Premium", "pricePerFourWeeks": 1040}, {"id": "cpils-sparta", "name": "Premier Sparta", "nameTh": "Premier Sparta", "pricePerFourWeeks": 1040}, {"id": "cpils-business", "name": "PMC & Business English", "nameTh": "Business English / PMC (min 4สป.)", "pricePerFourWeeks": 1040}, {"id": "cpils-medical", "name": "Medical English", "nameTh": "Medical English (max 12สป.)", "pricePerFourWeeks": 1040}, {"id": "cpils-hospitality", "name": "Hotel & Hospitality", "nameTh": "Hotel & Hospitality (max 12สป.)", "pricePerFourWeeks": 1040}, {"id": "cpils-tesol", "name": "TESOL (Adult / Junior)", "nameTh": "TESOL (max 12สป.)", "pricePerFourWeeks": 1040}, {"id": "cpils-working", "name": "Working Holiday / Visa", "nameTh": "Working Holiday / Visa (max 12สป.)", "pricePerFourWeeks": 1040}, {"id": "cpils-toeic-toefl", "name": "TOEIC / TOEFL", "nameTh": "TOEIC / TOEFL", "pricePerFourWeeks": 1040}, {"id": "cpils-ielts", "name": "IELTS", "nameTh": "IELTS", "pricePerFourWeeks": 1097}, {"id": "cpils-toeic-guar", "name": "TOEIC Guarantee (12สป.เท่านั้น — total $3,396)", "nameTh": "TOEIC Guarantee (12สป.)", "pricePerFourWeeks": 1132}, {"id": "cpils-ielts-guar-8", "name": "IELTS Guarantee (8สป.เท่านั้น — total $2,495)", "nameTh": "IELTS Guarantee (8สป.)", "pricePerFourWeeks": 1248}, {"id": "cpils-ielts-guar-12", "name": "IELTS Guarantee (12สป.เท่านั้น — total $3,569)", "nameTh": "IELTS Guarantee (12สป.)", "pricePerFourWeeks": 1190}], "enrollmentFee": 125, "promoDiscount": {"label": "", "enabled": false, "minWeeks": 4, "discountPerFourWeeks": 0}, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 21800, "8": 32730, "12": 44930, "16": 55170, "20": 65410, "24": 75650}, "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5}	\N	\N	\N	\N	\N	\N
64	we-academy-iloilo	We Academy Iloilo	วี อคาเดมี อิโลอิโล	ศูนย์สอบ IELTS Computer-Based | สระว่ายน้ำ | Jaro	ศูนย์สอบ IELTS | สระว่ายน้ำ | อิโลอิโล	Jaro, Iloilo City	Philippines	\N	\N	4.5	300+	10+ ชาติ	2010	\N	\N	[]	[]	[]	["https://picsum.photos/seed/we-academy-iloilo-iloilo-1/900/600", "https://picsum.photos/seed/we-academy-iloilo-iloilo-2/900/600", "https://picsum.photos/seed/we-academy-iloilo-iloilo-3/900/600"]	\N	https://www.weacademy-iloilo.com	\N	from-sky-500 to-blue-600	["IELTS Computer-Based", "ESL", "IELTS", "Swimming Pool"]	f	t	41	2026-07-29 16:02:24.930603	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
6	ev-academy	EV Academy	อีวี อคาเดมี	\N	\N	Cebu City	Philippines	\N	\N	4.7	400+	20+ ชาติ	2010	\N	\N	[]	[]	[]	["https://picsum.photos/seed/ev-academy-1/900/600", "https://picsum.photos/seed/ev-academy-2/900/600", "https://picsum.photos/seed/ev-academy-3/900/600"]	\N	https://www.ev-academy.com	\N	from-amber-600 to-yellow-600	["Resort Style", "French Owner", "IELTS"]	f	t	0	2026-07-28 05:50:56.79547	2026-07-31 03:52:20.118153	{"rooms": [{"id": "dorm-single", "name": "Dormitory Single", "nameTh": "หอพักซิงเกิ้ล", "pricePerFourWeeks": 1400}, {"id": "dorm-double", "name": "Dormitory Double", "nameTh": "หอพักดับเบิ้ล", "pricePerFourWeeks": 1030}, {"id": "dorm-triple", "name": "Dormitory Triple", "nameTh": "หอพักทริปเปิ้ล", "pricePerFourWeeks": 950}, {"id": "dorm-quad", "name": "Dormitory Quadruple", "nameTh": "หอพัก 4 คน (Quadruple)", "pricePerFourWeeks": 900}, {"id": "azon-condo-single", "name": "Condo Avida Riala Single (Semi only)", "nameTh": "คอนโด Avida Riala ซิงเกิ้ล (เซมิเท่านั้น)", "pricePerFourWeeks": 1550}, {"id": "azon-condo-double", "name": "Condo Avida Riala Double (Semi only)", "nameTh": "คอนโด Avida Riala ดับเบิ้ล (เซมิเท่านั้น)", "pricePerFourWeeks": 1150}], "courses": [{"id": "sparta-intensive-esl", "name": "Intensive ESL (Sparta)", "nameTh": "Intensive ESL (สปาร์ต้า)", "pricePerFourWeeks": 1030}, {"id": "sparta-ielts", "name": "IELTS Guarantee (Sparta) – min 8wk", "nameTh": "IELTS Guarantee (สปาร์ต้า) เริ่มต้น 8 สป.", "pricePerFourWeeks": 1290}, {"id": "sparta-specific", "name": "Specific Courses – IELTS/TOEIC/Business (Sparta)", "nameTh": "IELTS/TOEIC/Business/Digital (สปาร์ต้า)", "pricePerFourWeeks": 1150}, {"id": "sparta-ps6", "name": "Power Speaking 6 (Sparta)", "nameTh": "Power Speaking 6 (สปาร์ต้า)", "pricePerFourWeeks": 1230}, {"id": "sparta-ps8", "name": "Power Speaking 8 (Sparta)", "nameTh": "Power Speaking 8 (สปาร์ต้า)", "pricePerFourWeeks": 1410}, {"id": "semi-esl-classic", "name": "ESL Classic (Semi-Sparta)", "nameTh": "ESL Classic (เซมิสปาร์ต้า)", "pricePerFourWeeks": 980}, {"id": "semi-specific", "name": "Specific Courses – TOEIC/Business (Semi-Sparta)", "nameTh": "TOEIC/Business/Digital (เซมิสปาร์ต้า)", "pricePerFourWeeks": 1100}, {"id": "semi-ps6", "name": "Power Speaking 6 (Semi-Sparta)", "nameTh": "Power Speaking 6 (เซมิสปาร์ต้า)", "pricePerFourWeeks": 1180}, {"id": "semi-ps8", "name": "Power Speaking 8 (Semi-Sparta)", "nameTh": "Power Speaking 8 (เซมิสปาร์ต้า)", "pricePerFourWeeks": 1360}], "enrollmentFee": 100, "promoDiscount": {"label": "ส่วนลดพิเศษสำหรับนักเรียน Philingo ลด $100 ทุก ๆ 4 สัปดาห์", "enabled": true, "minWeeks": 4, "discountPerFourWeeks": 100}, "durationOptions": [4, 8, 12, 16, 20, 24], "localFeesByWeek": {"4": 22000, "8": 34000, "12": 51000, "16": 62000, "20": 72000, "24": 83000}, "exchangeRatePhpThb": 0.5, "exchangeRateUsdThb": 33.5}	\N	\N	\N	\N	\N	\N
52	wales-english	WALES English Academy	เวลส์ อิงลิช อคาเดมี	Semi-Sparta | ESL | IELTS | บาเกียว	Semi-Sparta | ESL | IELTS | บาเกียว	Baguio City	Philippines	\N	\N	4.5	150+	7+ ชาติ	2011	\N	\N	[]	[]	[]	["https://picsum.photos/seed/wales-english-baguio-1/900/600", "https://picsum.photos/seed/wales-english-baguio-2/900/600", "https://picsum.photos/seed/wales-english-baguio-3/900/600"]	\N	https://walesacademy.com	\N	from-teal-500 to-cyan-500	["Semi-Sparta", "ESL", "IELTS"]	f	t	29	2026-07-29 16:02:24.88261	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
53	cns-academy	CNS Academy	ซีเอ็นเอส อคาเดมี	Sparta | ESL | TOEIC | บาเกียว	Sparta | ESL | TOEIC | บาเกียว	Baguio City	Philippines	\N	\N	4.5	120+	6+ ชาติ	2009	\N	\N	[]	[]	[]	["https://picsum.photos/seed/cns-academy-baguio-1/900/600", "https://picsum.photos/seed/cns-academy-baguio-2/900/600", "https://picsum.photos/seed/cns-academy-baguio-3/900/600"]	\N	https://cnsenglish.com	\N	from-orange-500 to-amber-500	["Sparta", "ESL", "TOEIC"]	f	t	30	2026-07-29 16:02:24.885423	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
54	cip-english	CIP English Academy	ซีไอพี อิงลิช อคาเดมี	Comprehensive English | IELTS | Business | บาเกียว	ครบครัน | IELTS | Business	Baguio City	Philippines	\N	\N	4.6	200+	8+ ชาติ	2005	\N	\N	[]	[]	[]	["https://picsum.photos/seed/cip-english-baguio-1/900/600", "https://picsum.photos/seed/cip-english-baguio-2/900/600", "https://picsum.photos/seed/cip-english-baguio-3/900/600"]	\N	https://cipenglish.net	\N	from-indigo-600 to-violet-600	["Comprehensive", "IELTS", "Business"]	f	t	31	2026-07-29 16:02:24.888275	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
55	eg-academy	EG Academy	อีจี อคาเดมี	ESL | Speaking | Sparta | บาเกียว	ESL | Speaking | Sparta | บาเกียว	Baguio City	Philippines	\N	\N	4.4	100+	6+ ชาติ	2012	\N	\N	[]	[]	[]	["https://picsum.photos/seed/eg-academy-baguio-1/900/600", "https://picsum.photos/seed/eg-academy-baguio-2/900/600", "https://picsum.photos/seed/eg-academy-baguio-3/900/600"]	\N	https://egesl.com	\N	from-gray-500 to-slate-500	["ESL", "Sparta", "Speaking"]	f	t	32	2026-07-29 16:02:24.891058	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
57	we-academy	WE Academy (Clark)	วี อคาเดมี (คลาร์ก)	ESL | Speaking Focus | Clark Freeport Zone	ESL | Speaking | คลาร์ก	Clark Freeport Zone	Philippines	\N	\N	4.4	150+	7+ ชาติ	2015	\N	\N	[]	[]	[]	["https://picsum.photos/seed/we-academy-clark-1/900/600", "https://picsum.photos/seed/we-academy-clark-2/900/600", "https://picsum.photos/seed/we-academy-clark-3/900/600"]	\N	https://clarkweacademy.com	\N	from-sky-500 to-blue-500	["ESL", "Speaking", "Clark"]	f	t	34	2026-07-29 16:02:24.897882	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
58	gs-academy	GS Academy (NELS)	จีเอส อคาเดมี (เนลส์)	General English | ESL | Clark, Pampanga	General English | ESL | คลาร์ก	Clark, Pampanga	Philippines	\N	\N	4.4	100+	6+ ชาติ	2012	\N	\N	[]	[]	[]	["https://picsum.photos/seed/gs-academy-clark-1/900/600", "https://picsum.photos/seed/gs-academy-clark-2/900/600", "https://picsum.photos/seed/gs-academy-clark-3/900/600"]	\N	https://gsnels.com	\N	from-green-500 to-teal-500	["ESL", "General English", "Clark"]	f	t	35	2026-07-29 16:02:24.900551	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
59	mk-education	MK Education (Clark)	เอ็มเค เอดูเคชั่น (คลาร์ก)	ESL | IELTS | Clark, Angeles City	ESL | IELTS | คลาร์ก	Clark, Angeles City	Philippines	\N	\N	4.4	150+	7+ ชาติ	2011	\N	\N	[]	[]	[]	["https://picsum.photos/seed/mk-education-clark-1/900/600", "https://picsum.photos/seed/mk-education-clark-2/900/600", "https://picsum.photos/seed/mk-education-clark-3/900/600"]	\N	https://mk-edu.com	\N	from-amber-500 to-orange-500	["ESL", "IELTS", "Clark"]	f	t	36	2026-07-29 16:02:24.903437	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
60	e-room	E-Room Language Center	อี-รูม แลงกวิจ เซ็นเตอร์	Online + Onsite | ESL | Manila	ออนไลน์ + ออนไซต์ | ESL | มะนิลา	Manila	Philippines	\N	\N	4.4	100+	6+ ชาติ	2015	\N	\N	[]	[]	[]	["https://picsum.photos/seed/e-room-manila-1/900/600", "https://picsum.photos/seed/e-room-manila-2/900/600", "https://picsum.photos/seed/e-room-manila-3/900/600"]	\N	https://e-roominc.com	\N	from-blue-500 to-indigo-500	["ESL", "Online", "Business", "Manila"]	f	t	37	2026-07-29 16:02:24.906771	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
61	lslc	LSLC Language Skills Institute	แอลเอสแอลซี มะนิลา	Professional ESL | Business | Manila	ESL วิชาชีพ | Business | มะนิลา	Manila	Philippines	\N	\N	4.4	150+	8+ ชาติ	2008	\N	\N	[]	[]	[]	["https://picsum.photos/seed/lslc-manila-1/900/600", "https://picsum.photos/seed/lslc-manila-2/900/600", "https://picsum.photos/seed/lslc-manila-3/900/600"]	\N	https://lslc.edu.ph	\N	from-teal-500 to-green-500	["ESL", "Professional", "Business"]	f	t	38	2026-07-29 16:02:24.917138	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
63	wesli	WESLI	เวสลี่ มะนิลา	ESL | Eastwood Manila | Business	ESL | Eastwood | มะนิลา	Manila	Philippines	\N	\N	4.4	100+	6+ ชาติ	2010	\N	\N	[]	[]	[]	["https://picsum.photos/seed/wesli-manila-1/900/600", "https://picsum.photos/seed/wesli-manila-2/900/600", "https://picsum.photos/seed/wesli-manila-3/900/600"]	\N	https://wesli.com.ph	\N	from-rose-500 to-pink-500	["ESL", "Eastwood", "Business"]	f	t	40	2026-07-29 16:02:24.924534	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
66	mk-education-iloilo	MK Education Iloilo	เอ็มเค เอดูเคชั่น อิโลอิโล	Family Program | Business English | Mandurriao	Family Program | Business English	Mandurriao, Iloilo City	Philippines	\N	\N	4.4	150+	6+ ชาติ	2012	\N	\N	[]	[]	[]	["https://picsum.photos/seed/mk-education-iloilo-iloilo-1/900/600", "https://picsum.photos/seed/mk-education-iloilo-iloilo-2/900/600", "https://picsum.photos/seed/mk-education-iloilo-iloilo-3/900/600"]	\N	https://www.mk-edu.net	\N	from-amber-500 to-orange-500	["Family Program", "Business English", "IELTS"]	f	t	43	2026-07-29 16:02:24.937493	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
67	pia-iloilo	PIA (Polyglot International Academy) Iloilo	พีไอเอ อิโลอิโล	โรงเรียนรุ่นใหม่ | ห้องเรียนเล็ก | Mandurriao	รุ่นใหม่ | ห้องเรียนเล็ก | อิโลอิโล	Mandurriao, Iloilo City	Philippines	\N	\N	4.5	150+	8+ ชาติ	2018	\N	\N	[]	[]	[]	["https://picsum.photos/seed/pia-iloilo-iloilo-1/900/600", "https://picsum.photos/seed/pia-iloilo-iloilo-2/900/600", "https://picsum.photos/seed/pia-iloilo-iloilo-3/900/600"]	\N	https://iloilopia.com	\N	from-purple-500 to-violet-600	["Modern", "Small Class", "ESL", "Speaking"]	f	t	44	2026-07-29 16:02:24.940245	2026-07-31 03:52:20.118153	null	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 3692 (class 0 OID 16607)
-- Dependencies: 242
-- Data for Name: seminar_registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seminar_registrations (id, event_name, name, email, phone, school_interest, program_interest, num_participants, special_requests, utm_source, utm_medium, utm_campaign, status, admin_notes, created_at) FROM stdin;
2	Philingo Cebu Online Education Fair 2026	ทดสอบ		0816564159	CIA, QQ English	\N	\N	\N	\N	\N	\N	new	\N	2026-07-31 07:36:02.520466
3	Philingo Cebu Online Education Fair 2026	ทดสอบ สมชาย	info@thaistudyabroad.com	081-656-4159	CIA, QQ English	IELTS	2	ต้องการล่ามภาษาไทย	\N	\N	\N	new	\N	2026-07-31 07:41:36.841198
4	Philingo Cebu Online Education Fair 2026	ทดสอบ ระบบ	test-seminar-reg@philingo.co.th	0812345678	QQ English, CIA	IELTS Preparation	1	อายุ: 25 ปี | การศึกษา: ปริญญาตรี | ระดับอังกฤษ: ปานกลาง (Intermediate) | วันที่ต้องการ: 2026-08-29 | คำถาม: อยากทราบค่าใช้จ่ายรวมสำหรับ IELTS 12 สัปดาห์ที่ CIA	\N	\N	\N	new	\N	2026-08-02 04:32:44.93029
5	Philingo Cebu Online Education Fair 2026	อภิชยา มะโนลา	info@thaistudyabroad.com	0956362445	B'Cebu, EV Academy, Philinter Academy, QQ English	General English	1	อายุ: 42 ปี | การศึกษา: ปริญญาตรี | ระดับอังกฤษ: เริ่มต้น (Beginner) | วันที่ต้องการ: all	\N	\N	\N	new	\N	2026-08-06 15:35:19.129934
\.


--
-- TOC entry 3694 (class 0 OID 16618)
-- Dependencies: 244
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.site_settings (id, key, value, "group", label, created_at, updated_at) FROM stdin;
10	ga4_id		analytics	Google Analytics 4 ID	2026-07-28 05:50:56.757478	2026-07-28 05:50:56.757478
11	fb_pixel_id		analytics	Facebook Pixel ID	2026-07-28 05:50:56.76114	2026-07-28 05:50:56.76114
12	gtm_id		analytics	Google Tag Manager ID	2026-07-28 05:50:56.765419	2026-07-28 05:50:56.765419
14	site_tagline	Study English, Live Philippines	general	Site Tagline	2026-07-28 05:53:14.716573	2026-07-28 05:53:14.716573
16	admin_email	admin@philingo.com	contact	Admin Email	2026-07-28 05:53:14.725955	2026-07-28 05:53:14.725955
22	site_url	https://philingo.com	general	Site URL	2026-07-28 05:53:14.742296	2026-07-28 05:53:14.742296
8	tiktok_url	https://www.tiktok.com/@philingo	social	TikTok URL	2026-07-28 05:50:56.660113	2026-08-02 06:15:18.855
21	youtube_url	https://youtube.com/@philingo	social	YouTube URL	2026-07-28 05:53:14.737036	2026-08-02 06:15:18.859
78	line_official_add_url	https://lin.ee/zmlkhOn0	general	\N	2026-07-30 10:22:03.110171	2026-07-30 10:22:03.110171
60	notification_email	info@thaistudyabroad.com	notifications	อีเมลรับแจ้งเตือนฟอร์ม	2026-07-29 16:15:10.40706	2026-08-02 06:15:18.867
61	line_notify_token		notifications	LINE Notify Token	2026-07-29 16:15:10.412068	2026-08-02 06:15:18.871
876	seminar_meet_link		general	\N	2026-08-02 05:20:15.983344	2026-08-02 06:15:18.875
990	event_reply_subject		general	\N	2026-08-02 06:15:18.878344	2026-08-02 06:15:18.878344
991	event_reply_body		general	\N	2026-08-02 06:15:18.881619	2026-08-02 06:15:18.881619
992	image_protection	off	general	\N	2026-08-02 06:15:18.885069	2026-08-02 06:15:18.885069
701	startup_migration_v1_done	2026-08-01T01:19:15.220Z	system	Startup migration v1 — completed at this timestamp	2026-08-01 01:19:15.221649	2026-08-01 01:19:15.221649
985	seo_title	Philingo — เรียนภาษาอังกฤษที่ฟิลิปปินส์ อันดับ 1 ของไทย	general	\N	2026-08-02 06:15:18.863072	2026-08-02 06:31:22.420491
986	seo_description	บริการส่งนักเรียนไทยเรียนภาษาอังกฤษที่ฟิลิปปินส์ครบวงจร ราคาดี มีทีมดูแล	general	\N	2026-08-02 06:15:18.865747	2026-08-02 06:31:22.529212
1	site_name	Philingo	general	ชื่อเว็บไซต์	2026-07-28 05:50:56.621232	2026-08-02 06:15:18.708
2	site_description	บริการส่งนักเรียนไทยเรียนภาษาอังกฤษที่ฟิลิปปินส์ครบวงจร	general	คำอธิบายเว็บไซต์	2026-07-28 05:50:56.630998	2026-08-02 06:15:18.815
3	contact_email	philingoedu@gmail.com	contact	อีเมลติดต่อ	2026-07-28 05:50:56.640197	2026-08-02 06:15:18.821
4	phone	061-656-4159	contact	เบอร์โทร	2026-07-28 05:50:56.644191	2026-08-02 06:15:18.825
5	address	88/27 The City Pinklao\nถนนบรมราชชนนี แขวงศาลาธรรมสพน์\nเขตทวีวัฒนา กรุงเทพฯ 10170	contact	ที่อยู่	2026-07-28 05:50:56.649142	2026-08-02 06:15:18.83
7	facebook_url	https://www.facebook.com/philingo.th	social	Facebook URL	2026-07-28 05:50:56.656233	2026-08-02 06:15:18.833
979	messenger_url		general	\N	2026-08-02 06:15:18.837793	2026-08-02 06:15:18.837793
6	line_id	@philingo	social	LINE ID	2026-07-28 05:50:56.652828	2026-08-02 06:15:18.844
9	line_url	https://lin.ee/pHTqKA9J	social	LINE URL	2026-07-28 05:50:56.752556	2026-08-02 06:15:18.847
20	instagram_url	https://instagram.com/philingo	social	Instagram URL	2026-07-28 05:53:14.732647	2026-08-02 06:15:18.852
79	analytics_views_total	460	analytics	\N	2026-07-30 14:34:09.96979	2026-08-06 17:19:21.219
80	analytics_views_date	2026-08-06	analytics	\N	2026-07-30 14:34:09.979785	2026-08-06 17:19:21.219
81	analytics_views_today	38	analytics	\N	2026-07-30 14:34:09.983845	2026-08-06 17:19:21.219
\.


--
-- TOC entry 3686 (class 0 OID 16572)
-- Dependencies: 236
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.team_members (id, name, name_th, role, role_th, bio, bio_th, avatar_url, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3676 (class 0 OID 16503)
-- Dependencies: 226
-- Data for Name: testimonials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.testimonials (id, name, name_th, school, school_th, program, score_before, score_after, content, content_th, avatar_url, initials, rating, is_featured, is_active, sort_order, created_at, updated_at) FROM stdin;
1	สมหญิง ใจดี	\N	PINES International Academy	\N	Sparta IELTS	4.5	6.5	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	\N	สจ	5	t	t	1	2026-07-28 05:50:56.930264	2026-07-28 05:50:56.930264
2	วีรชัย นพรัตน์	\N	QQ English	\N	Callan General English	\N	\N	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	\N	วน	5	t	t	2	2026-07-28 05:50:56.935393	2026-07-28 05:50:56.935393
3	ปณิตา เรืองเดช	\N	CIA Cebu International Academy	\N	Semi-Sparta TOEIC	500	785	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	\N	ปร	5	t	t	3	2026-07-28 05:50:56.941959	2026-07-28 05:50:56.941959
4	กิตติพงษ์ สุขสวัสดิ์	\N	SMEAG Global School	\N	Classic English	\N	\N	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	\N	กส	5	f	t	4	2026-07-28 05:50:56.946266	2026-07-28 05:50:56.946266
5	นภัสสร จันทร์สว่าง	\N	Philinter Academy	\N	Business English	\N	\N	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	\N	นจ	4	f	t	5	2026-07-28 05:50:56.95131	2026-07-28 05:50:56.95131
6	ธีระ วงษ์สุวรรณ	\N	EV Academy	\N	IELTS Preparation	\N	\N	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	\N	ธว	5	f	t	6	2026-07-28 05:50:56.955446	2026-07-28 05:50:56.955446
7	Somchai K.	สมชาย ก.	SMEAG Capital	เอสเอ็มอีเอจี แคปิตอล	IELTS Preparation	5.0	7.0	After 12 weeks at SMEAG, my IELTS score jumped from 5.0 to 7.0. Philingo made everything so easy - from booking to visa support. I'm now accepted at my dream university in Australia!	หลังจาก 12 สัปดาห์ที่ SMEAG คะแนน IELTS ของฉันพุ่งจาก 5.0 เป็น 7.0 Philingo ทำให้ทุกอย่างง่ายมาก ตั้งแต่การจองไปจนถึงการสนับสนุนวีซ่า ตอนนี้ฉันได้รับการตอบรับจากมหาวิทยาลัยในฝันในออสเตรเลียแล้ว!	\N	SK	5	t	t	1	2026-07-28 05:53:14.704967	2026-07-28 05:53:14.704967
8	Nattaya P.	ณัฐยา พ.	CIA	ซีไอเอ	General English	\N	\N	I studied at CIA for 8 weeks and my English improved dramatically. The teachers are excellent and the facilities are world-class. Philingo's support before and during my stay was invaluable.	ฉันเรียนที่ CIA 8 สัปดาห์และภาษาอังกฤษของฉันพัฒนาขึ้นอย่างมาก ครูยอดเยี่ยมมากและสิ่งอำนวยความสะดวกระดับโลก การสนับสนุนของ Philingo ก่อนและระหว่างการพักของฉันมีค่ามาก	\N	NP	5	t	t	2	2026-07-28 05:53:14.704967	2026-07-28 05:53:14.704967
9	Arjun S.	อาร์จัน ส.	QQ English	คิวคิว อิงลิช	TOEIC Preparation	550	850	QQ English is fantastic. The Circle Method really works! My TOEIC score went from 550 to 850 in just 8 weeks. I highly recommend Philingo for anyone looking to study in the Philippines.	QQ English ยอดเยี่ยมมาก วิธี Circle Method ใช้ได้จริง! คะแนน TOEIC ของฉันไปจาก 550 เป็น 850 ในเพียง 8 สัปดาห์ ฉันแนะนำ Philingo อย่างยิ่งสำหรับทุกคนที่ต้องการเรียนในฟิลิปปินส์	\N	AS	5	t	t	3	2026-07-28 05:53:14.704967	2026-07-28 05:53:14.704967
10	Wanida T.	วนิดา ต.	PINES International	ไพนส์ อินเตอร์เนชั่นแนล	General English	\N	\N	Baguio is such a beautiful city and PINES is a great school. The cool weather makes studying so comfortable. Philingo helped me choose the right school for my goals.	บาเกียวเป็นเมืองที่สวยงามมากและ PINES เป็นโรงเรียนที่ยอดเยี่ยม อากาศเย็นทำให้การเรียนสบายมาก Philingo ช่วยให้ฉันเลือกโรงเรียนที่เหมาะกับเป้าหมายของฉัน	\N	WT	5	f	t	4	2026-07-28 05:53:14.704967	2026-07-28 05:53:14.704967
11	Chaichana B.	ชัยชนะ บ.	B'Cebu	บีเซบู	Intensive English	\N	\N	B'Cebu has amazing facilities including an Olympic swimming pool! The teachers are professional and the study environment is excellent. I improved my English significantly in just 4 weeks.	B'Cebu มีสิ่งอำนวยความสะดวกที่น่าทึ่งรวมถึงสระว่ายน้ำโอลิมปิก! ครูเป็นมืออาชีพและสภาพแวดล้อมการเรียนยอดเยี่ยม ฉันพัฒนาภาษาอังกฤษอย่างมีนัยสำคัญในเพียง 4 สัปดาห์	\N	CB	4	f	t	5	2026-07-28 05:53:14.704967	2026-07-28 05:53:14.704967
12	Malee R.	มาลี ร.	Philinter	ฟิลอินเตอร์	IELTS Preparation	5.5	6.5	Philinter was the perfect choice for my budget. The one-on-one classes really accelerated my progress. Philingo's team was helpful throughout the entire process.	Philinter เป็นตัวเลือกที่สมบูรณ์แบบสำหรับงบประมาณของฉัน ชั้นเรียนแบบตัวต่อตัวช่วยเร่งความก้าวหน้าของฉันจริงๆ ทีมของ Philingo ให้ความช่วยเหลือตลอดกระบวนการ	\N	MR	5	f	t	6	2026-07-28 05:53:14.704967	2026-07-28 05:53:14.704967
14	วีรชัย นพรัตน์	\N	QQ English	\N	Callan General English	\N	\N	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	\N	วน	5	t	t	2	2026-07-29 16:02:24.996753	2026-07-29 16:02:24.996753
15	ปณิตา เรืองเดช	\N	CIA Cebu International Academy	\N	Semi-Sparta TOEIC	500	785	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	\N	ปร	5	t	t	3	2026-07-29 16:02:24.99966	2026-07-29 16:02:24.99966
16	กิตติพงษ์ สุขสวัสดิ์	\N	SMEAG Global School	\N	Classic English	\N	\N	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	\N	กส	5	f	t	4	2026-07-29 16:02:25.002296	2026-07-29 16:02:25.002296
17	นภัสสร จันทร์สว่าง	\N	Philinter Academy	\N	Business English	\N	\N	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	\N	นจ	4	f	t	5	2026-07-29 16:02:25.005383	2026-07-29 16:02:25.005383
18	ธีระ วงษ์สุวรรณ	\N	EV Academy	\N	IELTS Preparation	\N	\N	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	\N	ธว	5	f	t	6	2026-07-29 16:02:25.008957	2026-07-29 16:02:25.008957
20	วีรชัย นพรัตน์	\N	QQ English	\N	Callan General English	\N	\N	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	\N	วน	5	t	t	2	2026-07-29 16:15:10.501671	2026-07-29 16:15:10.501671
21	ปณิตา เรืองเดช	\N	CIA Cebu International Academy	\N	Semi-Sparta TOEIC	500	785	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	\N	ปร	5	t	t	3	2026-07-29 16:15:10.515101	2026-07-29 16:15:10.515101
22	กิตติพงษ์ สุขสวัสดิ์	\N	SMEAG Global School	\N	Classic English	\N	\N	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	\N	กส	5	f	t	4	2026-07-29 16:15:10.51814	2026-07-29 16:15:10.51814
23	นภัสสร จันทร์สว่าง	\N	Philinter Academy	\N	Business English	\N	\N	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	\N	นจ	4	f	t	5	2026-07-29 16:15:10.521234	2026-07-29 16:15:10.521234
24	ธีระ วงษ์สุวรรณ	\N	EV Academy	\N	IELTS Preparation	\N	\N	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	\N	ธว	5	f	t	6	2026-07-29 16:15:10.523596	2026-07-29 16:15:10.523596
25	สมหญิง ใจดี	\N	PINES International Academy	\N	Sparta IELTS	4.5	6.5	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	\N	สจ	5	t	t	1	2026-07-29 16:25:34.301365	2026-07-29 16:25:34.301365
26	วีรชัย นพรัตน์	\N	QQ English	\N	Callan General English	\N	\N	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	\N	วน	5	t	t	2	2026-07-29 16:25:34.304613	2026-07-29 16:25:34.304613
27	ปณิตา เรืองเดช	\N	CIA Cebu International Academy	\N	Semi-Sparta TOEIC	500	785	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	\N	ปร	5	t	t	3	2026-07-29 16:25:34.307039	2026-07-29 16:25:34.307039
28	กิตติพงษ์ สุขสวัสดิ์	\N	SMEAG Global School	\N	Classic English	\N	\N	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	\N	กส	5	f	t	4	2026-07-29 16:25:34.309349	2026-07-29 16:25:34.309349
29	นภัสสร จันทร์สว่าง	\N	Philinter Academy	\N	Business English	\N	\N	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	\N	นจ	4	f	t	5	2026-07-29 16:25:34.311735	2026-07-29 16:25:34.311735
30	ธีระ วงษ์สุวรรณ	\N	EV Academy	\N	IELTS Preparation	\N	\N	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	\N	ธว	5	f	t	6	2026-07-29 16:25:34.315036	2026-07-29 16:25:34.315036
31	สมหญิง ใจดี	\N	PINES International Academy	\N	Sparta IELTS	4.5	6.5	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	\N	สจ	5	t	t	1	2026-07-30 15:17:58.767409	2026-07-30 15:17:58.767409
32	วีรชัย นพรัตน์	\N	QQ English	\N	Callan General English	\N	\N	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	Callan Method สนุกมาก พูดคล่องขึ้นเห็นชัดเจนในเวลาแค่ 2 เดือน	\N	วน	5	t	t	2	2026-07-30 15:17:58.773093	2026-07-30 15:17:58.773093
33	ปณิตา เรืองเดช	\N	CIA Cebu International Academy	\N	Semi-Sparta TOEIC	500	785	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	Philingo ดูแลดีมาก จัดการเรื่องวีซ่าและที่พักให้หมดเลย สบายใจมาก	\N	ปร	5	t	t	3	2026-07-30 15:17:58.776677	2026-07-30 15:17:58.776677
34	กิตติพงษ์ สุขสวัสดิ์	\N	SMEAG Global School	\N	Classic English	\N	\N	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	เซบูสวยมาก อาหารอร่อย ครูสอนเก่ง คุ้มค่ามากๆ	\N	กส	5	f	t	4	2026-07-30 15:17:58.780372	2026-07-30 15:17:58.780372
35	นภัสสร จันทร์สว่าง	\N	Philinter Academy	\N	Business English	\N	\N	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	Business English ที่ Philinter เหมาะมากสำหรับคนทำงาน	\N	นจ	4	f	t	5	2026-07-30 15:17:58.783794	2026-07-30 15:17:58.783794
36	ธีระ วงษ์สุวรรณ	\N	EV Academy	\N	IELTS Preparation	\N	\N	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	EV Academy แคมปัสสวยมาก บรรยากาศดี เหมาะกับการเรียนมากๆ	\N	ธว	5	f	t	6	2026-07-30 15:17:58.78645	2026-07-30 15:17:58.78645
13	สมหญิง ใจดี	\N	PINES International Academy	\N	Sparta IELTS	4.5	6.5	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	\N	สจ	5	t	f	1	2026-07-29 16:02:24.989082	2026-08-02 09:02:29.371
19	สมหญิง ใจดี	\N	PINES International Academy	\N	Sparta IELTS	4.5	6.5	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	เรียน 12 สัปดาห์ที่ PINES คะแนน IELTS ขึ้นจาก 4.5 เป็น 6.5 เกินเป้าไปมาก!	\N	สจ	5	t	f	1	2026-07-29 16:15:10.498116	2026-08-02 09:02:48.847
\.


--
-- TOC entry 3729 (class 0 OID 0)
-- Dependencies: 215
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- TOC entry 3730 (class 0 OID 0)
-- Dependencies: 227
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.banners_id_seq', 2, true);


--
-- TOC entry 3731 (class 0 OID 0)
-- Dependencies: 221
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 41, true);


--
-- TOC entry 3732 (class 0 OID 0)
-- Dependencies: 237
-- Name: contact_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contact_submissions_id_seq', 5, true);


--
-- TOC entry 3733 (class 0 OID 0)
-- Dependencies: 219
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.courses_id_seq', 72, true);


--
-- TOC entry 3734 (class 0 OID 0)
-- Dependencies: 252
-- Name: event_registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_registrations_id_seq', 1, false);


--
-- TOC entry 3735 (class 0 OID 0)
-- Dependencies: 250
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 1, true);


--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 223
-- Name: faqs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faqs_id_seq', 50, true);


--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 239
-- Name: form_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.form_submissions_id_seq', 2, true);


--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 233
-- Name: gallery_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.gallery_items_id_seq', 38, true);


--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 245
-- Name: newsletter_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_campaigns_id_seq', 1, false);


--
-- TOC entry 3740 (class 0 OID 0)
-- Dependencies: 246
-- Name: newsletter_campaigns_recipient_count_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_campaigns_recipient_count_seq', 1, false);


--
-- TOC entry 3741 (class 0 OID 0)
-- Dependencies: 248
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 7, true);


--
-- TOC entry 3742 (class 0 OID 0)
-- Dependencies: 231
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partners_id_seq', 39, true);


--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 229
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.promotions_id_seq', 9, true);


--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 217
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.schools_id_seq', 200, true);


--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 241
-- Name: seminar_registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seminar_registrations_id_seq', 5, true);


--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 243
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1498, true);


--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 235
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.team_members_id_seq', 1, false);


--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 225
-- Name: testimonials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.testimonials_id_seq', 36, true);


--
-- TOC entry 3472 (class 2606 OID 16431)
-- Name: admin_users admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_unique UNIQUE (email);


--
-- TOC entry 3474 (class 2606 OID 16429)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 3492 (class 2606 OID 16529)
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- TOC entry 3484 (class 2606 OID 16486)
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 3486 (class 2606 OID 16488)
-- Name: blog_posts blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);


--
-- TOC entry 3502 (class 2606 OID 16594)
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3480 (class 2606 OID 16469)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 3482 (class 2606 OID 16471)
-- Name: courses courses_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_slug_unique UNIQUE (slug);


--
-- TOC entry 3520 (class 2606 OID 16685)
-- Name: event_registrations event_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3518 (class 2606 OID 16674)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 3488 (class 2606 OID 16501)
-- Name: faqs faqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faqs
    ADD CONSTRAINT faqs_pkey PRIMARY KEY (id);


--
-- TOC entry 3504 (class 2606 OID 16605)
-- Name: form_submissions form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3498 (class 2606 OID 16570)
-- Name: gallery_items gallery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_items
    ADD CONSTRAINT gallery_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3512 (class 2606 OID 16643)
-- Name: newsletter_campaigns newsletter_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_campaigns
    ADD CONSTRAINT newsletter_campaigns_pkey PRIMARY KEY (id);


--
-- TOC entry 3514 (class 2606 OID 16657)
-- Name: newsletter_subscribers newsletter_subscribers_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);


--
-- TOC entry 3516 (class 2606 OID 16655)
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- TOC entry 3496 (class 2606 OID 16557)
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- TOC entry 3494 (class 2606 OID 16543)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 3476 (class 2606 OID 16452)
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- TOC entry 3478 (class 2606 OID 16454)
-- Name: schools schools_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_slug_unique UNIQUE (slug);


--
-- TOC entry 3506 (class 2606 OID 16616)
-- Name: seminar_registrations seminar_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seminar_registrations
    ADD CONSTRAINT seminar_registrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3508 (class 2606 OID 16630)
-- Name: site_settings site_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);


--
-- TOC entry 3510 (class 2606 OID 16628)
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3500 (class 2606 OID 16583)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 16516)
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- TOC entry 3521 (class 2606 OID 16697)
-- Name: event_registrations event_registrations_event_id_events_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_registrations
    ADD CONSTRAINT event_registrations_event_id_events_id_fk FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


-- Completed on 2026-08-06 17:20:40 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict z36hxjdxKacfDQw24mqLqa66nPnzwAahkzoSurrQqKT4Ta9BN0abhqFbDuFyaFc

