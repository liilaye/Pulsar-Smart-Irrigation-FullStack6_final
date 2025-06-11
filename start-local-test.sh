
#!/bin/bash

echo "🚀 Démarrage PulsarInfinite - Test Local Complet"
echo "================================================"

# Vérifications préalables
echo "🔍 Vérifications du système..."

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 requis pour le backend Flask"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js requis pour le frontend React"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm requis"
    exit 1
fi

echo "✅ Prérequis système OK"

# Vérifier la structure du projet
if [ ! -d "backend" ] || [ ! -f "backend/app.py" ]; then
    echo "❌ Structure backend manquante (backend/app.py)"
    exit 1
fi

if [ ! -d "src" ] || [ ! -f "package.json" ]; then
    echo "❌ Structure frontend manquante"
    exit 1
fi

echo "✅ Structure projet OK"

# Installation des dépendances frontend si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation dépendances npm..."
    npm install
else
    echo "✅ Dépendances npm présentes"
fi

# Fonction de nettoyage
cleanup() {
    echo
    echo "🛑 Arrêt des services..."
    if [ ! -z "$FLASK_PID" ]; then
        kill $FLASK_PID 2>/dev/null
        echo "✅ Backend Flask arrêté"
    fi
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null
        echo "✅ Frontend Vite arrêté"
    fi
    echo "✅ Nettoyage terminé"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Démarrage du backend Flask
echo "🐍 Démarrage Backend Flask (port 5002)..."
cd backend

# Vérifier les dépendances Python
if [ -f "requirements.txt" ]; then
    echo "📦 Vérification dépendances Python..."
    pip3 install -r requirements.txt --quiet
fi

# Créer le fichier .env si nécessaire
if [ ! -f ".env" ]; then
    echo "📝 Création .env pour développement..."
    echo "SECRET_KEY=dev-local-secret" > .env
    echo "DATABASE_URL=sqlite:///irrigation_logs.db" >> .env
fi

# Démarrer Flask
python3 app.py &
FLASK_PID=$!
echo "✅ Backend Flask démarré (PID: $FLASK_PID)"

cd ..

# Attendre que Flask soit prêt
echo "⏰ Attente initialisation Flask..."
sleep 3

# Test de connexion Flask
echo "🔍 Test connexion Flask..."
if curl -s -f http://localhost:5002/api/health > /dev/null; then
    echo "✅ Backend Flask opérationnel"
else
    echo "❌ Backend Flask non accessible - Vérifiez les logs"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi

# Démarrage du frontend React
echo "⚛️  Démarrage Frontend React (port 8080)..."
npm run dev &
VITE_PID=$!
echo "✅ Frontend React démarré (PID: $VITE_PID)"

# Attendre Vite
sleep 2

echo
echo "🎉 SYSTÈME COMPLET DÉMARRÉ !"
echo "============================"
echo "🌐 Frontend: http://localhost:8080"
echo "🔗 Backend:  http://localhost:5002"
echo "🩺 Health:   http://localhost:5002/api/health"
echo
echo "📋 TESTS DISPONIBLES:"
echo "  • Arrosage Manuel (Démarrer/Arrêter)"
echo "  • Irrigation Intelligente ML"
echo "  • Communication MQTT via Flask"
echo "  • Monitoring temps réel"
echo
echo "⚠️  IMPORTANT:"
echo "  • Modèle ML: backend/models/xgboost_arrosage_litres.pkl"
echo "  • Broker MQTT: 217.182.210.54:1883"
echo "  • Base de données: backend/irrigation_logs.db"
echo
echo "🔧 Pour arrêter: Ctrl+C dans ce terminal"
echo

# Maintenir les processus
wait
