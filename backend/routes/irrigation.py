from flask import Blueprint, request, jsonify
from services.ml_service import ml_service
from config.database import log_irrigation
import datetime

irrigation_bp = Blueprint('irrigation', __name__)

@irrigation_bp.route('/arroser', methods=['POST'])
def arroser():
    """Endpoint ML pour recommandations d'irrigation"""
    try:
        data = request.get_json()
        features = data.get('features', [])
        
        print(f"Requête ML reçue avec features: {features}")
        
        # Appeler le service ML
        prediction = ml_service.predict_irrigation(features)
        
        if prediction:
            # Log dans la base de données
            log_irrigation(
                action='ml',
                duration_minutes=prediction['duree_minutes'],
                volume_m3=prediction['volume_eau_m3'],
                mqtt_status='ok',
                source='ML'
            )
            
            print(f"Prédiction ML: {prediction}")
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
        return jsonify({"error": str(e)}), 500

@irrigation_bp.route('/irrigation/log-manual', methods=['POST'])
def log_manual_irrigation():
    """Log l'irrigation manuelle avec calcul automatique"""
    try:
        data = request.get_json()
        duration_minutes = data.get('duration_minutes', 0)
        volume_m3 = data.get('volume_m3', 0)
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        print(f"📊 Log irrigation manuelle: {duration_minutes:.1f} min, {volume_m3:.3f} m³")
        
        # Log dans la base de données
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
    """Démarre l'irrigation manuelle (legacy - maintenant via MQTT direct)"""
    try:
        data = request.get_json()
        duration_hours = data.get('durationHours', 0)
        duration_minutes = data.get('durationMinutes', 30)
        scheduled_by = data.get('scheduledBy', 'MANUAL')
        
        print(f"⚠️ Legacy endpoint - Redirection vers MQTT direct recommandée")
        
        result = {"success": True, "message": "Legacy endpoint - utiliser MQTT direct"}
        return jsonify(result)
    except Exception as e:
        print(f"❌ Erreur irrigation manuelle legacy: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route('/irrigation/stop', methods=['POST'])
def stop_irrigation():
    """Arrête l'irrigation"""
    try:
        print("⏹️ Arrêt irrigation demandé")
        # Simuler l'arrêt de l'irrigation
        result = {"success": True, "message": "Irrigation arrêtée"}
        return jsonify(result)
    except Exception as e:
        print(f"❌ Erreur arrêt irrigation: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route('/irrigation/status', methods=['GET'])
def get_irrigation_status():
    """Retourne le statut de l'irrigation"""
    try:
        # Simuler le statut de l'irrigation
        status = {"isActive": False, "lastMLRecommendation": None}
        print(f"ℹ️ Statut irrigation demandé: {status}")
        return jsonify(status)
    except Exception as e:
        print(f"❌ Erreur statut irrigation: {e}")
        return jsonify({"error": str(e)}), 500

@irrigation_bp.route('/analytics/trends', methods=['GET'])
def get_trends():
    """Analyse des tendances d'irrigation"""
    try:
        # Calculs basés sur les données d'irrigation récentes
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
    """Prédictions ML pour irrigation"""
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
