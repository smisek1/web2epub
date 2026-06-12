# Otevřené GitHub issues — stav a plán řešení

Stav k 2026-06-12, repo `smisek1/web2epub`. Aktualizace původního triage z 2026-06-09 —
mezitím proběhla kompletní přestavba (commity `d7a74fa` → `3d93cef`), která většinu
starých issues vyřešila.

## ✅ Vyřešeno přestavbou — zavřít na GitHubu (10)

| # | Issue | Čím je vyřešeno |
|---|---|---|
| #9 | migrace na Node.js | Fastify + TypeScript API (`server/`) |
| #10 | přidat logování | `logging` napříč `scripts/*.py` |
| #13 | datum importu | sloupec `datum_importu` (`db/init/03_add_datum_importu.sql`) |
| #15 | max 99 obrázků | názvy `img_%03d_%03d` v `create_book.py` (komentář cituje #15) |
| #20 | sloupec zap/vyp stahování | `stranka.enabled` (`db/init/04_add_enabled.sql`), nahradilo hardcoded ID |
| #21 | autor ve web UI | sloupec + filtr Autor v `ArticlesPage.tsx` |
| #22 | refresh přeruší stahování | `POST /api/scrape` je async job v paměti, request ho neblokuje |
| #26 | přechod na Docker Compose | `docker-compose.yml` + `01_create_environment.sh` |
| #27 | testovací prostředí pro XPath | stránka XPath Tester v UI + `xpath_test_cli.py` |
| #30 | oddělit docker build a compose | bezpředmětné — compose builduje samo, skript je jen wrapper |

Při zavírání přidat komentář s odkazem na commit přestavby, ať je dohledatelné proč.

## 🔍 Ověřit, možná už taky vyřešeno (2)

| # | Issue | Jak ověřit |
|---|---|---|
| #28 | nefunkční datum phys.org | XPath Testerem otestovat `xpath_datum` ze seedu proti živému phys.org; web mezitím mohl změnit markup → případně jen opravit XPath v DB přes UI (žádná změna kódu) |
| #18 | některé obrázky se nestáhnou | image handling byl zpevněn (`3d93cef`, `c968603` — error handling per obrázek, ne-base64 URL nepadají). Otestovat na URL z issue (qubits.cz); pozor, qubits.cz není v seedu |

## 🛠 Zbývá udělat (6) — doporučené pořadí

### 1. #14 — odstranit odkazy z knihy *(malé)*
V `create_book.py` při sestavování kapitoly rozbalit `<a>` tagy (ponechat text, zahodit
`href`) — ve čtečce jsou odkazy k ničemu a ruší. Parsel/lxml už je k dispozici.

### 2. #29 — purge funkce DB *(střední)*
Smazat všechny knihy a články, ponechat z každého webu poslední článek a označit ho jako
„nechci číst" (koš) — slouží jako dedup kotva pro další scrape.
- SQL v transakci: smazat `kniha_clanek`, `kniha` (kromě koše), `clanky` kromě
  `MAX(datum_importu)` per `id_stranka`; přeživší vložit do koše.
- `POST /api/admin/purge` + tlačítko v UI s potvrzovacím dialogem.
- Před implementací doporučit zálohu (`backup/backup.sh`).

### 3. #31 — XPath na další stránku *(střední)*
Paginace vícestránkových článků/přehledů:
- migrace `db/init/06_add_xpath_next_page.sql` (sloupec `stranka.xpath_next_page`),
- scraper (`get_html.py`) po stažení článku následuje next-page link a přilepuje obsah
  (s limitem stránek proti zacyklení),
- pole ve formuláři webu v UI + podpora v XPath Testeru.

### 4. #3 — dokumentace *(malé, zbytek)*
README a CLAUDE.md po přestavbě většinu pokrývají. Chybí druhá půlka issue: **manuál
„jak přidat nový web"** — jak najít XPathy v devtools, otestovat v XPath Testeru, uložit
přes UI. Napsat do `docs/novy-web.md` a odkázat z README.

### 5. #17 — přidat nové weby *(průběžné, žádný kód)*
Po přestavbě jde čistě o data: pro každý web z issue sestavit XPathy (Testerem) a založit
přes UI. Brát postupně, část URL z issue jsou jednotlivé články nebo mrtvé odkazy —
nejdřív pročistit seznam. Závisí na #3 (manuál) a u stránkovaných přehledů na #31.

### 6. #33 — stažení jednotlivé stránky podle URL *(velké)*
Ad-hoc URL (root.cz, idnes…) → EPUB bez konfigurace webu. Vyžaduje generickou extrakci
obsahu (readability/trafilatura) místo XPathů — nový mechanismus vedle stávajícího.
Návrh: `POST /api/articles/from-url` → Python CLI s trafilaturou → uložit jako článek
(bez `id_stranka` nebo se speciálním webem „ad-hoc") → existující EPUB pipeline.
Rozmyslet před implementací; největší kus práce.

### Mimo pořadí: #8 — upload na Dropbox
EPUB se dnes streamuje na vyžádání a nikam neukládá; Dropbox by znamenal API klíče a
nový externí závislý systém. Doporučení: zavřít jako „won't fix", případně nechat
v backlogu na konec.
