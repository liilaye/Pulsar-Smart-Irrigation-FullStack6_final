from flask import Blueprint, request, jsonify
from services.mqtt_service import mqtt_service

mqtt_bp = Blueprint("mqtt", __name__)

@mqtt_bp.route("/mqtt/test-publish", methods=["POST"])
def test_publish():
    """
    Publie manuellement un message MQTT vers le broker
    Corps JSON: { "device": 1 }
    """
    try:
        data = request.get_json()
        device_id = int(data.get("device", 1))
        result_code, message = mqtt_service.envoyer_commande_mqtt(device_id)
        return jsonify({
            "success": result_code == 0,
            "code": result_code,
            "message": message
        }), 200 if result_code == 0 else 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
