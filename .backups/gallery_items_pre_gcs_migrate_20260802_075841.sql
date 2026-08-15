--
-- PostgreSQL database dump
--

\restrict 6SNiibKIPoObP6zUBjiHaxNl7iF8BMhF42ecuAK5W82D8qqmtvCmNMzzpdyS40r

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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
-- Data for Name: gallery_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gallery_items (id, title, title_th, image_url, category, caption, caption_th, is_active, sort_order, created_at, updated_at) FROM stdin;
1	Test fetch	ทดสอบดึงรูป	/api/uploads/fetched-1785655105146-myqxemytmam.jpg	student	\N	\N	f	0	2026-08-02 07:18:25.14963	2026-08-02 07:19:17.764
2	\N	นักเรียน Philingo	/api/uploads/fetched-1785655191577-xwl4s8swawa.jpg	student	\N	\N	t	0	2026-08-02 07:19:51.578145	2026-08-02 07:19:51.578145
3	\N	นักเรียน Philingo	/api/uploads/fetched-1785655191677-ada1gcmsnis.jpg	student	\N	\N	t	0	2026-08-02 07:19:51.678279	2026-08-02 07:19:51.678279
4	\N	นักเรียน Philingo	/api/uploads/fetched-1785655191785-wepohps5bp.jpg	student	\N	\N	t	0	2026-08-02 07:19:51.786799	2026-08-02 07:19:51.786799
\.


--
-- Name: gallery_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gallery_items_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 6SNiibKIPoObP6zUBjiHaxNl7iF8BMhF42ecuAK5W82D8qqmtvCmNMzzpdyS40r

