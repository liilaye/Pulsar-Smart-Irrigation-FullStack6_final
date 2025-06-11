
from flask import Blueprint, request, jsonify
from services.mqtt_service import mqtt_service
from services.ml_service import ml_service
from config.database import log_irrigation
import threading
import time

irrigation_bp = Blueprint("irrigation", __name__)

# État global de l'irrigation avec nettoyage automatique
irrigation_state = {
    "isActive": False,
    "type": None,  # 'manual' ou 'ml'
    "startTime": None,
    "duration": None,
    "source": None,
    "threadId": None
}

def cleanup_stale_irrigation():
    """Nettoie automatiquement les irrigations bloquées"""
    global irrigation_state
    if irrigation_state["isActive"] and irrigation_state["startTime"]:
        elapsed = time.time() - irrigation_state["startTime"]
        max_duration = (irrigation_state["duration"] or 30) * 60 + 300  # +5min buffer
        if elapsed > max_duration:
            print(f"🧹 Nettoyage automatique irrigation bloquée ({elapsed/60:.1f}min)")
            mqtt_service.arreter_arrosage()
            irrigation_state.update({
                "isActive": False,
                "type": None,
                "startTime": None,
                "duration": None,
                "source": None,
                "threadId": None
            })
            return True
    return False

@irrigation_bp.route("/irrigation/status", methods=["GET"])
def get_irrigation_status():
    """Retourne l'état actuel de l'irrigation avec nettoyage automatique"""
    try:
        cleanup_stale_irrigation()
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
        return jsonify({"status": "error", "message": str(e)}), 500

@irrigation_bp.route("/irrigation/reset", methods=["POST"])
def reset_irrigation_state():
    """Force le reset de l'état de l'irrigation"""
    try:
        global irrigation_state
        print("🔄 Reset forcé de l'état irrigation")
        
        # Arrêter toute irrigation en cours
        mqtt_service.arreter_arrosage()
        
        # Reset complet de l'état
        irrigation_state = {
            "isActive": False,
            "type": None,
            "startTime": None,
            "duration": None,
            "source": None,
            "threadId": None
        }
        
        print("✅ État irrigation réinitialisé")
        return jsonify({
            "success": True,
            "message": "État irrigation réinitialisé",
            "state": irrigation_state
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur reset irrigation: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route("/irrigation/manual", methods=["POST"])
def start_manual_irrigation():
    """Démarre une irrigation manuelle avec nettoyage automatique"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"success": False, "message": "Données JSON requises"}), 400
            
        duration_hours = int(data.get("durationHours", 0))
        duration_minutes = int(data.get("durationMinutes", 0))
        
        total_minutes = (duration_hours * 60) + duration_minutes
        if total_minutes <= 0:
            return jsonify({"success": False, "message": "Durée invalide"}), 400
        
        # Nettoyage automatique avant de vérifier l'état
        cleanup_stale_irrigation()
        
        # Vérifier si une irrigation est déjà active
        if irrigation_state["isActive"]:
            print(f"⚠️ Tentative démarrage irrigation mais irrigation active: {irrigation_state}")
            return jsonify({
                "success": False, 
                "message": "Arrosage en cours. Utilisez /irrigation/reset pour forcer l'arrêt."
            }), 400
        
        print(f"🚿 Démarrage irrigation manuelle: {total_minutes} minutes")
        
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
                "source": "manual",
                "threadId": threading.current_thread().ident
            })
            
            print(f"✅ Irrigation manuelle démarrée: {total_minutes} min")
            return jsonify({
                "success": True,
                "message": f"Irrigation manuelle démarrée pour {total_minutes} minutes",
                "mqtt_started": True,
                "duration_minutes": total_minutes
            }), 200
        else:
            print(f"❌ Échec démarrage irrigation: {message}")
            return jsonify({"success": False, "message": message}), 500
            
    except Exception as e:
        print(f"❌ Erreur irrigation manuelle: {e}")
        return jsonify({"success": False, "message": f"Erreur serveur: {str(e)}"}), 500

@irrigation_bp.route("/irrigation/stop", methods=["POST"])
def stop_irrigation():
    """Arrête l'irrigation en cours"""
    try:
        print("⏹️ Arrêt irrigation demandé")
        status, response = mqtt_service.arreter_arrosage()
        
        irrigation_state.update({
            "isActive": False,
            "type": None,
            "startTime": None,
            "duration": None,
            "source": None,
            "threadId": None
        })
        
        print("✅ Irrigation arrêtée")
        return jsonify({
            "success": True,
            "message": "Irrigation arrêtée",
            "mqtt_stopped": True
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur arrêt irrigation: {e}")
        return jsonify({"success": False, "message": f"Erreur arrêt: {str(e)}"}), 500

@irrigation_bp.route("/arroser", methods=["POST"])
def arroser_ml():
    """Endpoint ML pour l'arrosage intelligent avec nettoyage automatique"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "Données JSON requises"
            }), 400
            
        features = data.get("features", [])
        
        if not features or len(features) != 15:
            return jsonify({
                "status": "error",
                "message": "15 features requises pour le modèle ML"
            }), 400
        
        # Nettoyage automatique avant de vérifier l'état
        cleanup_stale_irrigation()
        
        # Vérifier si une irrigation est déjà active
        if irrigation_state["isActive"]:
            print(f"⚠️ Tentative démarrage ML mais irrigation active: {irrigation_state}")
            return jsonify({
                "status": "error",
                "message": "Arrosage en cours. Utilisez /irrigation/reset pour forcer l'arrêt."
            }), 400
        
        print("🤖 Début prédiction ML...")
        
        # Prédiction ML
        try:
            prediction = ml_service.predict_irrigation(features)
        except Exception as ml_error:
            print(f"❌ Erreur ML: {ml_error}")
            return jsonify({
                "status": "error",
                "message": f"Erreur modèle ML: {str(ml_error)}"
            }), 500
        
        if not prediction:
            return jsonify({
                "status": "error",
                "message": "Erreur lors de la prédiction ML"
            }), 500
        
        # Démarrer l'irrigation automatiquement
        duration_minutes = prediction["duree_minutes"]
        print(f"🚿 Démarrage irrigation ML: {duration_minutes} minutes")
        
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
                "source": "ml",
                "threadId": threading.current_thread().ident
            })
            print(f"✅ Irrigation ML démarrée: {duration_minutes} min")
        else:
            print(f"❌ Échec irrigation ML: {message}")
        
        return jsonify({
            "status": "ok",
            "duree_minutes": prediction["duree_minutes"],
            "volume_eau_m3": prediction["volume_m3"],
            "matt": f"Irrigation ML: {prediction['duree_minutes']:.1f} min - {prediction['volume_litres']:.0f}L",
            "mqtt_started": success,
            "mqtt_message": message,
            "auto_irrigation": success
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur ML arrosage: {e}")
        return jsonify({
            "status": "error",
            "message": f"Erreur serveur ML: {str(e)}"
        }), 500

# Endpoints Analytics manquants
@irrigation_bp.route("/analytics/trends", methods=["GET"])
def get_trends():
    """Retourne l'analyse des tendances"""
    try:
        return jsonify({
            "waterConsumption": 0.85,
            "soilMoisture": 42,
            "efficiency": 88,
            "trend": "stable"
        }), 200
    except Exception as e:
        print(f"❌ Erreur trends: {e}")
        return jsonify({"error": str(e)}), 500

@irrigation_bp.route("/analytics/ml-predictions", methods=["GET"])
def get_ml_predictions():
    """Retourne les prédictions ML"""
    try:
        return jsonify({
            "nextIrrigationHours": 6,
            "recommendedDuration": 30,
            "soilCondition": "Optimal",
            "weatherImpact": "Favorable"
        }), 200
    except Exception as e:
        print(f"❌ Erreur ML predictions: {e}")
        return jsonify({"error": str(e)}), 500

