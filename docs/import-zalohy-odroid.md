# Import zálohy z odroidu — sloučení starého systému do Dockeru (2026-08-02)

## Proč

Po přestavbě zůstal na odroidu HC2 běžet **původní systém**, ve kterém se dál četlo
i scrapovalo. Docker DB mezitím obsahovala jen jednorázový scrape z 12.6.2026 (239
článků) a chyběla v ní jak většina obsahu, tak informace o tom, co už je přečtené.

Cíl: dostat do Docker DB všechny **nepřečtené** články ze starého systému a schovat ty,
které už přečtené jsou, aby seznam Články ukazoval jen to, co ještě čeká.

## Zdroj

`//192.168.0.124/data/_filmy/_ostatni/conversion/regulary/2026-07-30.tar` — navzdory
příponě jde o **plain-text `pg_dump`** (PostgreSQL 15.3), 1,13 GB.

Share **nelze namountovat** — tenhle stroj je neprivilegovaný LXC kontejner, takže
`mount -t cifs` skončí na `mount error(1): Operation not permitted` i pod rootem.
Řešení je `smbclient`, což je userspace klient a žádný mount nepotřebuje:

```bash
smbclient //192.168.0.124/data -N -c 'cd "_filmy\_ostatni\conversion\regulary"; lcd /cil; get 2026-07-30.tar'
```

## Jak se pozná „přečteno"

Sloupec `clanky.cist` je **prázdný v obou systémech** (0 vyplněných z 3111) — slepá ulička.

Spolehlivý signál je **členství v `kniha_clanek`**: článek zařazený do knihy byl
zpracovaný. Kniha `nechci cist` (koš, 934 článků) se počítá taky — uživatel je vědomě
odmítl.

**Sloupec `datum` je nepoužitelný** — viz bug níže.

### Zvolená definice (varianta B)

Uživatel uvedl, že poslední přečtený článek je „Vítr a oheň: Aikido Technologies…",
osel ID **14580**, který leží uprostřed knihy `2026-04-22_osel-qubits` (osel ID
14520–14656). Po ní existuje ještě kniha `2026-06-05_osel-qubits-Qubity-lupa`
(14657–14731), ke které se uživatel nedostal.

Nepřečtené = článek, který **není v žádné knize**, NEBO je v knize `2026-06-05…`,
NEBO je v knize `2026-04-22…` s osel ID > 14580.

Zavržená varianta A („každá kniha = přečtená") by schovala ~150 článků, které
uživatel podle svých slov nečetl.

## Čísla

| | záloha | Docker před | Docker po |
|---|---|---|---|
| Článků celkem | 3111 | 239 | **536** |
| Ve výpisu (nevyřízené) | — | 231 | **521** |
| Vyřízených | 2902 | 8 | 15 |

- Naimportováno **297** článků (osel 284, qubits 5, Qubity-lupa 8), 78 MB HTML.
- Schováno **7** už vyřízených: 4 přečtené → nová kniha `Přečteno (import ze zálohy)`,
  3 odmítnuté → stávající koš `nechci cist` (zachováno původní rozlišení).
- Ze 239 původních článků jich záloha znala 70; zbylých 169 jsou weby přidané v červnu.

## Mapování webů

| Záloha | Docker | Pozn. |
|---|---|---|
| 2 `osel` | 2 `osel` | shoda |
| 7 `qubits` | 7 `qubits` | shoda |
| 10 `Qubity-lupa` | **15** (nově založen) | v Dockeru id 10 je nature.com |

**`Qubity-lupa` (lupa.cz/serialy/qubity) při přestavbě vypadl** — v záloze měl 206
článků. Založen znovu s XPathy ze zálohy, ale **`enabled=false`**; XPathy ve starém
systému fungovaly ještě 30.7.2026, ale před zapnutím je vhodné je ověřit XPath Testerem.

## Postup (reprodukovatelný)

1. `smbclient` stáhne dump (viz výše).
2. Dump se načte do **oddělené** DB `conversion_zaloha` ve stejné postgres instanci —
   produkční `conversion` se nedotkne.
3. URL ze současné DB se nahrají do `conversion_zaloha.aktualni_urls` kvůli porovnání.
4. `./backup/backup.sh` — návratový bod.
5. `COPY (…) TO STDOUT` vyexportuje nepřečtené s přemapovaným `id_stranka`.
6. `\copy` do staging tabulky v `conversion`, pak
   `INSERT … ON CONFLICT (id_stranka, posledni) DO NOTHING`.
7. Schování přečtených přes `kniha_clanek` (vzor `trashArticles`,
   `server/src/db/queries/articles.ts:111`).
8. Úklid staging tabulek.

Nic se nemazalo; počet článků jen rostl (239 → 536).

### Rollback

```sql
DELETE FROM kniha_clanek
WHERE id_kniha = (SELECT id_kniha FROM kniha WHERE jmeno = 'Přečteno (import ze zálohy)');
DELETE FROM clanky WHERE datum_importu::date = '2026-08-02';
```
Nebo úplně: `backup/restore.sh` z `backup/dumps/2026-08-02_192120.sql`.

## Nalezené bugy

### 1. Cron scraper byl mrtvý — opraveno (be2571a)

`config/crontab` volal `python3`, ale cron dědí PATH bez `/usr/local/bin`, kam
python:3.11-slim instaluje interpret. V logu workeru se opakovalo
`/bin/sh: 1: python3: not found` od 12.6.2026. Navíc `Dockerfile.worker` ten samý
soubor instaloval i jako osobní crontab (`crontab /etc/cron.d/web2epub`), takže se
job registroval dvakrát a v osobním crontabu (bez sloupce `user`) dělal ze slova
„root" neplatný příkaz.

Opraveno přidáním `PATH=` do `config/crontab` a odstraněním duplicitní instalace.
Ověřeno simulací cronova prostředí a ručním spuštěním přes `POST /api/scrape`.

### 2. Prohozený den a měsíc v `datum`

Datum se parsuje jako `MM-DD` místo `DD-MM`, takže u článků se dnem ≤ 12 vyjde nesmysl.
Prokázáno křížovou kontrolou proti osel ID (monotónně rostoucí):

| uloženo | osel ID | skutečnost |
|---|---|---|
| 2026-12-06 | 14744 | 12.6.2026 |
| 2026-01-06 | 14724 | 1.6.2026 |
| 2026-12-03 | 14580 | 12.3.2026 |

Dny > 12 se parsují správně (prohození není možné), takže data jsou **promíchaná** —
část správně, část obráceně. Bug je zděděný ze starého systému, postihuje i zálohu.

Důsledek: **řazení a filtrování podle data v UI je nespolehlivé.** Při 536 článcích
to začíná vadit. Oprava vyžaduje zásah v `scripts/get_html.py` + přepočet uložených dat.
