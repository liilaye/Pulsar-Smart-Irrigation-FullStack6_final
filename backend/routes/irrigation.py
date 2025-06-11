
from flask import Blueprint, request, jsonify
from services.mqtt_service import mqtt_service
from services.ml_service import ml_service
from config.database import log_irrigation
import threading
import time

irrigation_bp = Blueprint("irrigation", __name__)

# État global de l'irrigation
irrigation_state = {
    "isActive": False,
    "type": None,  # 'manual' ou 'ml'
    "startTime": None,
    "duration": None,
    "source": None
}

@irrigation_bp.route("/irrigation/status", methods=["GET"])
def get_irrigation_status():
    """Retourne l'état actuel de l'irrigation"""
    try:
        return jsonify({
            "status": "ok",
            "isActive": irrigation_state["isActive"],
            "type": irrigation_state["type"],
            "startTime": irrigation_state["startTime"],
            "duration": irrigation_state["duration"],
            "source": irrigation_state["source"]
        }), 200
    except Exception as e:
        print(f"❌ Erreur status irrigation: {e}")
        return jsonify({"error": str(e)}), 500

@irrigation_bp.route("/irrigation/manual", methods=["POST"])
def start_manual_irrigation():
    """Démarre une irrigation manuelle"""
    try:
        data = request.get_json()
        duration_hours = int(data.get("durationHours", 0))
        duration_minutes = int(data.get("durationMinutes", 0))
        
        total_minutes = (duration_hours * 60) + duration_minutes
        if total_minutes <= 0:
            return jsonify({"success": False, "message": "Durée invalide"}), 400
        
        # Démarrer l'irrigation via MQTT
        success, message = mqtt_service.demarrer_arrosage_async(
            total_minutes * 60,  # Convertir en secondes
            volume_m3=(total_minutes * 20) / 1000,  # Estimation 20L/min
            source="manual"
        )
        
        if success:
            irrigation_state.update({
                "isActive": True,
                "type": "manual",
                "startTime": time.time(),
                "duration": total_minutes,
                "source": "manual"
            })
            
            return jsonify({
                "success": True,
                "message": f"Irrigation manuelle démarrée pour {total_minutes} minutes",
                "mqtt_started": True
            }), 200
        else:
            return jsonify({"success": False, "message": message}), 500
            
    except Exception as e:
        print(f"❌ Erreur irrigation manuelle: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route("/irrigation/stop", methods=["POST"])
def stop_irrigation():
    """Arrête l'irrigation en cours"""
    try:
        status, response = mqtt_service.arreter_arrosage()
        
        irrigation_state.update({
            "isActive": False,
            "type": None,
            "startTime": None,
            "duration": None,
            "source": None
        })
        
        return jsonify({
            "success": status < 400,
            "message": "Irrigation arrêtée",
            "mqtt_stopped": True
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur arrêt irrigation: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route("/arroser", methods=["POST"])
def arroser_ml():
    """Endpoint ML pour l'arrosage intelligent"""
    try:
        data = request.get_json()
        features = data.get("features", [])
        
        if not features or len(features) != 15:
            return jsonify({
                "status": "error",
                "message": "15 features requises pour le modèle ML"
            }), 400
        
        # Prédiction ML
        prediction = ml_service.predict_irrigation(features)
        
        if not prediction:
            return jsonify({
                "status": "error",
                "message": "Erreur lors de la prédiction ML"
            }), 500
        
        # Démarrer l'irrigation automatiquement
        duration_minutes = prediction["duree_minutes"]
        success, message = mqtt_service.demarrer_arrosage_async(
            duration_minutes * 60,  # Convertir en secondes
            volume_m3=prediction["volume_m3"],
            source="ml"
        )
        
        if success:
            irrigation_state.update({
                "isActive": True,
                "type": "ml",
                "startTime": time.time(),
                "duration": duration_minutes,
                "source": "ml"
            })
        
        return jsonify({
            "status": "ok",
            "duree_minutes": prediction["duree_minutes"],
            "volume_eau_m3": prediction["volume_m3"],
            "matt": prediction.get("matt", "Recommandation ML générée"),
            "mqtt_started": success,
            "mqtt_message": message,
            "auto_irrigation": success
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur ML arrosage: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@irrigation_bp.route("/irrigation/schedule", methods=["POST"])
def set_irrigation_schedule():
    """Configure un planning d'irrigation"""
    try:
        data = request.get_json()
        schedules = data.get("schedules", {})
        
        # Simuler l'optimisation IA du planning
        analyzed_schedules = {}
        for day, schedule in schedules.items():
            if schedule.get("enabled", False):
                # Calcul basique pour la démo
                start_hour = int(schedule["startTime"].split(":")[0])
                end_hour = int(schedule["endTime"].split(":")[0])
                duration_hours = end_hour - start_hour
                
                analyzed_schedules[day] = {
                    "ai_duration_minutes": duration_hours * 45,  # 45 min par heure
                    "ai_volume_m3": (duration_hours * 45 * 20) / 1000,  # 20L/min
                    "optimized": True
                }
        
        return jsonify({
            "success": True,
            "message": "Planning optimisé par IA",
            "analyzed_schedules": analyzed_schedules
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur planning: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route("/analytics/trends", methods=["GET"])
def get_trends():
    """Retourne les tendances d'irrigation"""
    try:
        # Données simulées pour la démo
        return jsonify({
            "waterConsumption": 1.25,
            "soilMoisture": 45,
            "efficiency": 92,
            "trend": "stable"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@irrigation_bp.route("/analytics/ml-predictions", methods=["GET"])
def get_ml_predictions():
    """Retourne les prédictions ML"""
    try:
        # Données simulées pour la démo
        return jsonify({
            "nextIrrigationHours": 8,
            "recommendedDuration": 35,
            "soilCondition": "Optimal",
            "weatherImpact": "Favorable"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
