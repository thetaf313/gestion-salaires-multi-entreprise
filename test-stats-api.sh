#!/bin/bash

# Script de test des API de statistiques

echo "🧪 Test des API de statistiques..."

# Récupérer un token d'accès valide
echo "🔐 Connexion pour obtenir un token..."
TOKEN_RESPONSE=$(curl -s -X POST "http://localhost:3003/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@synergypay.com",
    "password": "superadmin123"
  }')

echo "📝 Réponse de connexion: $TOKEN_RESPONSE"

# Extraire le token (supposons qu'il soit dans data.accessToken)
ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Impossible de récupérer le token d'accès"
  exit 1
fi

echo "✅ Token obtenu: ${ACCESS_TOKEN:0:20}..."

echo ""
echo "📊 Test de l'API des statistiques générales..."
curl -X GET "http://localhost:3003/api/statistics/general" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Réponse reçue (pas de jq)"

echo ""
echo "📊 Test de l'API des statistiques mensuelles..."
curl -X GET "http://localhost:3003/api/statistics/monthly" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | jq '.' 2>/dev/null || echo "Réponse reçue (pas de jq)"

echo ""
echo "✅ Tests terminés"