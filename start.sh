#!/bin/sh
set -e

echo "→ Synchronisation de la base de données..."
npx prisma db push --skip-generate

echo "→ Démarrage de l'application..."
exec node server.js
