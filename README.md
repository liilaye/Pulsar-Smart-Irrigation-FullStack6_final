
# PulsarInfinite - Système d'Irrigation Intelligent

## 🌱 Description

PulsarInfinite est un système d'irrigation intelligent Full Stack combinant Machine Learning, IoT et analyse météorologique pour optimiser l'irrigation agricole.

## 🏗️ Architecture

```
PulsarInfinite/
├── backend/           # Backend Flask Python
│   ├── app.py        # Application principale
│   ├── routes/       # Endpoints API
│   ├── services/     # Services ML, MQTT, Météo
│   └── config/       # Configuration DB, MQTT
├── src/              # Frontend React TypeScript
│   ├── components/   # Composants UI
│   ├── services/     # Services API
│   ├── hooks/        # Hooks React personnalisés
│   └── pages/        # Pages de l'application
└── public/           # Assets statiques
```

## 🚀 Démarrage Rapide (macOS)

### Méthode automatique
```bash
chmod +x start-macos.sh
./start-macos.sh
```

### Méthode manuelle

#### 1. Backend Flask
```bash
cd backend
pip3 install -r requirements.txt
python3 app.py
```

#### 2. Frontend React (nouveau terminal)
```bash
npm install
npm run dev
```

## 🌐 URLs d'accès

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5002
- **Test santé**: http://localhost:5002/api/health

## 🔧 Technologies

### Backend
- **Flask** - Framework web Python
- **SQLite** - Base de données locale
- **XGBoost** - Machine Learning
- **MQTT** - Communication IoT
- **OpenWeather API** - Données météo

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **Tailwind CSS** - Styling utilitaire
- **Shadcn/UI** - Composants UI
- **React Query** - Gestion état serveur

## 📡 Endpoints API

### Irrigation
- `POST /api/arroser` - Recommandation ML
- `POST /api/irrigation/manual` - Irrigation manuelle
- `POST /api/irrigation/stop` - Arrêt irrigation
- `GET /api/irrigation/status` - Statut système

### Analyses
- `GET /api/analytics/trends` - Tendances d'usage
- `GET /api/analytics/ml-predictions` - Prédictions ML

### Météo
- `GET /api/weather/thies` - Météo Thiès
- `GET /api/weather/taiba-ndiaye` - Météo Taïba Ndiaye

### Système
- `GET /api/health` - Test de santé

## 🤖 Machine Learning

Le système utilise un modèle XGBoost entraîné sur 15 paramètres agro-climatiques :
- Température air/sol
- Humidité air/sol
- Précipitations
- Vitesse du vent
- Type de culture
- Périmètre cultivé
- pH, EC, NPK du sol
- Fertilité du sol

## 🌤️ Intégration Météo

- **OpenWeather API** pour données temps réel
- **Fallback local** si API indisponible
- **Localisation**: Thiès et Taïba Ndiaye

## 📊 Monitoring

- Statut connexion backend en temps réel
- Logs d'irrigation détaillés
- Analyses de tendances
- Dashboard analytique

## 🔄 MQTT IoT

- **Broker**: 217.182.210.54:8080
- **Topics**: Commandes irrigation
- **Devices**: Contrôle pompes/valves

## 🐳 Déploiement

### Développement
```bash
# Frontend
npm run dev

# Backend  
python3 backend/app.py
```

### Production
```bash
# Frontend build
npm run build

# Backend production
gunicorn --bind 0.0.0.0:5002 backend.app:app
```

## 🔒 Variables d'environnement

Créez `.env` dans `/backend/`:
```env
OPENWEATHER_API_KEY=your_api_key
DATABASE_URL=sqlite:///irrigation_logs.db
SECRET_KEY=your_secret_key
MQTT_BROKER_HOST=217.182.210.54
MQTT_BROKER_PORT=8080
```

## 🧪 Tests

```bash
# Backend tests
cd backend
python3 test_connections.py

# Frontend tests
npm test
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Créez une issue GitHub
- Consultez la documentation dans `/docs/`
- Vérifiez les logs dans la console

---

**PulsarInfinite** - L'irrigation intelligente pour l'agriculture moderne 🌱
