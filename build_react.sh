#!/bin/bash
# Skript pro vytvoření React buildu

echo "Vytvářím React build..."

cd "$(dirname "$0")/frontend"

# Zkontroluj Node.js
if ! command -v node &> /dev/null; then
    echo "Chyba: Node.js není nainstalován!"
    echo "Nainstalujte Node.js a spusťte skript znovu."
    exit 1
fi

# Nainstaluj závislosti, pokud nejsou
if [ ! -d "node_modules" ]; then
    echo "Instaluji závislosti..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Chyba při instalaci závislostí!"
        exit 1
    fi
fi

# Vytvoř build
echo "Vytvářím produkční build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ React build byl úspěšně vytvořen!"
    echo "Build je ve složce: frontend/build"
    echo "Flask nyní servuje React aplikaci místo starého frontendu"
    echo "=========================================="
else
    echo "Chyba při vytváření buildu!"
    exit 1
fi

