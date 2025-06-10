
import joblib
import pandas as pd
import numpy as np
import os
from config.mqtt_config import MODEL_PATH, DEBIT_LITRES_PAR_MIN

import os
import joblib

class MLService:
    def __init__(self):
        self.model = None
        self.model_path = os.path.join("models", "xgboost_arrosage_litres.pkl")
        self.load_model()

    def load_model(self):
        """Charge le modèle XGBoost pré-entraîné"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f" Modèle non trouvé à l'emplacement : {self.model_path}")
        
        try:
            self.model = joblib.load(self.model_path)
            print("Modèle XGBoost chargé avec succès.")
        except Exception as e:
            print(f" Erreur lors du chargement du modèle : {e}")
            raise

    
    def predict_irrigation(self, features_data):
        """Prédit la quantité d'eau nécessaire basée sur les features agro-climatiques"""
        if not self.model:
            raise Exception("Modèle ML non disponible")
        
        try:
            # Colonnes attendues par le modèle
            columns = [
                "Température_air_(°C)", "Précipitation_(mm)", "Humidité_air_(%)", "Vent_moyen_(km/h)",
                "Type_culture", "Périmètre_agricole_(m2)", "Température_sol_(°C)", "Humidité_sol_(%)",
                "EC_(dS/m)", "pH_sol", "Azote_(mg/kg)", "Phosphore_(mg/kg)", "Potassium_(mg/kg)",
                "Fertilité_(score)", "Type_sol"
            ]
            
            # Créer DataFrame avec les features
            features_df = pd.DataFrame([features_data], columns=columns)
            
            # Prédiction
            volume_m3 = self.model.predict(features_df)[0]
            volume_m3 = max(0.0, volume_m3)  # Assurer valeur positive
            
            # Calculs dérivés
            volume_litres = volume_m3 * 1000
            duree_minutes = volume_litres / DEBIT_LITRES_PAR_MIN
            duree_sec = max(30, int(duree_minutes * 60))  # Minimum 30 secondes
            
            return {
                "volume_m3": float(round(volume_m3, 3)),
                "volume_litres": float(round(volume_litres, 2)),
                "duree_minutes": float(round(duree_minutes, 2)),
                "duree_sec": duree_sec
            }
            
        except Exception as e:
            raise Exception(f"Erreur prédiction ML: {str(e)}")

# Instance globale
ml_service = MLService()
