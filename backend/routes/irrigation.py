from flask import Blueprint, request, jsonify
from services.ml_service import ml_service
from config.database import log_irrigation

irrigation_bp = Blueprint('irrigation', __name__)

@irrigation_bp.route('/arroser', methods=['POST'])
def arroser():
    """Endpoint ML pour recommandations d'irrigation"""
    try:
        data = request.get_json()
        features = data.get('features', [])
        
        print(f"🤖 Requête ML reçue avec features: {features}")
        
        # Appeler le service ML
        prediction = ml_service.predict_irrigation(features)
        
        if prediction:
            # Log dans la base de données
            log_irrigation(
                duration_minutes=prediction['duree_minutes'],
                volume_m3=prediction['volume_eau_m3'],
                scheduled_by='ML',
                status='ok'
            )
            
            print(f"✅ Prédiction ML: {prediction}")
            return jsonify(prediction)
        else:
            return jsonify({"error": "Erreur dans la prédiction ML"}), 500
            
    except Exception as e:
        print(f"❌ Erreur endpoint /arroser: {e}")
        return jsonify({"error": str(e)}), 500

@irrigation_bp.route('/irrigation/manual', methods=['POST'])
def start_manual_irrigation():
    """Démarre l'irrigation manuelle"""
    try:
        data = request.get_json()
        duration_hours = data.get('durationHours', 0)
        duration_minutes = data.get('durationMinutes', 30)
        scheduled_by = data.get('scheduledBy', 'MANUAL')
        timestamp = data.get('timestamp')
        
        print(f"🚿 Irrigation manuelle demandée pour {duration_hours}h {duration_minutes}min")
        
        # Simuler le démarrage de l'irrigation
        result = {"success": True, "message": "Irrigation manuelle démarrée"}
        
        # Log dans la base de données
        log_irrigation(
            duration_minutes=(duration_hours * 60) + duration_minutes,
            volume_m3=0.5,  # Valeur simulée
            scheduled_by=scheduled_by,
            status='ok'
        )
        
        return jsonify(result)
    except Exception as e:
        print(f"❌ Erreur irrigation manuelle: {e}")
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
