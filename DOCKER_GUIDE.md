
# Guide Docker PulsarInfinite

## 🚀 Démarrage Rapide

### Prérequis
- Docker & Docker Compose installés
- Ports 80, 5002, 5432, 6379, 9000 disponibles

### 1. Configuration
```bash
# Copier la configuration Docker
cp .env.docker.example .env.docker

# Éditer les variables si nécessaire
nano .env.docker
```

### 2. Mode Production
```bash
# Rendre les scripts exécutables
chmod +x docker-scripts/*.sh

# Construire et démarrer
./docker-scripts/start-production.sh

# Accéder à l'application
# Frontend: http://localhost
# Backend API: http://localhost:5002/api/health
# Portainer: http://localhost:9000
```

### 3. Mode Développement
```bash
# Démarrer en mode dev
./docker-scripts/start-development.sh

# Accéder à l'application
# Frontend: http://localhost:8080
# Backend API: http://localhost:5002/api/health
```

## 📊 Services Disponibles

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 80 | Interface React (Production) |
| Frontend Dev | 8080 | Interface React (Développement) |
| Backend | 5002 | API Flask |
| PostgreSQL | 5432 | Base de données |
| Redis | 6379 | Cache et sessions |
| Portainer | 9000 | Gestion Docker |

## 🔧 Commandes Utiles

### Logs
```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Gestion
```bash
# Redémarrer un service
docker-compose restart backend

# Accéder à un conteneur
docker exec -it pulsar-backend bash
docker exec -it pulsar-frontend sh

# Vérifier l'état
docker-compose ps
```

### Base de données
```bash
# Accéder à PostgreSQL
docker exec -it pulsar-postgres psql -U pulsar_user -d pulsar_irrigation

# Backup
docker exec pulsar-postgres pg_dump -U pulsar_user pulsar_irrigation > backup.sql

# Restore
docker exec -i pulsar-postgres psql -U pulsar_user pulsar_irrigation < backup.sql
```

## 🐛 Dépannage

### Problèmes courants
1. **Port déjà utilisé**: Modifier les ports dans docker-compose.yml
2. **Permissions DB**: Vérifier les volumes et permissions
3. **MQTT non accessible**: Vérifier la configuration réseau

### Reset complet
```bash
# Arrêter tout
./docker-scripts/stop.sh

# Supprimer volumes (⚠️ perte de données)
docker-compose down -v

# Reconstruire
docker-compose build --no-cache
```

## 🔐 Sécurité

### Variables sensibles
- Changez `SECRET_KEY` en production
- Utilisez un mot de passe fort pour PostgreSQL
- Configurez un reverse proxy (Nginx/Traefik) en production

### Backup
```bash
# Script de backup automatique
docker exec pulsar-postgres pg_dump -U pulsar_user pulsar_irrigation | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```
