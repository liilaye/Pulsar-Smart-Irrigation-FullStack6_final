
# Modèles ML PulsarInfinite

## Modèle XGBoost Manquant

Le fichier `xgboost_arrosage_litres.pkl` n'est pas présent dans ce repository.

### Pour tester sans le modèle ML :
Le backend Flask continuera de fonctionner et retournera des données de fallback pour les endpoints ML.

### Pour ajouter le modèle :
1. Placez votre fichier `xgboost_arrosage_litres.pkl` dans ce dossier
2. Redémarrez le serveur Flask
3. Le modèle sera automatiquement chargé

### Structure attendue :
```
backend/models/
├── README.md (ce fichier)
└── xgboost_arrosage_litres.pkl (votre modèle)
```

Le modèle doit être compatible avec :
- 15 features d'entrée (paramètres agro-climatiques)
- Sortie : prédiction de volume d'irrigation en litres
