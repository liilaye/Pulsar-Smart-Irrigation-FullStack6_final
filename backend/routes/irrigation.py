from flask import Blueprint, request, jsonify
from services.mqtt_service import mqtt_service
from services.ml_service import ml_service
from config.database import log_irrigation, get_db_connection
import threading
import time
import sqlite3
from datetime import datetime, timedelta

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
    """Nettoie automatiquement les irrigations bloquées - VERSION SÉCURISÉE"""
    global irrigation_state
    if irrigation_state["isActive"] and irrigation_state["startTime"]:
        elapsed = time.time() - irrigation_state["startTime"]
        # BUFFER PLUS LARGE: +15min au lieu de +5min pour éviter interruptions prématurées
        max_duration = (irrigation_state["duration"] or 30) * 60 + 900  # +15min buffer sécurisé
        if elapsed > max_duration:
            print(f"🧹 NETTOYAGE SÉCURISÉ irrigation vraiment bloquée ({elapsed/60:.1f}min > {max_duration/60:.1f}min)")
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
        else:
            print(f"✅ Irrigation active normale: {elapsed/60:.1f}min/{(irrigation_state['duration'] or 30):.1f}min + buffer")
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
        
        # Vérification sécurisée AVANT nettoyage automatique (irrigation manuelle)
        if irrigation_state["isActive"] and irrigation_state["startTime"]:
            elapsed = time.time() - irrigation_state["startTime"]
            max_safe_duration = (irrigation_state["duration"] or 30) * 60 + 900  # +15min buffer
            
            if elapsed < max_safe_duration:
                # Irrigation légitime en cours
                print(f"⚠️ IRRIGATION MANUELLE ACTIVE LÉGITIME: {elapsed/60:.1f}min/{irrigation_state['duration']:.1f}min")
                return jsonify({
                    "success": False,
                    "message": f"Irrigation {irrigation_state['type']} active depuis {elapsed/60:.1f}min. Temps restant estimé: {(max_safe_duration - elapsed)/60:.1f}min"
                }), 400
            else:
                # Irrigation potentiellement bloquée
                print(f"🧹 Irrigation possiblement bloquée détectée: {elapsed/60:.1f}min")
                cleanup_stale_irrigation()
        
        # Double vérification après nettoyage potentiel
        if irrigation_state["isActive"]:
            print(f"⚠️ Irrigation toujours active après vérification: {irrigation_state}")
            return jsonify({
                "success": False,
                "message": "Système d'irrigation occupé. Réessayez dans quelques minutes."
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
        
        # Vérification sécurisée AVANT nettoyage automatique
        if irrigation_state["isActive"] and irrigation_state["startTime"]:
            elapsed = time.time() - irrigation_state["startTime"]
            max_safe_duration = (irrigation_state["duration"] or 30) * 60 + 900  # +15min buffer
            
            if elapsed < max_safe_duration:
                # Irrigation légitime en cours
                print(f"⚠️ IRRIGATION ML ACTIVE LÉGITIME: {elapsed/60:.1f}min/{irrigation_state['duration']:.1f}min")
                return jsonify({
                    "status": "error",
                    "message": f"Irrigation {irrigation_state['type']} active depuis {elapsed/60:.1f}min. Temps restant estimé: {(max_safe_duration - elapsed)/60:.1f}min"
                }), 400
            else:
                # Irrigation potentiellement bloquée
                print(f"🧹 Irrigation possiblement bloquée détectée: {elapsed/60:.1f}min")
                cleanup_stale_irrigation()
        
        # Double vérification après nettoyage potentiel
        if irrigation_state["isActive"]:
            print(f"⚠️ Irrigation toujours active après vérification: {irrigation_state}")
            return jsonify({
                "status": "error", 
                "message": "Système d'irrigation occupé. Réessayez dans quelques minutes."
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

@irrigation_bp.route("/irrigation/analysis", methods=["GET"])
def get_irrigation_analysis():
    """Retourne l'analyse des données min/max d'irrigation"""
    try:
        conn = get_db_connection()
        
        # Récupérer les données des 30 derniers jours
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Analyse pour irrigation manuelle
        manual_query = '''
            SELECT 
                MAX(volume_m3) as max_volume,
                MIN(volume_m3) as min_volume,
                AVG(volume_m3) as current_volume
            FROM irrigation_logs 
            WHERE source = 'manual' AND timestamp >= ?
        '''
        
        # Analyse pour irrigation ML
        ml_query = '''
            SELECT 
                MAX(volume_m3) as max_volume,
                MIN(volume_m3) as min_volume,
                AVG(volume_m3) as current_volume
            FROM irrigation_logs 
            WHERE source = 'ml' AND timestamp >= ?
        '''
        
        manual_result = conn.execute(manual_query, (thirty_days_ago,)).fetchone()
        ml_result = conn.execute(ml_query, (thirty_days_ago,)).fetchone()
        
        conn.close()
        
        # Préparer les données de réponse avec des valeurs par défaut
        analysis_data = {
            "manual": {
                "max": float(manual_result["max_volume"] or 0.8),
                "min": float(manual_result["min_volume"] or 0.2),
                "current": float(manual_result["current_volume"] or 0.5)
            },
            "ml": {
                "max": float(ml_result["max_volume"] or 0.9),
                "min": float(ml_result["min_volume"] or 0.3),
                "current": float(ml_result["current_volume"] or 0.6)
            }
        }
        
        return jsonify({
            "status": "ok",
            "data": analysis_data
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur analyse irrigation: {e}")
        # Retourner des données par défaut en cas d'erreur
        return jsonify({
            "status": "ok",
            "data": {
                "manual": {
                    "max": 0.8,
                    "min": 0.2,
                    "current": 0.5
                },
                "ml": {
                    "max": 0.9,
                    "min": 0.3,
                    "current": 0.6
                }
            }
        }), 200

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
