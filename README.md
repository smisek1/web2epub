# web2epub

Osobní nástroj na stahování článků z vědeckých webů (osel.cz, nature.com, phys.org,
quantumtech.blog…) podle XPath konfigurace, jejich ukládání do PostgreSQL a sestavování
EPUB knih přes webové rozhraní.

## Architektura

Čtyři kontejnery na jedné Docker síti, vše spouští jediný skript:

| Služba | Co dělá | Port |
|--------|---------|------|
| **postgres** | PostgreSQL 15, DB `conversion` (články, knihy, weby) | 5432 |
| **python-worker** | scraper na cronu (denně 23:00); volá `scripts/scrape_cli.py` | — |
| **node-api** | REST API (Fastify + TypeScript); bundluje Python runtime pro generování EPUB | 3000 |
| **frontend** | React + MUI SPA (nginx, proxuje `/api` na node-api) | 8080 |

- **Scraper a generátor EPUB jsou v Pythonu** (`scripts/`), ověřený kód (XPath, base64 obrázky, EbookLib).
- **API a frontend jsou v Node/TypeScriptu.** EPUB se generuje **na vyžádání** — node-api volá `scripts/epub_cli.py` jako subprocess a stream­uje výsledek; nikam se neukládá.
- Konfigurace webů je **data v tabulce `stranka`** (XPathy + `enabled`), ne kód — nový web se přidá přes UI.

## Spuštění

```bash
cp .env.example .env      # uprav heslo
./01_create_environment.sh
```

Skript postaví a nastartuje celý stack (`docker compose up --build -d`) a počká na
healthy databázi. Pak:

- **UI:** http://localhost:8080
- **API:** http://localhost:3000/api

Při prvním startu se DB inicializuje ze souborů v `db/init/` (schéma, seed webů, migrace).

## Použití

1. **Články** — filtruj podle webu / data / autora / fulltextu, vyber a buď **vytvoř knihu**,
   nebo hoď **do koše**. Vyřízené články ze seznamu zmizí. Tlačítko **Stáhni všechny** spustí
   scrape všech aktivních webů hned (jinak běží noční cron).
2. **Knihy** — přehled vytvořených knih, stažení EPUB.
3. **Weby** — CRUD konfigurace webů včetně XPath polí a zapnutí/vypnutí.
4. **XPath tester** — vyzkoušej XPathy na URL bez zápisu do DB.

## Struktura

```
docker-compose.yml          # definice 4 služeb
01_create_environment.sh    # jediný spouštěcí skript
.env.example                # heslo, porty
db/init/                    # SQL pro inicializaci DB (schéma, seed, migrace)
scripts/                    # Python: scraper, EPUB generátor, CLI entrypointy
server/                     # Node.js + TypeScript REST API (Fastify)
web-ui/                     # React + Vite + MUI frontend
backup/                     # backup.sh / restore.sh (záloha dat článků)
docs/                       # dokumentace
```

## Vývoj

- **Backend:** `cd server && npm install && npm run dev` (potřebuje běžící postgres + env).
- **Frontend:** `cd web-ui && npm install && npm run dev` (Vite proxuje `/api` na `http://localhost:3000`).

## Zálohy

`db/init/` obsahuje jen schéma a seed, **ne data článků**. Pro plnou zálohu:

```bash
./backup/backup.sh          # dump do backup/dumps/
./backup/restore.sh         # obnova z nejnovější zálohy
```

## REST API (přehled)

```
GET    /api/articles            # filtry: web[], dateFrom, dateTo, autor, q, page, pageSize, sortBy, sortDir
GET    /api/articles/:id        # detail vč. HTML
POST   /api/articles/trash      # { ids } → do koše
DELETE /api/articles/:id/links  # odstranit odkazy z článku
POST   /api/books               # { ids } → nová kniha
GET    /api/books               # seznam knih
GET    /api/books/:id/download  # vygeneruje a stáhne EPUB
GET/POST/PUT/DELETE /api/sites  # CRUD webů, PATCH /api/sites/:id/enabled
POST   /api/xpath/test          # test XPath na URL
POST   /api/scrape              # spustí scrape všech aktivních (async) → { jobId }
GET    /api/scrape/:jobId       # stav scrape jobu
POST   /api/maintenance/purge   # { confirm:true } → smaže knihy a články (nechá poslední z webu)
```
