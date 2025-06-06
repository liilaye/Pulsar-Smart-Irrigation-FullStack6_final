
from flask import Blueprint, request, jsonify
from services.ml_service import ml_service
from services.mqtt_service import mqtt_service
from config.database import log_irrigation

irrigation_bp = Blueprint('irrigation', __name__)

@irrigation_bp.route('/arroser', methods=['POST'])
def arroser():
    """Endpoint principal pour l'arrosage avec ML"""
    try:
        data = request.get_json()
        print("🛰️ Données ML reçues:", data)
        
        if not data or 'features' not in data:
            return jsonify({"status": "error", "message": "Features manquantes"}), 400
        
        # Prédiction ML
        prediction = ml_service.predict_irrigation(data['features'])
        
        print(f"🤖 Prédiction ML: {prediction['volume_m3']} m³, {prediction['duree_minutes']} min")
        
        # Démarrer l'arrosage asynchrone
        success, message = mqtt_service.demarrer_arrosage_async(
            duree_sec=prediction['duree_sec'],
            volume_m3=prediction['volume_m3'],
            source="ML"
        )
        
        if not success:
            return jsonify({"status": "error", "message": message}), 409
        
        return jsonify({
            "status": "ok",
            "volume_eau_m3": prediction['volume_m3'],
            "duree_minutes": prediction['duree_minutes'],
            "matt": f"Arrosage ML: {prediction['volume_litres']} L pendant {prediction['duree_minutes']} min",
            "mqtt": "Commande envoyée, arrosage en cours"
        })
        
    except Exception as e:
        print(f"❌ Erreur /arroser: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@irrigation_bp.route('/irrigation/manual', methods=['POST'])
def irrigation_manual():
    """Démarrage manuel de l'irrigation"""
    try:
        data = request.get_json()
        duration_hours = data.get('durationHours', 0)
        duration_minutes = data.get('durationMinutes', 30)
        
        total_minutes = (duration_hours * 60) + duration_minutes
        duree_sec = max(30, int(total_minutes * 60))  # Minimum 30 secondes
        
        success, message = mqtt_service.demarrer_arrosage_async(
            duree_sec=duree_sec,
            source="MANUAL"
        )
        
        if not success:
            return jsonify({"success": False, "message": message}), 409
        
        return jsonify({
            "success": True,
            "message": f"Arrosage manuel démarré pour {total_minutes} minutes"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route('/irrigation/stop', methods=['POST'])
def irrigation_stop():
    """Arrêt immédiat de l'irrigation"""
    try:
        status, response = mqtt_service.arreter_arrosage()
        return jsonify({
            "success": status < 400,
            "message": "Irrigation arrêtée",
            "mqtt_status": status
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route('/irrigation/status', methods=['GET'])
def irrigation_status():
    """Statut de l'irrigation"""
    try:
        is_active = (mqtt_service.current_irrigation_thread and 
                    mqtt_service.current_irrigation_thread.is_alive())
        
        return jsonify({
            "isActive": is_active,
            "message": "Irrigation active" if is_active else "Irrigation inactive"
        })
    except Exception as e:
        return jsonify({"isActive": False, "message": str(e)}), 500
