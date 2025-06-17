
#!/bin/bash

echo "🛑 Arrêt de PulsarInfinite"
echo "========================="

# Arrêter production
docker-compose down

# Arrêter développement
docker-compose -f docker-compose.dev.yml down

echo "✅ Tous les services arrêtés"
