
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

## Résolution des Problèmes

1. **Backend non accessible**: Vérifier que Flask tourne sur port 5002
2. **Erreur CORS**: Backend configuré pour localhost:8080
3. **Timeout**: Augmenté à 15s pour les requêtes
4. **Format ML**: Vérifier que les features sont un tableau de 15 nombres
