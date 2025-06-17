
#!/bin/bash

echo "🐳 Construction des images Docker PulsarInfinite"
echo "================================================"

# Construction de l'image frontend
echo "📦 Construction Frontend React..."
docker build -f Dockerfile.frontend -t pulsar-frontend:latest .

# Construction de l'image backend
echo "🐍 Construction Backend Flask..."
docker build -f Dockerfile.backend -t pulsar-backend:latest .

echo "✅ Images Docker construites avec succès!"
echo "🔍 Images disponibles:"
docker images | grep pulsar
