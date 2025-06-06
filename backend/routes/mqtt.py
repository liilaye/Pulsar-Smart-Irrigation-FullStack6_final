
from flask import Blueprint, request, jsonify
from services.mqtt_service import mqtt_service

mqtt_bp = Blueprint('mqtt', __name__)

@mqtt_bp.route('/mqtt/command', methods=['POST'])
def mqtt_command():
    """Envoie une commande MQTT directe"""
    try:
        data = request.get_json()
        device_state = data.get('device', 0)  # 0 = OFF, 1 = ON
        
        status, response = mqtt_service.envoyer_commande_mqtt(device_state)
        
        return jsonify({
            "success": status < 400,
            "status_code": status,
            "response": response,
            "command": "ON" if device_state == 1 else "OFF"
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
