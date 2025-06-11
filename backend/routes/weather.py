
from flask import Blueprint, jsonify
from services.weather_service import weather_service

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/weather/<location>', methods=['GET'])
def get_weather(location):
    """Récupère les données météo pour une ville"""
    try:
        print(f"Requête météo pour: {location}")
        weather_data = weather_service.get_weather_data(location)
        print(f"Données météo retournées pour {location}:", weather_data)
        return jsonify(weather_data)
    except Exception as e:
        print(f"Erreur météo pour {location}: {e}")
        return jsonify({"error": str(e)}), 500

@weather_bp.route('/weather/<location>/realtime', methods=['GET'])
def get_realtime_weather(location):
    """Récupère les données météo en temps réel pour une ville"""
    try:
        print(f"⚡ Requête météo temps réel pour: {location}")
        weather_data = weather_service.get_weather_data(location)
        
        # Ajouter des indicateurs temps réel
        weather_data['realTime'] = True
        weather_data['lastUpdate'] = weather_service.get_last_update_time()
        
        print(f"Données météo temps réel retournées pour {location}:", weather_data)
        return jsonify(weather_data)
    except Exception as e:
        print(f"Erreur météo temps réel pour {location}: {e}")
        return jsonify({"error": str(e)}), 500
