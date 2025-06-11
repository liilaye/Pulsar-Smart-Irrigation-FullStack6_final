
#!/bin/bash

echo "🧪 Test LOCAL PulsarInfinite"
echo "=========================="

# Test 1: Dépendances
echo "📋 Test dépendances..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 manquant"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js manquant"
    exit 1
fi

echo "✅ Dépendances OK"

# Test 2: Installation
echo "📦 Vérification installations..."
if [ ! -d "node_modules" ]; then
    echo "Installation npm..."
    npm install
fi

# Test 3: Build
echo "🔨 Test build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build OK"
else
    echo "❌ Erreur build"
    exit 1
fi

# Test 4: Backend temporaire
echo "🐍 Test backend temporaire..."
cd backend
python3 app.py &
FLASK_PID=$!
cd ..

sleep 3

if curl -s http://localhost:5002/api/health > /dev/null; then
    echo "✅ Backend accessible"
else
    echo "❌ Backend inaccessible"
fi

kill $FLASK_PID 2>/dev/null

echo
echo "✅ TESTS TERMINÉS - Système prêt !"
echo "Démarrer avec: ./start-dev.sh"
