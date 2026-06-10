# Postup přestavby web2epub (stav k 2026-06-10)

Shrnutí, co se udělalo a proč — pro navázání v další session.

## Cíl

Přestavět osobní nástroj na moderní web aplikaci: stahování článků podle XPath →
PostgreSQL → filtrování → tvorba/zahození EPUB knih → přehled knih ke stažení.

## Závazná rozhodnutí (od uživatele)

1. Backend API = **Node.js + TypeScript** (Fastify).
2. **Scraper a EPUB generátor zůstávají v Pythonu**; EPUB se generuje on-demand (Node volá
   `epub_cli.py` jako subprocess, streamuje, nikam neukládá).
3. Filtry: web / datum / autor / fulltext — bez hardcoded ID.
4. Schéma DB ponecháno, dotazy parametrizované, heslo v `.env`, žádná SQL injection.
5. TypeScript, kompletní systém (vč. správy webů, XPath testeru).
6. Python runtime běží i uvnitř node-api image (volá `*_cli.py` lokálně).
7. Scrape = jedno tlačítko „Stáhni všechny".
8. **Jeden skript dělá vše** (`01_create_environment.sh`), žádné ruční krokování.

## Hotovo (milníky M0–M6)

- **M0** Docker Compose (4 služby), `.env`, `db/init/` (schéma + seed webů + migrace
  `datum_importu`, `enabled`), `01_create_environment.sh` (= `docker compose up --build -d`).
- **M1** Python refaktor: `config.py` (env), parametrizovaný `database.py` (bez hardcoded ID
  ani filtru na autora), logging + error handling per web/článek, oprava limitu obrázků (#15),
  CLI `scrape_cli.py` / `epub_cli.py` / `xpath_test_cli.py`, úklid mrtvého kódu.
- **M2** Node API: `GET /api/articles` (filtry+paginace), detail, `POST /api/books`, trash.
- **M3** Node API: knihy + download (EPUB subprocess), CRUD `sites` + enabled, XPath test,
  async scrape (job v paměti) + stav, purge, odstranění odkazů.
- **M4** React/MUI: ArticlesPage (DataGrid + filtry), ArticleDetailDrawer, BooksPage.
- **M5** React/MUI: SitesPage (CRUD), XPathTesterPage.
- **M6** nginx frontend (servíruje SPA + proxuje `/api`), README + CLAUDE.md, úklid starého
  (smazán Flask `web/`, `exec.sh`, `DB/`, starý `Dockerfile`), modernizace `backup/*.sh`.

## Opravené chyby (po nasazení, hlášené uživatelem)

- **„Stáhni všechny" → 400**: frontend klient posílal `content-type: application/json` i bez
  těla; Fastify odmítl prázdné tělo. Fix: `content-type` jen když je tělo (`web-ui/src/api/client.ts`).
- **XPath tester → 400 „Invalid url"**: pole URL bez schématu neprošlo `z.string().url()`.
  Fix: tester doplní `https://` (`web-ui/src/pages/XPathTesterPage.tsx`).
- **Stažení knihy → pád na base64**: obrázek bez base64 (selhalý inline při scrapu) shodil
  generování. Fix: `__replace_base64_img` vkládá jen skutečné `;base64,` data-URI, ostatní
  přeskočí, dekódování v try/except (`scripts/create_book.py`).

## Aktuální stav prostředí

- Větev **`docs/claude-md`**, commity: `d7a74fa` (přestavba), `664322e` (UI fixy),
  `c968603` (EPUB fix). **Nepushnuto, žádný PR.**
- Stack běží (`docker compose ps` = 4 služby). UI http://localhost:8080, API :3000.
- V DB je ~**90 článků** z testovacího scrapu (osel 50, qubits 20, nature 20), bez duplicit,
  + 1 kniha (id 95). Lze smazat přes purge, pokud je potřeba čistý start.

## Otevřené body (follow-up)

- **phys.org (id 9) a quantumtech.blog (id 8) nic nestáhly** — pravděpodobně zastaralé XPathy;
  doladit přes XPath tester a upravit v `stranka`.
- Frontend bundle je velký (>900 kB) — zvážit code-splitting.
- Z plánu nízká priorita: Dropbox upload (#8), paginace přehledů scraperu (#31),
  stažení jedné URL (#33).
- Rozhodnout: push větve / PR do `main` / přejmenování větve (`docs/claude-md` už nesedí obsahu).
- Scrape job je v paměti node-api — restart node-api běžící scrape zabije (limit, OK pro osobní nástroj).
