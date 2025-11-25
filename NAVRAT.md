# Návrat k React frontendu - úplná náhrada Flask frontendu

## Co bylo změněno:

1. **Odstraněny staré Flask frontend routy:**
   - `/create/` - odstraněno
   - `/create/<name>/` - odstraněno  
   - `/create` (POST/GET) - odstraněno

2. **Zachovány pouze API endpointy:**
   - `GET /api/articles` - získání článků
   - `POST /api/articles/trash` - přesun do koše
   - `POST /api/books/create` - vytvoření knihy
   - `POST /api/articles/load` - načtení článků

3. **Flask nyní servuje React aplikaci:**
   - Pokud existuje `frontend/build`, Flask servuje React aplikaci na všech cestách kromě `/api/*`
   - Všechny cesty (včetně `/create/console/`) nyní vedou na React aplikaci

## Jak to funguje:

### Pro vývoj (React dev server):
```bash
# Spusťte backend
./01_create_environment.sh

# V jiném terminálu spusťte React dev server
./start_react.sh
# React poběží na http://localhost:3000
# Flask API na http://localhost:5000/api
```

### Pro produkci (React build servovaný přes Flask):
```bash
# 1. Vytvořte React build
./build_react.sh

# 2. Spusťte backend (Flask automaticky servuje React build)
./01_create_environment.sh

# Aplikace je dostupná na http://localhost:5000
# Všechny cesty (včetně /create/console/) vedou na React aplikaci
```

## Důležité:

- **Starý Flask frontend je úplně odstraněn** - routy `/create/*` už neexistují
- **React je nyní jediný frontend** - servuje se buď přes dev server (port 3000) nebo jako build přes Flask (port 5000)
- **API endpointy zůstávají na `/api/*`** - ty jsou zachovány pro React aplikaci

## Řešení problémů:

### Pokud vidíte starý Flask frontend:
1. Zkontrolujte, zda existuje `frontend/build` složka
2. Pokud ne, spusťte `./build_react.sh`
3. Restartujte Flask backend

### Pokud React build neexistuje:
Flask zobrazí chybovou zprávu s instrukcemi. Spusťte:
```bash
./build_react.sh
```

