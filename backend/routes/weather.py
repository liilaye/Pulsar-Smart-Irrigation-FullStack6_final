
from flask import Blueprint, jsonify
from services.weather_service import weather_service

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/weather/<location>', methods=['GET'])
def get_weather(location):
    """Récupère les données météo pour une ville"""
    try:
        weather_data = weather_service.get_weather_data(location)
        return jsonify(weather_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
