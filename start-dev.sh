
#!/bin/bash

echo "🚀 Démarrage LOCAL PulsarInfinite"
echo "================================="

# Vérifications de base
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 requis"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js requis"
    exit 1
fi

echo "✅ Prérequis OK"

# Installation des dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation npm..."
    npm install
fi

# Fonction de nettoyage
cleanup() {
    echo
    echo "🛑 Arrêt des services locaux..."
    kill $FLASK_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    echo "✅ Services arrêtés"
    exit 0
}

trap cleanup SIGINT

# Démarrer Flask local
echo "🐍 Démarrage Flask local (port 5002)..."
cd backend
python3 app.py &
FLASK_PID=$!
cd ..

# Attendre Flask
echo "⏰ Attente Flask (5s)..."
sleep 5

# Vérifier Flask
if curl -s http://localhost:5002/api/health > /dev/null; then
    echo "✅ Backend Flask OK sur http://localhost:5002"
else
    echo "❌ Flask non accessible"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi

# Démarrer Vite sur port 8080
echo "⚛️  Démarrage React (port 8080)..."
npm run dev &
VITE_PID=$!

echo
echo "🎉 SYSTÈME LOCAL PRÊT !"
echo "======================="
echo "🔧 Backend:  http://localhost:5002"
echo "🌐 Frontend: http://localhost:8080"
echo
echo "Ctrl+C pour arrêter"

wait
