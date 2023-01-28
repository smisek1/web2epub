--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.13
-- Dumped by pg_dump version 9.5.13

-- Started on 2023-01-28 16:07:41 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 12395)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2190 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 2 (class 3079 OID 39602)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- TOC entry 2191 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track execution statistics of all SQL statements executed';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 182 (class 1259 OID 37932)
-- Name: clanky; Type: TABLE; Schema: public; Owner: borec
--

CREATE TABLE public.clanky (
    nadpis text,
    clanek text,
    datum date,
    cist boolean,
    id_clanky integer NOT NULL,
    id_stranka integer,
    posledni text,
    uvodni_odstavec text,
    autor text
);


ALTER TABLE public.clanky OWNER TO borec;

--
-- TOC entry 183 (class 1259 OID 37938)
-- Name: clanky_id_clanky_seq; Type: SEQUENCE; Schema: public; Owner: borec
--

CREATE SEQUENCE public.clanky_id_clanky_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clanky_id_clanky_seq OWNER TO borec;

--
-- TOC entry 2192 (class 0 OID 0)
-- Dependencies: 183
-- Name: clanky_id_clanky_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: borec
--

ALTER SEQUENCE public.clanky_id_clanky_seq OWNED BY public.clanky.id_clanky;


--
-- TOC entry 184 (class 1259 OID 37940)
-- Name: kniha_id_seq; Type: SEQUENCE; Schema: public; Owner: borec
--

CREATE SEQUENCE public.kniha_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.kniha_id_seq OWNER TO borec;

--
-- TOC entry 185 (class 1259 OID 37942)
-- Name: kniha; Type: TABLE; Schema: public; Owner: borec
--

CREATE TABLE public.kniha (
    id_kniha integer DEFAULT nextval('public.kniha_id_seq'::regclass) NOT NULL,
    jmeno text
);


ALTER TABLE public.kniha OWNER TO borec;

--
-- TOC entry 186 (class 1259 OID 37949)
-- Name: kniha_clanky_id_seq; Type: SEQUENCE; Schema: public; Owner: borec
--

CREATE SEQUENCE public.kniha_clanky_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.kniha_clanky_id_seq OWNER TO borec;

--
-- TOC entry 187 (class 1259 OID 37951)
-- Name: kniha_clanek; Type: TABLE; Schema: public; Owner: borec
--

CREATE TABLE public.kniha_clanek (
    id_clanky integer NOT NULL,
    id_kniha integer NOT NULL,
    id_clanek_kniha integer DEFAULT nextval('public.kniha_clanky_id_seq'::regclass) NOT NULL
);


ALTER TABLE public.kniha_clanek OWNER TO borec;

--
-- TOC entry 188 (class 1259 OID 37955)
-- Name: stranka; Type: TABLE; Schema: public; Owner: borec
--

CREATE TABLE public.stranka (
    id_stranka integer NOT NULL,
    jmeno text,
    link text,
    xpath_nadpis text,
    xpath_clanek text,
    xpath_links text,
    xpath_datum text,
    xpath_uvodni_odstavec text,
    xpath_autor text
);


ALTER TABLE public.stranka OWNER TO borec;

--
-- TOC entry 189 (class 1259 OID 37961)
-- Name: stranka_id_stranka_seq; Type: SEQUENCE; Schema: public; Owner: borec
--

CREATE SEQUENCE public.stranka_id_stranka_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stranka_id_stranka_seq OWNER TO borec;

--
-- TOC entry 2193 (class 0 OID 0)
-- Dependencies: 189
-- Name: stranka_id_stranka_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: borec
--

ALTER SEQUENCE public.stranka_id_stranka_seq OWNED BY public.stranka.id_stranka;


--
-- TOC entry 2047 (class 2604 OID 39609)
-- Name: id_clanky; Type: DEFAULT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.clanky ALTER COLUMN id_clanky SET DEFAULT nextval('public.clanky_id_clanky_seq'::regclass);


--
-- TOC entry 2050 (class 2604 OID 39610)
-- Name: id_stranka; Type: DEFAULT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.stranka ALTER COLUMN id_stranka SET DEFAULT nextval('public.stranka_id_stranka_seq'::regclass);


--
-- TOC entry 2194 (class 0 OID 0)
-- Dependencies: 183
-- Name: clanky_id_clanky_seq; Type: SEQUENCE SET; Schema: public; Owner: borec
--

SELECT pg_catalog.setval('public.clanky_id_clanky_seq', 5558, true);


--
-- TOC entry 2195 (class 0 OID 0)
-- Dependencies: 186
-- Name: kniha_clanky_id_seq; Type: SEQUENCE SET; Schema: public; Owner: borec
--

SELECT pg_catalog.setval('public.kniha_clanky_id_seq', 3673, true);


--
-- TOC entry 2196 (class 0 OID 0)
-- Dependencies: 184
-- Name: kniha_id_seq; Type: SEQUENCE SET; Schema: public; Owner: borec
--

SELECT pg_catalog.setval('public.kniha_id_seq', 89, true);


--
-- TOC entry 2180 (class 0 OID 37955)
-- Dependencies: 188
-- Data for Name: stranka; Type: TABLE DATA; Schema: public; Owner: borec
--

COPY public.stranka (id_stranka, jmeno, link, xpath_nadpis, xpath_clanek, xpath_links, xpath_datum, xpath_uvodni_odstavec, xpath_autor) FROM stdin;
1	Sciencemag	https://sciencemag.cz/category/clanky/	//h1[@class="name post-title entry-title"]/span/node()	//div[@class="entry"]/p/node()	//h2[@class="post-box-title"]/a/@href	//div[@class="post-inner"]/p[@class="post-meta"]/span[@class="tie-date"]/text()	\N	//span[@class="post-meta-author"]/a/text()
3	akademon	http://akademon.cz	//div[@id="maincontent"]/div[@class="clanek"]/h1/text()	//div[@id="maincontent"]/div[@class="clanek"]/div[@class="content"]/node()	//div[@class="clanek"]/a/@href	//div[@id="maincontent"]/div[@class="clanek"]/div[@class="datum"]/text()	\N	\N
4	vtm	https://vtm.zive.cz	//h1[@itemprop="name"]/text()	//div[@class="ar-content ar-inquiry-holder"]/*[not(contains(@class,"ar-link-to-another"))]/node()	//div[@class="ar-img"]/a[not(contains(@class,"ga-event-tracker idvert-perex-link"))]/@href	//span[@class="ar-date"]/text()	//div[@class="ar-annotation"]/node()	//span[@class="ar-author"]/a/text()
5	aldebaran	https://www.aldebaran.cz/news.php	\N	\N	//td[@class="news"]/a[not(contains(@target,"_blank"))]/@href	\N	\N	\N
9	phys.org	https://phys.org/tags/quantum/	//article[@class="news-article"]/h1/text()	//article[@class="news-article"]/div[@class="mt-4 article-main"]/node()	//body//a[@class="news-link"]/@href	//article[@class="news-article"]/div/div/p[@class="text-uppercase text-low"]/text()	\N	//article[@class="news-article"]/p[@class="article-byline text-low"]/text()
7	qubits	https://qubits.cz/	//h1[@class="entry-title"]/text()	//div[@class="post-content"]/node()	//div[@class="post-info"]/a[@class="nl-permalink"]/@href	//p[@class="post-meta"]/text()	\N	//a[@rel="author"]/text()
2	osel	https://www.osel.cz/	//div[@class="nadpis_clanku"]/node()	//div[@id="clanek_detail_obsah"]/node()	//a[@class="nadpis_clanku2"]/@href	//div[@class="zapati_clanku_right"]/text()	//div[@id="clanek_detail_popis"]/node()	//div[@class="zapati_clanku_left"]/a/text()
8	quantumtech.blog	https://quantumtech.blog/blog/	//h1[@class="entry-title"]//text()	//div[@class="entry-content"]/node()	//h2[@class="entry-title"]/a/@href	(//time[contains(@class, "entry-date published")]/text())[1]	\N	(//span[@class="author vcard"]/a/text())[1]
\.


--
-- TOC entry 2197 (class 0 OID 0)
-- Dependencies: 189
-- Name: stranka_id_stranka_seq; Type: SEQUENCE SET; Schema: public; Owner: borec
--

SELECT pg_catalog.setval('public.stranka_id_stranka_seq', 6, true);


--
-- TOC entry 2052 (class 2606 OID 37966)
-- Name: clanky_pkey; Type: CONSTRAINT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.clanky
    ADD CONSTRAINT clanky_pkey PRIMARY KEY (id_clanky);


--
-- TOC entry 2056 (class 2606 OID 37968)
-- Name: kniha_clanek_pkey; Type: CONSTRAINT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.kniha_clanek
    ADD CONSTRAINT kniha_clanek_pkey PRIMARY KEY (id_clanek_kniha);


--
-- TOC entry 2054 (class 2606 OID 37970)
-- Name: kniha_pkey; Type: CONSTRAINT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.kniha
    ADD CONSTRAINT kniha_pkey PRIMARY KEY (id_kniha);


--
-- TOC entry 2058 (class 2606 OID 37972)
-- Name: stranka_pkey; Type: CONSTRAINT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.stranka
    ADD CONSTRAINT stranka_pkey PRIMARY KEY (id_stranka);


--
-- TOC entry 2059 (class 2606 OID 37973)
-- Name: clanky_id_stranka_fkey; Type: FK CONSTRAINT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.clanky
    ADD CONSTRAINT clanky_id_stranka_fkey FOREIGN KEY (id_stranka) REFERENCES public.stranka(id_stranka);


--
-- TOC entry 2060 (class 2606 OID 37978)
-- Name: kniha_clanek_id_clanky_fkey; Type: FK CONSTRAINT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.kniha_clanek
    ADD CONSTRAINT kniha_clanek_id_clanky_fkey FOREIGN KEY (id_clanky) REFERENCES public.clanky(id_clanky);


--
-- TOC entry 2061 (class 2606 OID 37983)
-- Name: kniha_clanek_id_kniha_fkey; Type: FK CONSTRAINT; Schema: public; Owner: borec
--

ALTER TABLE ONLY public.kniha_clanek
    ADD CONSTRAINT kniha_clanek_id_kniha_fkey FOREIGN KEY (id_kniha) REFERENCES public.kniha(id_kniha);


--
-- TOC entry 2189 (class 0 OID 0)
-- Dependencies: 8
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2023-01-28 16:07:41 CET

--
-- PostgreSQL database dump complete
--

