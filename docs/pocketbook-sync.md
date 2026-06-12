# Plán: sync knih do PocketBooku (#8, nahrazuje „Dropbox uploading")

Stav: **návrh odsouhlasen 2026-06-12, zatím neimplementováno.**

## Cílový workflow

> Přes den si na webu naklikám co chci číst, večer na čtečce zmáčknu Sync a čtu.

```
přes den: výběr článků → „Vytvořit knihu" (existující flow)
        ↓ NOVÉ: po vytvoření knihy se EPUB automaticky vygeneruje do /export
rclone (sidecar kontejner, cron): /export → Dropbox /Aplikace/Dropbox PocketBook
večer: PocketBook → Sync (nativní Dropbox PocketBook) → kniha na čtečce
```

## Proč takhle

- Jednotlačítkový **Sync** umí PocketBook nativně jen přes **Dropbox PocketBook**
  (případně PocketBook Cloud). OPDS katalog by fungoval, ale znamená na čtečce ručně
  procházet katalog a stahovat — není to sync.
- Dropbox je jen doručovací kanál „posledního metru" ke čtečce; primární data zůstávají
  doma na Proxmoxu, v Dropboxu jsou jen kopie EPUBů.
- OAuth k Dropboxu řeší jednorázově `rclone config` — v kódu web2epub nebude žádná
  Dropbox logika ani tokeny.
- Uživatel má VPN na domácí síť odkudkoli, web2epub poběží na Proxmoxu.

## Implementační kroky

1. **Auto-export EPUBu** — po úspěšném `POST /api/books` asynchronně (fire-and-forget,
   nesmí zdržet odpověď UI) vygenerovat EPUB přes existující `services/epub.ts` /
   `epub_cli.py` a uložit do exportního volume (`/export`, nový volume v compose).
   Stahování on-demand přes `GET /api/books/:id/download` zůstává beze změny.
   - Název souboru: jméno knihy (sanitizované pro FS) + `.epub`.
   - Zvážit: smazání exportu při purge (#29) — purge maže knihy, exporty v Dropboxu
     může uklízet rclone `sync` (zrcadlí stav složky) vs. `copy` (jen přidává). Spíš
     `copy`, ať si přečtené knihy mažu na čtečce sám.
2. **rclone sidecar** v `docker-compose.yml` — oficiální image `rclone/rclone`,
   konfigurace v pojmenovaném volume, periodicky (smyčka/cron každých ~15 min):
   `rclone copy /export "dropbox:Aplikace/Dropbox PocketBook/web2epub"`.
   - Jednorázové nastavení: `docker compose run rclone config` (OAuth flow).
3. **Dokumentace** — `docs/` návod: spárování PocketBooku s Dropboxem (Nastavení →
   Účty → Dropbox), umístění synced složky, jak funguje večerní Sync.
4. **Zavřít #8** jako vyřešené tímto návrhem (místo původního „won't fix").

## Zavržené alternativy (a proč)

- **Přímá integrace Dropbox API v node-api** — OAuth aplikace, refresh tokeny, údržba;
  rclone to samé udělá bez kódu.
- **OPDS endpoint `/opds` v node-api** — hezké, čisté self-hosted řešení (PocketBook má
  OPDS klient v Síťové knihovně), ale není to jednotlačítkový sync. Dá se přidat později
  jako bonus pro ruční procházení knihovny.
- **Calibre-Web na Proxmoxu** — plnohodnotná knihovna s OPDS, ale další služba k údržbě
  a pořád to neřeší tlačítko Sync.
- **Send-to-PocketBook (e-mail)** — potřebuje SMTP, posílání po jedné knize.
- **KOReader na čtečce (WebDAV)** — zásah do čtečky, zase ruční stahování.

## Kontext repa (stav k 2026-06-12)

- Větev `docs/claude-md`: vyřešeno 17/18 issues, viz `docs/issues-triage.md`.
- Zbývá: tento plán (#8) + zavření issues na GitHubu (potřebuje `gh auth login`)
  + případný merge do `main`.
