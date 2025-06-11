
#!/bin/bash

echo "🚀 Démarrage de l'environnement de développement PulsarInfinite"
echo "================================================================="

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 n'est pas installé"
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

echo "✅ Python et Node.js détectés"

# Démarrer le backend Flask en arrière-plan
echo "🔄 Démarrage du backend Flask..."
cd backend
python3 app.py &
FLASK_PID=$!
cd ..

# Attendre que Flask démarre
echo "⏰ Attente du démarrage du backend..."
sleep 5

# Vérifier si Flask fonctionne
if curl -s http://localhost:5002/api/health > /dev/null; then
    echo "✅ Backend Flask démarré avec succès"
else
    echo "❌ Erreur: Backend Flask non accessible"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi

# Démarrer le frontend React
echo "🔄 Démarrage du frontend React..."
npm run dev &
VITE_PID=$!

echo "🎉 Environnement de développement démarré!"
echo "   - Backend Flask: http://localhost:5002"
echo "   - Frontend React: http://localhost:5173"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter tous les services"

# Fonction de nettoyage
cleanup() {
    echo "🛑 Arrêt des services..."
    kill $FLASK_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    echo "✅ Services arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
wait
