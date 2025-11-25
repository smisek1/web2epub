# Migrace z Flask frontendu na React

Tento dokument popisuje migraci frontendu z Flask šablon na React aplikaci.

## Struktura projektu

### Backend (Flask)
- `web/create.py` - Flask aplikace s REST API endpointy
- Původní Flask routy jsou zachovány pro zpětnou kompatibilitu
- Nové API endpointy jsou dostupné pod `/api/*`

### Frontend (React)
- `frontend/` - React aplikace
  - `src/App.js` - Hlavní komponenta
  - `src/components/ArticleList.js` - Komponenta pro zobrazení seznamu článků
  - `src/services/api.js` - API klient pro komunikaci s backendem

## API Endpointy

### GET `/api/articles`
Vrací seznam všech článků ve formátu JSON.

**Response:**
```json
[
  [id_clanky, nadpis, jmeno, clanek, datum, posledni],
  ...
]
```

### POST `/api/articles/trash`
Přesune vybrané články do koše.

**Request:**
```json
{
  "ids": ["1", "2", "3"]
}
```

### POST `/api/books/create`
Vytvoří EPUB knihu z vybraných článků a vrátí soubor ke stažení.

**Request:**
```json
{
  "ids": ["1", "2", "3"]
}
```

**Response:** EPUB soubor (binary)

### POST `/api/articles/load`
Načte nové články z webových stránek.

## Instalace a spuštění

### Backend
```bash
pip install -r requirements.txt
cd web
python create.py
```

Backend poběží na `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm start
```

Frontend poběží na `http://localhost:3000`

## Konfigurace

Pro změnu API URL vytvořte soubor `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Build pro produkci

```bash
cd frontend
npm run build
```

Vytvoří optimalizovanou verzi ve složce `build/`, kterou můžete nasadit na statický web server.

