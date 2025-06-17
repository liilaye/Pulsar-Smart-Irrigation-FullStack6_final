
#!/bin/bash

echo "🛠️ Démarrage PulsarInfinite en mode Développement"
echo "================================================="

# Démarrer en mode développement
echo "🚀 Démarrage des services de développement..."
docker-compose -f docker-compose.dev.yml up -d

# Attendre que les services soient prêts
echo "⏰ Attente des services..."
sleep 5

# Vérifier l'état
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Environnement de développement prêt!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:5002"
echo ""
echo "📝 Hot reload activé pour le développement"
echo "📝 Logs: docker-compose -f docker-compose.dev.yml logs -f"
