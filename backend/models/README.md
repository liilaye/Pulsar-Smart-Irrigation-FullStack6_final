
# Modèles ML - PulsarInfinite

## Placement du modèle pré-entraîné

Placez votre fichier `xgboost_arrosage_litres.pkl` dans ce dossier.

Le modèle doit être capable de prédire la quantité d'eau (en m³) basée sur 15 features agro-climatiques :

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

## Structure attendue

```
backend/
  models/
    xgboost_arrosage_litres.pkl  ← Votre modèle ici
    README.md
```

Le modèle sera automatiquement chargé au démarrage du serveur Flask.
