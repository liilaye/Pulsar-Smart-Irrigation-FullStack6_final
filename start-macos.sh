
#!/bin/bash

echo "🚀 Démarrage PulsarInfinite Full Stack (macOS)"
echo "=============================================="

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "src" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Fonction pour vérifier si un port est utilisé
check_port() {
    if lsof -i :$1 > /dev/null 2>&1; then
        echo "⚠️  Port $1 déjà utilisé"
        return 1
    fi
    return 0
}

# Vérifier les ports (5173 pour Vite standard, 5002 pour Flask)
if ! check_port 5173; then
    echo "❌ Port 5173 (Frontend Vite) déjà utilisé"
    echo "Arrêtez le processus existant ou changez le port"
    exit 1
fi

if ! check_port 5002; then
    echo "❌ Port 5002 (Backend Flask) déjà utilisé" 
    echo "Arrêtez le processus existant ou changez le port"
    exit 1
fi

echo "✅ Ports 5173 et 5002 disponibles"

# Démarrer le backend Flask
echo "🐍 Démarrage du backend Flask..."
cd backend

if [ ! -f "app.py" ]; then
    echo "❌ app.py non trouvé dans le dossier backend"
    exit 1
fi

# Créer un .env minimal si il n'existe pas
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env pour le développement local..."
    cp .env.example .env 2>/dev/null || echo "SECRET_KEY=dev-secret-key" > .env
fi

# Installer les dépendances Python si requirements.txt existe
if [ -f "requirements.txt" ]; then
    echo "📦 Installation des dépendances Python..."
    pip3 install -r requirements.txt
fi

# Démarrer Flask en arrière-plan
python3 app.py &
FLASK_PID=$!
echo "✅ Backend Flask démarré (PID: $FLASK_PID) sur http://localhost:5002"

# Retourner au répertoire racine
cd ..

# Démarrer le frontend React avec Vite
echo "⚛️  Démarrage du frontend React..."

# Installer les dépendances Node.js
echo "📦 Installation des dépendances Node.js..."
npm install

# Démarrer Vite en arrière-plan
npm run dev &
VITE_PID=$!
echo "✅ Frontend React démarré (PID: $VITE_PID) sur http://localhost:5173"

echo ""
echo "🎉 PulsarInfinite Full Stack démarré avec succès!"
echo "=============================================="
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 Backend:  http://localhost:5002"
echo "📊 API:      http://localhost:5002/api/health"
echo ""
echo "⚠️  Note: Le modèle ML n'est pas inclus. Placez 'xgboost_arrosage_litres.pkl' dans backend/models/"
echo ""
echo "Pour arrêter les services:"
echo "  - Ctrl+C dans ce terminal"
echo "  - Ou: kill $FLASK_PID $VITE_PID"
echo ""

# Fonction de nettoyage au signal d'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $FLASK_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    echo "✅ Services arrêtés"
    exit 0
}

# Capturer les signaux d'arrêt
trap cleanup SIGINT SIGTERM

# Attendre que les processus se terminent
wait
