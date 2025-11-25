# Jak spustit Web2Epub s React frontendem

## Možnost 1: Spuštění React aplikace lokálně (pro vývoj)

React frontend musí běžet samostatně na portu 3000, zatímco Flask backend běží v Dockeru na portu 5000.

### Krok 1: Spusťte backend (Docker)
```bash
./01_create_environment.sh
```

Backend poběží na `http://localhost:5000`

### Krok 2: Spusťte React frontend (lokálně)

**Pokud nemáte Node.js:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y nodejs npm

# Nebo použijte nvm (doporučeno)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Spuštění React aplikace:**
```bash
cd frontend
npm install
npm start
```

React aplikace poběží na `http://localhost:3000`

## Možnost 2: Produkční build servovaný přes Flask

Pokud chcete servovat React aplikaci přímo přes Flask (jeden port):

### Krok 1: Vytvořte React build
```bash
cd frontend
npm install
npm run build
```

### Krok 2: Spusťte Flask backend
```bash
./01_create_environment.sh
```

Flask automaticky detekuje React build ve složce `frontend/build` a servuje ho na `http://localhost:5000`

## Řešení problémů

### Port 3000 není dostupný
- Zkontrolujte, zda něco neběží na portu 3000: `lsof -i :3000`
- Nebo změňte port v `frontend/.env`: `PORT=3001`

### React se nemůže připojit k API
- Zkontrolujte, že Flask backend běží na portu 5000
- V `frontend/.env` nastavte: `REACT_APP_API_URL=http://localhost:5000/api`

### CORS chyby
- Flask backend má povolený CORS, ale zkontrolujte, že `flask-cors` je nainstalován:
  ```bash
  pip install flask-cors
  ```


