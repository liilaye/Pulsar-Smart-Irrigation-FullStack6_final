
from flask import Blueprint, jsonify
from config.database import get_db_connection

logs_bp = Blueprint('logs', __name__)

@logs_bp.route('/logs/irrigation', methods=['GET'])
def get_irrigation_logs():
    """Récupère les logs d'irrigation"""
    try:
        conn = get_db_connection()
        logs = conn.execute('''
            SELECT * FROM irrigation_logs 
            ORDER BY timestamp DESC 
            LIMIT 50
        ''').fetchall()
        conn.close()
        
        return jsonify([dict(log) for log in logs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@logs_bp.route('/logs/weather', methods=['GET'])
def get_weather_logs():
    """Récupère les logs météo"""
    try:
        conn = get_db_connection()
        logs = conn.execute('''
            SELECT * FROM weather_logs 
            ORDER BY timestamp DESC 
            LIMIT 20
        ''').fetchall()
        conn.close()
        
        return jsonify([dict(log) for log in logs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@logs_bp.route('/logs/mqtt', methods=['GET'])
def get_mqtt_logs():
    """Récupère les logs MQTT"""
    try:
        conn = get_db_connection()
        logs = conn.execute('''
            SELECT * FROM mqtt_logs 
            ORDER BY timestamp DESC 
            LIMIT 30
        ''').fetchall()
        conn.close()
        
        return jsonify([dict(log) for log in logs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
