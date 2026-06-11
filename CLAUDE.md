# CLAUDE.md

Guidance pro Claude Code při práci v tomto repu.

## O projektu

Osobní nástroj na stahování článků z vědeckých webů (osel.cz, nature.com, phys.org,
quantumtech.blog…) podle XPath konfigurace v DB, ukládání do PostgreSQL (HTML s base64
inlinovanými obrázky) a sestavování EPUB knih přes webové rozhraní.

Stack: **PostgreSQL 15 + Python workery (scraper/EPUB) + Node.js/TypeScript REST API
(Fastify) + React/MUI frontend**, vše v Dockeru. Komunikace česky, komentáře v kódu anglicky.

## Spuštění

```bash
cp .env.example .env          # heslo a porty
./01_create_environment.sh    # jediný skript: docker compose up --build -d + čekání na healthy
```

- UI: http://localhost:8080 · API: http://localhost:3000/api
- DB se při prvním startu (prázdný volume) inicializuje z `db/init/*.sql`.
- **Vždy provozuj přes `01_create_environment.sh` / docker compose**, ne ručními příkazy.

## Architektura (4 služby na síti `web2epub`)

1. **postgres** — DB `conversion`. Init: `db/init/` (00_role → 01_schema → 02_seed_extra →
   03_add_datum_importu → 04_add_enabled → 05_constraints), ploché ordered SQL pro
   `docker-entrypoint-initdb.d`.
2. **python-worker** (`Dockerfile.worker`) — cron 23:00 → `scripts/scrape_cli.py`.
3. **node-api** (`server/Dockerfile`) — Fastify REST API; image obsahuje i Python runtime,
   protože EPUB a XPath test volá `scripts/*_cli.py` jako subprocess.
4. **frontend** (`web-ui/Dockerfile`) — React/MUI SPA přes nginx, proxuje `/api` na node-api.

### Python vrstva (`scripts/`)
- `config.py` — DB připojení z env (žádné hardcoded heslo).
- `database.py` — parametrizované dotazy pro scraper a EPUB (žádná hardcoded ID).
- `get_html.py` — scraper (XPath, base64 obrázky), error handling per web i článek, logging.
- `create_book.py` — EbookLib; `write_knihu(out_path)` zapíše na zadanou cestu.
- `scrape_cli.py` / `epub_cli.py` / `xpath_test_cli.py` — CLI entrypointy (cron i node-api).

### Node API (`server/src/`)
- `config.ts` (env přes zod), `db/pool.ts` (pg Pool), `db/queries/*` (parametrizované SQL),
  `routes/*` (zod validace), `services/*` (spouštění Pythonu, scrape job registry).
- EPUB: `GET /api/books/:id/download` → `services/epub.ts` spustí `epub_cli.py`, streamuje, smaže.
- Scrape: `POST /api/scrape` je async (job v paměti), neblokuje request.

### Frontend (`web-ui/src/`)
- Vite + React + TS + MUI + `@mui/x-data-grid` + TanStack Query + react-router.
- `api/client.ts` (fetch nad `/api`), `hooks/*` (query + mutace), `pages/*`
  (Articles, Books, Sites, XPathTester).

## Datový model (DB `conversion`)

```
stranka(id_stranka, jmeno, link, xpath_links, xpath_nadpis, xpath_clanek,
        xpath_datum, xpath_uvodni_odstavec, xpath_autor, enabled)
clanky(id_clanky, id_stranka→stranka, nadpis, clanek HTML, datum, uvodni_odstavec,
       autor, posledni URL=dedup klíč, datum_importu, cist nepoužívané)
kniha(id_kniha, jmeno)                 -- speciální kniha 'nechci cist' = koš
kniha_clanek(id_clanek_kniha, id_clanky→clanky, id_kniha→kniha)   -- M:N
```

- Článek je „vyřízený" když má řádek v `kniha_clanek` (kniha nebo koš) → mizí ze seznamu.
- `stranka.enabled` řídí, které weby scraper bere (nahradilo hardcoded `id IN (…)`).
- Nový web = záznam v `stranka` přes UI (`/api/sites`), žádná změna kódu.

## Konvence

- **Heslo a porty jen v `.env`** (gitignored), nikdy v kódu.
- SQL **vždy parametrizované** (Node `$1`, Python `%s`); žádné skládání stringů.
- Po větším celku se zastav a zeptej, nepokračuj automaticky.
- Schéma se mění přes nový očíslovaný soubor v `db/init/` (běží při čisté DB) — pro běžící
  DB aplikuj migraci ručně přes `psql`.

## Zálohy

`db/init/` má jen schéma + seed (ne data článků). Plná záloha: `backup/backup.sh`
(dump do `backup/dumps/`), obnova `backup/restore.sh`.
