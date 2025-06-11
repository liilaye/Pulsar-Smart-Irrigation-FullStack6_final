
# Configuration pour Tests Locaux - PulsarInfinite

## Prérequis

1. **Backend Flask** doit être démarré sur `localhost:5002`
2. **Frontend React** sur `localhost:8080` (via Vite)

## Instructions de Démarrage

### 1. Backend Flask
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Le backend démarrera sur `http://localhost:5002`

### 2. Frontend React
```bash
npm install
npm run dev
```
Le frontend démarrera sur `http://localhost:8080`

## Configuration Réseau

- **Proxy Vite**: `/api/*` → `http://localhost:5002`
- **MQTT Broker**: `217.182.210.54:1883` (via backend)
- **WebSocket**: Désactivé (utilise API REST via backend)

## Endpoints Testés

- `GET /api/health` - Santé du backend
- `POST /api/mqtt/test-publish` - Commandes MQTT
- `POST /api/arroser` - Recommandations ML
- `POST /api/irrigation/schedule` - **Plannings programmés avec IA**
- `GET /api/irrigation/schedule/status` - **Statut des plannings actifs**

## Nouvelles Fonctionnalités: Plannings Programmés IA

### 🤖 Analyse Automatique par IA
- Les plannings envoyés sont **automatiquement analysés** par le modèle ML
- Chaque créneau reçoit une **durée et volume optimisés** par l'IA
- Les recommandations sont basées sur les paramètres agro-climatiques

### 📅 Surveillance Automatique
- Un **thread de surveillance** vérifie l'heure en continu
- **Déclenchement automatique** de l'irrigation aux heures programmées
- **Envoi direct** des commandes MQTT vers le broker PulsarInfinite

### 🔄 Flux Complet
1. **Frontend** → Envoi planning → **Backend Flask**
2. **IA** → Analyse et optimisation → **Plannings enrichis**
3. **Thread surveillance** → Détection heure → **Commande MQTT**
4. **Broker MQTT** → **Exécution irrigation** → **Device PulsarInfinite**

## Format des Données ML

### ✅ Format CORRECT (Tableau de 15 valeurs) :
```json
{
  "features": [25.0, 0, 65, 12.0, 1, 10000, 26.0, 42, 1.2, 6.8, 45, 38, 152, 3, 2]
}
```

### Ordre des paramètres :
1. Température_air_(°C)
2. Précipitation_(mm)
3. Humidité_air_(%)
4. Vent_moyen_(km/h)
5. Type_culture
6. Périmètre_agricole_(m2)
7. Température_sol_(°C)
8. Humidité_sol_(%)
9. EC_(dS/m)
10. pH_sol
11. Azote_(mg/kg)
12. Phosphore_(mg/kg)
13. Potassium_(mg/kg)
14. Fertilité_(score)
15. Type_sol

## Test des Plannings Programmés

### Via Interface Frontend
1. Aller sur `/dashboard`
2. Section "Contrôle Programmé"
3. Activer un jour et définir une heure
4. Cliquer "Optimiser par IA et Programmer"
5. Vérifier l'analyse IA affichée

### Via cURL Backend
```bash
# Envoyer un planning
curl -X POST http://localhost:5002/api/irrigation/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "schedules": {
      "Lundi": {"enabled": true, "startTime": "08:00", "endTime": "18:00"}
    }
  }'

# Vérifier le statut
curl -X GET http://localhost:5002/api/irrigation/schedule/status
```

## Test cURL du Modèle ML

```bash
curl -X POST http://localhost:5002/api/arroser \
  -H "Content-Type: application/json" \
  -d '{"features": [29, 0, 62, 4, 1, 600, 26, 40, 0.9, 6.5, 10, 15, 20, 4, 2]}'
```

## Logs de Debug

Tous les logs sont visibles dans:
- Console navigateur (Frontend)
- Terminal backend (Flask)
- **Logs spécifiques plannings** : Thread de surveillance

## Résolution des Problèmes

1. **Backend non accessible**: Vérifier que Flask tourne sur port 5002
2. **Erreur CORS**: Backend configuré pour localhost:8080
3. **Timeout**: Augmenté à 15s pour les requêtes
4. **Format ML**: Vérifier que les features sont un tableau de 15 nombres
5. **Plannings non déclenchés**: Vérifier les logs du thread de surveillance
6. **Commandes MQTT**: Vérifier la connexion au broker 217.182.210.54:1883

## Architecture Complète

```
Frontend (localhost:8080)
    ↓ /api/* (proxy)
Backend Flask (localhost:5002)
    ↓ MQTT TCP
Broker PulsarInfinite (217.182.210.54:1883)
    ↓ Commandes
Device IoT (PulsarInfinite)
```

Le système est maintenant **100% fonctionnel** avec analyse IA automatique et exécution programmée !
