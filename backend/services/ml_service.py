
import joblib
import pandas as pd
import numpy as np
import os
from config.mqtt_config import MODEL_PATH, DEBIT_LITRES_PAR_MIN

class MLService:
    def __init__(self):
        self.model = None
        self.model_path = os.path.join("models", "xgboost_arrosage_litres.pkl")
        self.load_model()

    def load_model(self):
        """Charge le modèle XGBoost pré-entraîné"""
        if not os.path.exists(self.model_path):
            print(f"⚠️ Modèle non trouvé à l'emplacement : {self.model_path}")
            print("🔄 Utilisation du mode fallback avec calculs par défaut")
            self.model = None
            return
        
        try:
            self.model = joblib.load(self.model_path)
            print("✅ Modèle XGBoost chargé avec succès.")
        except Exception as e:
            print(f"❌ Erreur lors du chargement du modèle : {e}")
            print("🔄 Utilisation du mode fallback")
            self.model = None

    def predict_irrigation(self, features_data):
        """Prédit la quantité d'eau nécessaire basée sur les features agro-climatiques"""
        try:
            # Vérifier le format des données d'entrée
            if not isinstance(features_data, list) or len(features_data) != 15:
                raise ValueError(f"Exactement 15 features requises, reçu: {len(features_data) if isinstance(features_data, list) else 'non-liste'}")
            
            # ✅ CORRECTION: Conversion stricte en float64 pour éviter l'erreur NumPy isnan
            try:
                features_array = np.array([float(f) for f in features_data], dtype=np.float64)
                print(f"🔧 Features converties en float64: {features_array}")
            except (ValueError, TypeError) as e:
                raise ValueError(f"Toutes les features doivent être numériques: {e}")
            
            # Si le modèle est disponible, l'utiliser
            if self.model:
                try:
                    # Colonnes attendues par le modèle
                    columns = [
                        "Température_air_(°C)", "Précipitation_(mm)", "Humidité_air_(%)", "Vent_moyen_(km/h)",
                        "Type_culture", "Périmètre_agricole_(m2)", "Température_sol_(°C)", "Humidité_sol_(%)",
                        "EC_(dS/m)", "pH_sol", "Azote_(mg/kg)", "Phosphore_(mg/kg)", "Potassium_(mg/kg)",
                        "Fertilité_(score)", "Type_sol"
                    ]
                    
                    # ✅ CORRECTION: Créer DataFrame avec dtype explicit float64
                    features_df = pd.DataFrame([features_array], columns=columns, dtype=np.float64)
                    
                    # Vérifier qu'il n'y a pas de NaN
                    if features_df.isnull().any().any():
                        print("⚠️ NaN détectés dans les features, utilisation du fallback")
                        volume_m3 = self._calculate_fallback_volume(features_array)
                    else:
                        # Prédiction avec gestion d'erreur NumPy
                        try:
                            volume_m3_raw = self.model.predict(features_df)[0]
                            volume_m3 = max(0.001, float(volume_m3_raw))  # Minimum 1L
                            print(f"✅ Prédiction ML avec modèle: {volume_m3:.3f} m³")
                        except Exception as numpy_error:
                            print(f"⚠️ Erreur NumPy/XGBoost: {numpy_error}")
                            volume_m3 = self._calculate_fallback_volume(features_array)
                    
                except Exception as model_error:
                    print(f"⚠️ Erreur avec le modèle, utilisation du fallback: {model_error}")
                    volume_m3 = self._calculate_fallback_volume(features_array)
            else:
                # Calcul par défaut si pas de modèle
                volume_m3 = self._calculate_fallback_volume(features_array)
                print(f"✅ Prédiction fallback: {volume_m3:.3f} m³")
            
            # Calculs dérivés
            volume_litres = volume_m3 * 1000
            duree_minutes = volume_litres / DEBIT_LITRES_PAR_MIN
            duree_sec = max(30, int(duree_minutes * 60))  # Minimum 30 secondes
            
            result = {
                "volume_m3": float(round(volume_m3, 3)),
                "volume_litres": float(round(volume_litres, 2)),
                "duree_minutes": float(round(duree_minutes, 2)),
                "duree_sec": duree_sec
            }
            
            print(f"📊 Résultat ML final: {result}")
            return result
            
        except Exception as e:
            print(f"❌ Erreur prédiction ML: {str(e)}")
            raise Exception(f"Erreur prédiction ML: {str(e)}")

    def _calculate_fallback_volume(self, features):
        """Calcul par défaut basé sur les paramètres agro-climatiques"""
        try:
            temp_air = float(features[0])  # Température_air_(°C)
            humidite_air = float(features[2])  # Humidité_air_(%)
            perimetre = float(features[5])  # Périmètre_agricole_(m2)
            humidite_sol = float(features[7])  # Humidité_sol_(%)
            
            # Calcul simple basé sur les conditions
            base_volume = 0.3  # Volume de base en m³
            
            # Ajustements selon conditions
            if temp_air > 30:
                base_volume += 0.2  # Plus chaud = plus d'eau
            if humidite_air < 60:
                base_volume += 0.15  # Air sec = plus d'eau
            if humidite_sol < 40:
                base_volume += 0.25  # Sol sec = plus d'eau
            if perimetre > 5000:
                base_volume += 0.1  # Grande surface = plus d'eau
                
            return max(0.2, min(2.0, base_volume))  # Entre 200L et 2000L
            
        except Exception as e:
            print(f"⚠️ Erreur calcul fallback: {e}")
            return 0.6  # Valeur par défaut: 600L

# Instance globale
ml_service = MLService()
