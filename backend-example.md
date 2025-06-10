
# Backend API Structure pour PulsarInfinite

## Endpoints requis

### 1. POST /api/schedules
Reçoit les plannings de l'interface pour analyse ML
```json
{
  "schedules": {
    "Lundi": { "enabled": true, "startTime": "06:00", "endTime": "18:00" },
    ...
  },
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### 2. POST /api/irrigation/manual
Démarre l'irrigation manuelle
```json
{
  "durationHours": 1,
  "durationMinutes": 30,
  "scheduledBy": "MANUAL",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### 3. GET /api/irrigation/status
Retourne le statut actuel
```json
{
  "isActive": true,
  "lastMLRecommendation": {
    "durationHours": 2,
    "durationMinutes": 15,
    "scheduledBy": "ML",
    "timestamp": "2024-01-01T09:00:00Z"
  }
}
```

### 4. POST /api/ml/recommendation (Endpoint pour le modèle ML)
Le modèle ML envoie ses recommandations
```json
{
  "durationHours": 2,
  "durationMinutes": 30,
  "confidence": 0.95,
  "factors": ["temperature", "humidity", "soil_moisture", ...]
}
```

## Flux de données

1. **Interface → Backend** : Envoi des plannings
2. **ML Model → Backend** : Analyse des 15 paramètres → Recommandation de durée
3. **Backend → Interface** : Mise à jour du statut d'irrigation
4. **Backend → MQTT** : Déclenchement de l'irrigation physique

## Variables d'environnement suggérées

```env
MQTT_BROKER_URL=mqtt://217.182.210.54:8080
MQTT_TOPIC=data/PulsarInfinite/swr
ML_API_URL=http://your-ml-service:5000
DATABASE_URL=postgresql://...
```
