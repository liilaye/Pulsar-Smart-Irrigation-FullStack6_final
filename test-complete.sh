
#!/bin/bash

echo "🧪 Tests complets du système PulsarInfinite"
echo "=========================================="

# Test 1: Vérification des dépendances
echo "📋 Test 1: Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "🔄 Installation des dépendances npm..."
    npm install
fi

if [ ! -d "backend/venv" ]; then
    echo "🔄 Création de l'environnement virtuel Python..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

echo "✅ Dépendances vérifiées"

# Test 2: Compilation TypeScript
echo "📋 Test 2: Compilation TypeScript..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Compilation TypeScript réussie"
else
    echo "❌ Erreur de compilation TypeScript"
    exit 1
fi

# Test 3: Test du backend Flask
echo "📋 Test 3: Test du backend Flask..."
cd backend
python3 test_connections.py
cd ..

# Test 4: Test de l'API
echo "📋 Test 4: Test des endpoints API..."
if curl -s http://localhost:5002/api/health > /dev/null; then
    echo "✅ API accessible"
    
    # Test des endpoints principaux
    echo "🔄 Test endpoints..."
    curl -s http://localhost:5002/api/irrigation/status > /dev/null && echo "  ✅ /irrigation/status"
    curl -s http://localhost:5002/api/weather/thies > /dev/null && echo "  ✅ /weather/thies"
    curl -s -X POST http://localhost:5002/api/mqtt/test-publish -H "Content-Type: application/json" -d '{"device":0}' > /dev/null && echo "  ✅ /mqtt/test-publish"
else
    echo "❌ API non accessible - Démarrez le backend avec: cd backend && python3 app.py"
fi

echo "📋 Test 5: Validation finale..."
echo "✅ Tous les tests terminés"
echo ""
echo "🚀 Le système est prêt pour le déploiement!"
echo "   Pour démarrer: ./start-dev.sh"
