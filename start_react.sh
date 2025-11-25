#!/bin/bash
# Skript pro spuštění React frontendu

echo "Kontroluji Node.js..."

# Zkontroluj Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js není nainstalován!"
    echo ""
    echo "Instalace Node.js pomocí nvm (doporučeno):"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 18"
    echo "  nvm use 18"
    echo ""
    echo "Nebo pomocí apt (Ubuntu/Debian):"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y nodejs npm"
    echo ""
    read -p "Chcete nainstalovat Node.js pomocí apt? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo apt-get update
        sudo apt-get install -y nodejs npm
    else
        echo "Ukončuji. Nainstalujte Node.js a spusťte skript znovu."
        exit 1
    fi
fi

# Zkontroluj npm
if ! command -v npm &> /dev/null; then
    echo "npm není nainstalován!"
    exit 1
fi

echo "Node.js verze: $(node --version)"
echo "npm verze: $(npm --version)"
echo ""

# Přejdi do frontend složky
cd "$(dirname "$0")/frontend"

# Zkontroluj, zda existuje package.json
if [ ! -f "package.json" ]; then
    echo "Chyba: package.json nenalezen!"
    exit 1
fi

# Nainstaluj závislosti, pokud nejsou nainstalované
if [ ! -d "node_modules" ]; then
    echo "Instaluji závislosti..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Chyba při instalaci závislostí!"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "Spouštím React aplikaci..."
echo "Aplikace bude dostupná na: http://localhost:3000"
echo "Ujistěte se, že Flask backend běží na: http://localhost:5000"
echo "=========================================="
echo ""

# Spusť React aplikaci
npm start


