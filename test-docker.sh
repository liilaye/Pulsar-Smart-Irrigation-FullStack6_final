
#!/bin/bash

echo "🧪 Test Docker PulsarInfinite"
echo "============================="

# Vérifications préalables
echo "📋 Vérification prérequis..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker non installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose non installé"
    exit 1
fi

echo "✅ Docker OK"

# Test de construction
echo "🔨 Test construction des images..."
docker build -f Dockerfile.frontend -t pulsar-frontend:test . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Image frontend construite"
else
    echo "❌ Erreur construction frontend"
    exit 1
fi

docker build -f Dockerfile.backend -t pulsar-backend:test . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Image backend construite"
else
    echo "❌ Erreur construction backend"
    exit 1
fi

# Test de démarrage
echo "🚀 Test démarrage des services..."
docker-compose -f docker-compose.yml up -d --quiet-pull > /dev/null 2>&1

# Attendre les services
echo "⏰ Attente des services (30s)..."
sleep 30

# Test des endpoints
echo "🔍 Test des endpoints..."

# Test frontend
if curl -s http://localhost > /dev/null; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend inaccessible"
fi

# Test backend
if curl -s http://localhost:5002/api/health | grep -q "ok"; then
    echo "✅ Backend API accessible"
else
    echo "❌ Backend API inaccessible"
fi

# Nettoyer
echo "🧹 Nettoyage..."
docker-compose down > /dev/null 2>&1
docker rmi pulsar-frontend:test pulsar-backend:test > /dev/null 2>&1

echo ""
echo "✅ Tests Docker terminés!"
echo "🚀 Prêt pour le déploiement"
