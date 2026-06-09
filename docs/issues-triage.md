# Roztřídění otevřených GitHub issues

Stav k 2026-06-09, repo `smisek1/web2epub`. Žádné issue nemá label — roztříděno ručně podle obsahu.

## 🐛 Bug (4)

| # | Issue | Poznámka |
|---|---|---|
| #28 | nefunkční datum phys.org | špatný/zastaralý `xpath_datum` v tabulce `stranka` |
| #22 | init nestahuje quantumtech.blog, refresh přeruší stahování | scrape běží synchronně v request handleru — refresh ho zabije |
| #18 | některé obrázky se nestáhnou | důsledek slabiny „vše jako JPG + žádný error handling" (viz CLAUDE.md) |
| #15 | nejde víc než 99 obrázků | dvoumístné zero-padding názvů v `create_book.__citac`/`sIdx` — triviální oprava |

## ✨ Feature (10)

| # | Issue |
|---|---|
| #33 | stažení jednotlivé stránky zadáním URL (root.cz, idnes…) |
| #31 | XPath pro další stránku (paginace přehledů) |
| #29 | purge funkce DB (smazat knihy a články, nechat poslední z každého webu) |
| #27 | testovací prostředí pro XPathy |
| #21 | zobrazit autora ve webovém UI |
| #20 | sloupec v `stranka` zap/vyp stahování — odstranil by hardcoded ID v SQL |
| #17 | přidat nové weby (částečně řešeno merged PR #32) |
| #14 | odstranit odkazy z knihy |
| #13 | přidat datum importu |
| #8 | upload na Dropbox |

## 🔧 Vyřešitelné refaktoringem (4)

| # | Issue | Poznámka |
|---|---|---|
| #26 + #30 | přechod na Docker Compose / oddělit build a compose | duplikáty téhož — nahradily by křehký `01_create_environment.sh`; doporučeno sloučit |
| #10 | přidat logování | náhrada `print` za `logging` napříč skripty |
| #9 | migrace na Node.js | kompletní přepis; zvážit zavření, nebo odložit až po #26 |

## Mimo kategorie

- **#3** — napsat dokumentaci podle Best-README-Template; nový CLAUDE.md je dobrý základ.

## Doporučené pořadí

1. #15 — pětiminutová oprava paddingu
2. #28 — oprava XPath v DB
3. #20 — odstraní hardcoded ID, odblokuje #17
4. #26 — stabilní prostředí (Docker Compose) pro všechno ostatní
