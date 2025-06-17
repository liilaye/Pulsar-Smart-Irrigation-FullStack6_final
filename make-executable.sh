
#!/bin/bash

echo "🔧 Configuration des permissions scripts Docker"

# Créer le dossier docker-scripts s'il n'existe pas
mkdir -p docker-scripts

# Rendre tous les scripts exécutables
chmod +x docker-scripts/*.sh
chmod +x test-docker.sh
chmod +x make-executable.sh

echo "✅ Permissions configurées"
echo "📝 Scripts disponibles:"
ls -la docker-scripts/
ls -la test-docker.sh
