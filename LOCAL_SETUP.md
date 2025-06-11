
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

## Logs de Debug

Tous les logs sont visibles dans:
- Console navigateur (Frontend)
- Terminal backend (Flask)

## Résolution des Problèmes

1. **Backend non accessible**: Vérifier que Flask tourne sur port 5002
2. **Erreur CORS**: Backend configuré pour localhost:8080
3. **Timeout**: Augmenté à 15s pour les requêtes
