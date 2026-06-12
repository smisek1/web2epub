# Otevřené GitHub issues — stav a plán řešení

Stav k 2026-06-12 večer, repo `smisek1/web2epub`. Většinu starých issues vyřešila
přestavba (commity `d7a74fa` → `3d93cef`); zbytek doděláno dnes na větvi `docs/claude-md`.

## ✅ Vyřešeno přestavbou — zavřít na GitHubu (10)

| # | Issue | Čím je vyřešeno |
|---|---|---|
| #9 | migrace na Node.js | Fastify + TypeScript API (`server/`) |
| #10 | přidat logování | `logging` napříč `scripts/*.py` |
| #13 | datum importu | sloupec `datum_importu` (`db/init/03_add_datum_importu.sql`) |
| #15 | max 99 obrázků | názvy `img_%03d_%03d` v `create_book.py` |
| #20 | sloupec zap/vyp stahování | `stranka.enabled` (`db/init/04_add_enabled.sql`) |
| #21 | autor ve web UI | sloupec + filtr Autor v `ArticlesPage.tsx` |
| #22 | refresh přeruší stahování | `POST /api/scrape` je async job v paměti |
| #26 | přechod na Docker Compose | `docker-compose.yml` + `01_create_environment.sh` |
| #27 | testovací prostředí pro XPath | stránka XPath Tester v UI + `xpath_test_cli.py` |
| #30 | oddělit docker build a compose | bezpředmětné — compose builduje samo |

## ✅ Vyřešeno 2026-06-12 — zavřít s odkazem na commit (6)

| # | Issue | Commit | Poznámka |
|---|---|---|---|
| #28 | nefunkční datum phys.org | `61e7042` | dvě příčiny: 403 (vyžadují bot User-Agent) + změněný markup; nový UA ověřen na všech webech |
| #18 | některé obrázky se nestáhnou | `426924e` | původní problém vyřešen přestavbou; navíc opravena duplikace base64 do `srcset`/`href` |
| #14 | odstranit odkazy z knihy | `aaae0d5` | `strip_links` v `create_book.py` (lxml `strip_tags`), ověřeno na 12kapitolové knize |
| #29 | purge funkce DB | `d40fda5` | endpoint existoval; doplněno parkování přeživších do koše + UI tlačítko s potvrzením |
| #31 | XPath na další stránku | `e60d4b1` | 3 sloupce (`xpath_next_prehled`, `xpath_next_clanek`, `max_stranek`), migrace 06; ověřeno na phys.org (3 stránky, 30 článků) |
| #3 | dokumentace | `f362160` | README z přestavby + nový manuál `docs/novy-web.md` |

## ✅ #17 — nové weby (data, bez kódu)

Seznam z issue (2023) pročištěn a zpracován; konfigurace v DB + `db/init/07_seed_sites_17.sql`.

**Přidáno a ověřeno ostrým scrapem:**

| Web | id | První scrape |
|---|---|---|
| thequantuminsider.com (category/daily/business) | 11 | 11 článků, vše s datem/autorem/obrázky |
| physicsworld.com/c/quantum | 12 | 34 článků (web neuvádí autora) |
| quantumzeitgeist.com | 13 | 57 článků |
| sciencemag.cz | 1 | jen zapnut — XPathy ze seedu stále fungují; 10 článků |

**Vyřazeno:**

- `medium.com/*` (3 URL) — 403 pro boty + obsah renderuje JS; scraper nemá šanci
- `quantumgrad.com/articles` — JS aplikace (HTML má 2 kB)
- `quantumcomputingreport.com/news` — novinky jsou jedna velká stránka bez samostatných URL článků, nepasuje na model scraperu
- `quantumcomputingreport.com/public-companies` — seznam firem, ne články
- `sciencealert.com/search?q=quantum` — vyhledávací stránka
- 3× jednotlivé články (thequantuminsider 2×, techxplore) — to je use-case #33
- `nature.com/npjqi/articles` — už dávno v DB (id 10)

## 🛠 Zbývá (1)

### #33 — stažení jednotlivé stránky podle URL *(velké, nejdřív návrh)*
Ad-hoc URL (root.cz, idnes…) → EPUB bez konfigurace webu. Vyžaduje generickou extrakci
obsahu (readability/trafilatura) místo XPathů. Návrh: `POST /api/articles/from-url` →
Python CLI s trafilaturou → uložit jako článek speciálního webu „ad-hoc" → existující
EPUB pipeline. Před implementací odsouhlasit přístup.

### Mimo pořadí: #8 — upload na Dropbox
EPUB se streamuje na vyžádání a nikam neukládá. Doporučení: zavřít jako „won't fix".

## Vedlejší nálezy (mimo issues)

- **quantumtech.blog** (id 8, enabled): URL přehledu `https://quantumtech.blog/blog/`
  vrací 404 s jakýmkoli UA — web změnil strukturu nebo zanikl. Zvážit vypnutí,
  nebo najít novou URL přehledu.
