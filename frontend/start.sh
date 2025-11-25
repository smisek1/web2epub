#!/bin/bash
# Skript pro spuštění React frontendu

cd "$(dirname "$0")"

# Zkontroluj, zda jsou nainstalované závislosti
if [ ! -d "node_modules" ]; then
    echo "Instaluji závislosti..."
    npm install
fi

echo "Spouštím React aplikaci na http://localhost:3000"
npm start


