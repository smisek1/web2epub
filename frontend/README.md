# Web2Epub React Frontend

React frontend aplikace pro Web2Epub projekt.

## Instalace

```bash
npm install
```

## Spuštění

```bash
npm start
```

Aplikace poběží na http://localhost:3000

## Konfigurace

Výchozí API URL je `http://localhost:5000/api`. Pro změnu vytvořte soubor `.env` v kořenovém adresáři frontendu:

```
REACT_APP_API_URL=http://your-api-url/api
```

## Build pro produkci

```bash
npm run build
```

Vytvoří optimalizovanou verzi aplikace ve složce `build/`.

