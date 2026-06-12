# Jak přidat nový web

Nový web = jeden záznam v tabulce `stranka`, žádná změna kódu. Celé se to odehraje
v UI (http://localhost:8080): XPathy si najdeš v prohlížeči, ověříš v **XPath Testeru**
a uložíš ve **Weby → Přidat web**.

## Jak to funguje

Scraper jednou denně (cron 23:00, nebo ručně tlačítkem „Stáhni všechny"):

1. stáhne **přehledovou stránku** webu (`link`),
2. XPathem `xpath_links` z ní vytáhne odkazy na články — **od nejnovějšího ke staršímu**;
   zastaví se, jakmile narazí na článek, který už v DB je,
3. každý nový článek stáhne a XPathy vytáhne nadpis, tělo, datum, úvodní odstavec, autora,
4. obrázky v těle stáhne a uloží přímo do HTML (base64) — o nic se nestaráš.

## Pole konfigurace

| Pole | Povinné | Co vrací | Příklad (osel.cz) |
|------|---------|----------|-------------------|
| `jmeno` | ano | název webu v UI | `osel` |
| `link` | ano | URL přehledové stránky | `https://www.osel.cz/` |
| `xpath_links` | ano | `@href` odkazů na články z přehledu | `//a[@class="nadpis_clanku2"]/@href` |
| `xpath_nadpis` | ano | text nadpisu na stránce článku | `//div[@class="nadpis_clanku"]/node()` |
| `xpath_clanek` | ano | HTML tělo článku (`node()`) | `//div[@id="clanek_detail_obsah"]/node()` |
| `xpath_datum` | ano | text s datem (formát je jedno, parsuje `dateparser`) | `//div[@class="zapati_clanku_right"]/text()` |
| `xpath_uvodni_odstavec` | ne | HTML perexu | `//div[@id="clanek_detail_popis"]/node()` |
| `xpath_autor` | ne | text se jménem autora | `//div[@class="zapati_clanku_left"]/a/text()` |
| `xpath_next_prehled` | ne | `@href` odkazu „další stránka" na **přehledu** | `//a[contains(@class,"page-link")][contains(.,"»")]/@href` |
| `xpath_next_clanek` | ne | `@href` odkazu „další stránka" **uvnitř článku** | — |
| `max_stranek` | ne | kolik stránek přehledu celkem projít (0 = bez limitu) | `3` |

Pozn.: koncovka XPath rozhoduje o typu výsledku — `/@href` vrací atribut,
`/text()` text, `/node()` celé HTML (pro tělo článku a perex).

## Postup krok za krokem

### 1. Najdi XPathy v prohlížeči

1. Otevři přehledovou stránku webu, **F12 → Inspektor**.
2. Pravým na nadpis článku → Prozkoumat → najdi `<a>` s odkazem a všimni si jeho
   třídy/struktury. XPath piš ručně podle třídy (`//a[@class="…"]/@href`) — bývá
   stabilnější než „Copy XPath" z devtools, který generuje křehké absolutní cesty
   (`/html/body/div[3]/…`).
3. Otevři jeden článek a stejně najdi nadpis, tělo, datum, autora.
4. XPath si můžeš ověřit přímo v devtools konzoli:
   `$x('//a[@class="nadpis_clanku2"]/@href')`.

Tipy na robustní XPathy:

- Třída se může změnit nebo přibýt — `contains(@class,"article-byline")` přežije víc
  než přesná shoda.
- Descendant osa `//article//p[@class="…"]` přežije přeskupení divů; přesná cesta
  `article/div/div/p` ne (přesně tohle rozbilo datum na phys.org).
- Když XPath vrací víc uzlů, výsledky se **spojí do jednoho řetězce**. Pro datum/autora
  chceš jeden čistý výsledek — pomůže index a normalizace:
  `normalize-space((//p[@class="text-uppercase text-low"])[1]/text()[1])`.

### 2. Ověř v XPath Testeru

Stránka **XPath tester** (nebo ikona zkumavky u webu v sekci Weby):

1. URL = přehledová stránka, vyplň `xpath_links` → musí vrátit seznam odkazů na články.
2. URL = jeden konkrétní článek, vyplň nadpis/článek/datum/autora → zkontroluj výsledky.
   U článku se ukáže náhled HTML včetně obrázků.
3. Pokud web stránkuje, otestuj i „XPath další stránka přehledu" — musí vrátit URL
   druhé stránky.

Tester nic nezapisuje do DB, klidně iteruj.

### 3. Ulož a otestuj naostro

1. **Weby → Přidat web**, vyplň pole, nech **Aktivní** zapnuté, ulož.
2. **Články → Stáhni všechny** (nebo počkej na noční cron).
3. Zkontroluj nové články v seznamu — datum, autor, a v detailu obrázky.

První scrape stáhne všechny články z přehledu (případně z `max_stranek` stránek);
další běhy už berou jen nové.

## Stránkování (volitelné)

- **Přehled na víc stránkách** (`xpath_next_prehled` + `max_stranek`): scraper otáčí
  stránky, dokud nenarazí na už stažený článek, konec webu, nebo limit. `max_stranek=0`
  znamená bez limitu — u prvního scrapu velkého archivu radši začni s malým limitem
  (např. 3), ať nestahuješ stovky stránek.
- **Článek na víc stránek** (`xpath_next_clanek`): scraper stáhne všechny díly a slepí
  je do jednoho HTML (strop 30 stránek).

## Když něco nefunguje

| Symptom | Příčina a řešení |
|---------|------------------|
| Tester vrací prázdné výsledky | XPath nesedí na markup — zkontroluj v devtools `$x(…)`; pozor, některé weby renderují obsah JavaScriptem, ten scraper nevidí (stahuje čisté HTML) |
| Prázdné výsledky, ale XPath v devtools funguje | Web vrací scraperu jinou stránku (403/captcha). Scraper se hlásí jako `web2epub/1.0 (+github)` — viz `USER_AGENT` v `scripts/get_html.py`. phys.org takhle blokoval starý UA |
| Datum je `NULL` | `dateparser` text nepochopil — uprav XPath, ať vrací jen datum bez okolního textu (`normalize-space`, `text()[1]`) |
| Autor obsahuje smetí/whitespace | obal výraz do `normalize-space(…)` |
| Obrázky v článku chybí | web je lazy-loaduje do jiného atributu než `src` (např. `data-src`) — scraper čte jen `src` |

## Reference: aktuální weby

Funkční konfigurace si zobrazíš v UI (Weby → tužka) — nejlepší zdroj vzorů:

- **osel.cz** — klasické HTML, přesné třídy
- **qubits.cz** — WordPress (vzor pro většinu WP webů: `entry-title`, `post-content`,
  `rel="author"`)
- **phys.org** — robustní XPathy s `contains()` a `normalize-space()`, stránkovaný
  přehled (`page-link` + `max_stranek=3`)
- **nature.com** — vědecký portál s čistým markupem
