# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O projektu

Osobní nástroj na stahování článků z vědeckých webů (osel.cz, sciencemag.cz, nature.com, quantumtech.blog…), jejich ukládání do PostgreSQL a následné sestavování EPUB knih přes webové rozhraní. Python 3, bez frameworku pro scraping (requests + scrapy Selector), Flask UI, vše běží v Dockeru.

## Spuštění a běžné příkazy

```bash
./01_create_environment.sh        # kompletní (re)build prostředí: síť, postgres kontejner,
                                  # build + start app kontejneru, restore DB, start Flasku a cronu
```

- Vytvoří dva kontejnery na síti `my-network`:
  - `web2epub-postgres` — postgres:15.3, DB `conversion` (obnovuje se z dumpu `DB/conversion` + `DB/notread.sql` přes `DB/restore.ps`)
  - `web2epub2` — app kontejner z `Dockerfile` (ubuntu 22.04 + pip balíčky z `requirements.txt`)
- Adresáře repa se mountují do app kontejneru pod `/tmp` (`/tmp/scripts`, `/tmp/web`, `/tmp/DB`) — kód se NEkopíruje do image, edituje se přímo v repu.
- Flask UI: `web/flask.sh` (port 5000, debug mode), stránka `http://localhost:5000/create/`
- Cron v app kontejneru: denně ve 23:00 spouští `python3 /tmp/scripts/test.py`, což zavolá `get_html.main_throuhgh_sites()` = stažení nových článků ze všech aktivních webů.
- Zálohy DB: `backup/backup.sh` (pg_dump na NAS + restore z poslední zálohy), `DB/backup.ps` (dump schématu bez dat článků do `DB/conversion`).
- Testy reálně nejsou: `scripts/testing.py` je jediný pytest soubor a volá neexistující funkci `get_html_osel` — je mrtvý. `scripts/test.py` a `scripts/soap_test.py` jsou ad-hoc spouštěcí/experimentální skripty, ne testy.

## Architektura

Tři vrstvy, všechny moduly žijí v `scripts/` a importují se přes `sys.path` hacky (cesty `/tmp/...` jsou cesty UVNITŘ kontejneru):

1. **Scraper — `scripts/get_html.py`**
   - `main_throuhgh_sites()` → načte konfiguraci webů z tabulky `stranka` (`database.select_sites`) a pro každý web spustí `get_links`.
   - `get_links` stáhne přehledovou stránku webu, XPathem (`stranka.xpath_links`) vytáhne odkazy na články a iteruje, dokud nenarazí na poslední již uložený článek (sloupec `clanky.posledni` = URL článku, porovnává se přes `database.select_posledni`).
   - `get_html` pro každý nový odkaz vytáhne XPathy (`xpath_nadpis`, `xpath_clanek`, `xpath_datum`, `xpath_uvodni_odstavec`, `xpath_autor`) jednotlivá pole; datum parsuje `dateparser`.
   - Obrázky v článku se hned při stažení stáhnou a **inlinují do HTML jako base64 data-URI** (`replace_img_base64`), takže DB drží kompletní soběstačný obsah.
   - Výsledek se uloží do tabulky `clanky` (`database.insert_clanek`).

2. **Databázová vrstva — `scripts/database.py`**
   - Jedna třída = jeden dotaz; všechny dědí z `conn_string`, která v `__init__` otevírá a v `__del__` zavírá spojení (connection per operace, žádný pool).
   - Connection string je natvrdo v kódu: host `web2epub-postgres`, DB `conversion`, user `postgres`.
   - Sekce v souboru: dotazy pro scraper / pro Flask / pro tvorbu EPUB / pro testy.

3. **Web UI + generátor EPUB — `web/create.py` + `scripts/create_book.py`**
   - Flask stránka `/create/` zobrazí všechny články, které zatím nejsou v žádné knize (`select_clanky` — LEFT JOIN na `kniha_clanek` IS NULL; duplicitní URL se značí prefixem `XXXXXXXXXXX` v nadpisu).
   - Uživatel zaškrtá články a buď je hodí do virtuální knihy „nechci cist" (koš), nebo dá **Create book**.

## Datový model (PostgreSQL, DB `conversion`)

```
stranka       — konfigurace scrapovaných webů
  id_stranka, jmeno, link (URL přehledové stránky),
  xpath_links, xpath_nadpis, xpath_clanek, xpath_datum,
  xpath_uvodni_odstavec, xpath_autor

clanky        — stažené články (HTML s inlinovanými base64 obrázky)
  id_clanky, id_stranka → stranka, nadpis, clanek (HTML text),
  datum, uvodni_odstavec, autor,
  posledni (URL článku = deduplikační klíč), cist (nepoužívané)

kniha         — vygenerované knihy
  id_kniha, jmeno (formát YYYY-MM-DD_<jmena-stranek>; speciální kniha 'nechci cist' = koš)

kniha_clanek  — M:N vazba kniha ↔ článek
  id_clanek_kniha, id_clanky → clanky, id_kniha → kniha
```

Článek „je přečtený/vyřízený" = existuje záznam v `kniha_clanek`. Schéma se verzuje jako pg_dump v `DB/conversion` (bez dat článků), ruční úpravy konfigurace webů v `DB/notread.sql`. Přidání nového webu = INSERT/UPDATE do `stranka` s XPathy — žádná změna kódu, ALE viz slabina s hardcoded ID níže.

## Flow konverze HTML → EPUB

1. POST `/create` s tlačítkem **Create book** (`web/create.py:login`).
2. `database.insert_book(id_clanku)` — vygeneruje v plpgsql název knihy (`datum_jmena-stránek`), vloží řádek do `kniha` a vazby do `kniha_clanek`.
3. `database.select_clanky_pro_epub(jmeno_knihy)` — vytáhne články knihy seřazené podle data.
4. `create_book.create_book` (scripts/create_book.py) přes **EbookLib**:
   - založí `EpubBook` (jazyk `cs`, autor a identifier natvrdo),
   - `add_kap()` pro každý článek vytvoří kapitolu `chap_NN.xhtml` — obsah je `<h3>nadpis (web)</h3>` + autor + datum + úvodní odstavec + tělo článku,
   - `__replace_base64_img()` dekóduje base64 data-URI z HTML zpět na binární JPEG, uloží je jako samostatné položky (`<citac><idx>.jpg`) v EPUBu a v HTML nahradí data-URI odkazem na soubor,
   - kapitoly se přidávají do TOC a spine.
5. `write_knihu()` zapíše `/tmp/<jmeno>.epub` (= v mountu `tmp/` na hostu), Flask ho pošle jako download přes `after_this_request`.

## Známé slabiny

- **SQL injection / skládání SQL stringů**: `select_posledni`, `select_stranky_dleid`, `select_clanky_pro_epub` (`.format()` s názvem knihy), `insert_book` a `insert_book_nechci_cist` (generování plpgsql konkatenací ID z formuláře). Parametrizované dotazy jsou jen u insert/update článků.
- **Hardcoded credentials**: heslo `Pa$$w0rd` natvrdo v `database.py`, `01_create_environment.sh`, `backup/*.sh`, `DB/backup.ps`. Žádný .env.
- **Hardcoded ID stránek a filtrů v SQL**: `select_sites` i `select_clanky` mají natvrdo vyjmenovaná `id_stranka` (2,7,8,9,10) a filtr na konkrétního autora — přidání webu do `stranka` se bez editace `database.py` neprojeví.
- **Mrtvý/rozbitý kód**: `insert_nechci_kniha.insert` používá nedefinované proměnné (spadne při zavolání); `testing.py` volá neexistující `get_html_osel`; `scripts/.database.py.swo` (vim swap) je commitnutý; `exec.sh` odkazuje na neexistující `web/hello.py`.
- **Obrázky**: vše se tlačí přes `data:image/jpg;base64` bez ohledu na skutečný formát (PNG/GIF/SVG/WebP); nahrazování přes `str.replace` celého HTML může poškodit obsah; chybějící/nedostupný obrázek = neošetřená výjimka a pád celého scrape běhu.
- **Deduplikace článků**: detekce „už staženo" stojí jen na URL posledního článku z `select_posledni` (MAX(id_clanky)); když se pořadí na webu změní nebo článek zmizí, vznikají duplicity (UI je jen značkuje `XXXXXXXXXXX`).
- **Žádný error handling**: jediný špatný XPath, timeout nebo změna struktury webu shodí celý cron běh; žádné retry, žádné logování (jen `print`).
- **Křehké prostředí**: kód závisí na bězích v `/tmp` (`os.chdir('/tmp')`, `sys.path.insert`), `01_create_environment.sh` má podivný port mapping (`-p 5432:543$CONT_ITER`) a psql příkazy s `"Pa$$w0rd"` ve dvojitých uvozovkách (shell expanduje `$$` na PID — nastavené heslo neodpovídá zamýšlenému).
- **Flask**: debug mode + bind na 0.0.0.0, `select_clanky()` se volá už při importu modulu, vzor `after_this_request` + `send_file` po redirectu je nespolehlivý pro download.
- **Nepinované závislosti** v `requirements.txt` (scrapy se instaluje celý kvůli pouhému `Selector`).
