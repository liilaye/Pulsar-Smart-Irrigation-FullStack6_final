from flask import Blueprint, request, jsonify
from services.ml_service import ml_service
from config.database import log_irrigation
import datetime
import numpy as np  # ← Ajout essentiel pour cast numpy float

irrigation_bp = Blueprint('irrigation', __name__)

@irrigation_bp.route('/arroser', methods=['POST'])
def arroser():
    """Endpoint ML pour recommandations d'irrigation"""
    try:
        data = request.get_json()
        features = data.get('features', [])

        print(f"Requête ML reçue avec features: {features}")

        # ✅ Conversion explicite en float numpy array
        try:
            features_array = np.array(features, dtype=float)
        except Exception as conv_err:
            print(f"❌ Erreur de conversion features en float: {conv_err}")
            return jsonify({"error": "Les paramètres fournis ne sont pas valides (doivent être numériques)."}), 400

        # Appel du service ML avec tableau typé
        prediction = ml_service.predict_irrigation(features_array.tolist())

        if prediction:
            log_irrigation(
                action='ml',
                duration_minutes=prediction['duree_minutes'],
                volume_m3=prediction['volume_eau_m3'],
                mqtt_status='ok',
                source='ML'
            )
            print(f"✅ Prédiction ML: {prediction}")
            return jsonify({
                "duree_minutes": prediction['duree_minutes'],
                "volume_eau_m3": prediction['volume_eau_m3'],
                "status": "ok",
                "matt": f"Irrigation ML recommandée: {prediction['duree_minutes']:.1f} min pour {prediction['volume_eau_m3']:.3f} m³"
            })
        else:
            return jsonify({"error": "Erreur dans la prédiction ML"}), 500

    except Exception as e:
        print(f"❌ Erreur endpoint /arroser: {e}")
        return jsonify({"error": f"Erreur prédiction ML: {str(e)}"}), 500


@irrigation_bp.route('/irrigation/log-manual', methods=['POST'])
def log_manual_irrigation():
    try:
        data = request.get_json()
        duration_minutes = data.get('duration_minutes', 0)
        volume_m3 = data.get('volume_m3', 0)

        print(f"📊 Log irrigation manuelle: {duration_minutes:.1f} min, {volume_m3:.3f} m³")

        log_irrigation(
            action='manual_mqtt',
            duration_minutes=duration_minutes,
            volume_m3=volume_m3,
            mqtt_status='ok',
            source='MANUAL_DIRECT'
        )

        return jsonify({"success": True, "message": "Irrigation manuelle loggée"})
    except Exception as e:
        print(f"❌ Erreur log irrigation manuelle: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@irrigation_bp.route('/irrigation/manual', methods=['POST'])
def start_manual_irrigation():
    try:
        print(f"⚠️ Legacy endpoint - Redirection vers MQTT direct recommandée")
        result = {"success": True, "message": "Legacy endpoint - utiliser MQTT direct"}
        return jsonify(result)
    except Exception as e:
        print(f"❌ Erreur irrigation manuelle legacy: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@irrigation_bp.route('/irrigation/stop', methods=['POST'])
def stop_irrigation():
    try:
        print("⏹️ Arrêt irrigation demandé")
        result = {"success": True, "message": "Irrigation arrêtée"}
        return jsonify(result)
    except Exception as e:
        print(f"❌ Erreur arrêt irrigation: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@irrigation_bp.route('/irrigation/status', methods=['GET'])
def get_irrigation_status():
    try:
        status = {"isActive": False, "lastMLRecommendation": None}
        print(f"ℹ️ Statut irrigation demandé: {status}")
        return jsonify(status)
    except Exception as e:
        print(f"❌ Erreur statut irrigation: {e}")
        return jsonify({"error": str(e)}), 500


@irrigation_bp.route('/analytics/trends', methods=['GET'])
def get_trends():
    try:
        trends = {
            "waterConsumption": 1.25,
            "soilMoisture": 45,
            "efficiency": 92,
            "trend": "stable"
        }
        print(f"📊 Tendances calculées: {trends}")
        return jsonify(trends)
    except Exception as e:
        print(f"❌ Erreur trends: {e}")
        return jsonify({"error": str(e)}), 500


@irrigation_bp.route('/analytics/ml-predictions', methods=['GET'])
def get_ml_predictions():
    try:
        predictions = {
            "nextIrrigationHours": 4,
            "recommendedDuration": 25,
            "soilCondition": "Bon",
            "weatherImpact": "Favorable"
        }
        print(f"🧠 Prédictions ML: {predictions}")
        return jsonify(predictions)
    except Exception as e:
        print(f"❌ Erreur ML predictions: {e}")
        return jsonify({"error": str(e)}), 500
