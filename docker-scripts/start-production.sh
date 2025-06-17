
#!/bin/bash

echo "🚀 Démarrage PulsarInfinite en mode Production"
echo "=============================================="

# Vérifier que les variables d'environnement sont définies
if [ ! -f .env.docker ]; then
    echo "❌ Fichier .env.docker manquant"
    echo "Copiez .env.docker.example vers .env.docker et configurez-le"
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Construire les images
echo "🔨 Construction des images..."
docker-compose build

# Démarrer en mode production
echo "🚀 Démarrage des services..."
docker-compose --env-file .env.docker up -d

# Attendre que les services soient prêts
echo "⏰ Attente des services..."
sleep 10

# Vérifier l'état des services
echo "🔍 Vérification des services..."
docker-compose ps

# Afficher les logs si erreur
if [ $? -ne 0 ]; then
    echo "❌ Erreur détectée, affichage des logs:"
    docker-compose logs
    exit 1
fi

echo ""
echo "✅ PulsarInfinite démarré avec succès!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:5002"
echo "📊 Portainer: http://localhost:9000"
echo ""
echo "📝 Commandes utiles:"
echo "  - Logs: docker-compose logs -f"
echo "  - Arrêt: docker-compose down"
echo "  - Restart: docker-compose restart"
