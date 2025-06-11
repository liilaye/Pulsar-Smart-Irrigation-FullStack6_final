
from flask import Blueprint, request, jsonify
from services.mqtt_service import mqtt_service
from services.ml_service import ml_service
from config.database import log_irrigation
import time

irrigation_bp = Blueprint('irrigation', __name__)

# État global simple pour éviter les conflits
current_irrigation_state = {
    'isActive': False,
    'type': None,
    'startTime': None,
    'thread': None
}

@irrigation_bp.route('/irrigation/status', methods=['GET'])
def get_irrigation_status():
    """Récupère le statut actuel de l'irrigation"""
    try:
        global current_irrigation_state
        
        # Vérifier si le thread est encore actif
        if current_irrigation_state['thread'] and not current_irrigation_state['thread'].is_alive():
            current_irrigation_state['isActive'] = False
            current_irrigation_state['type'] = None
            current_irrigation_state['thread'] = None
        
        status = {
            'isActive': current_irrigation_state['isActive'],
            'type': current_irrigation_state['type'],
            'backend_connected': True,
            'mqtt_connected': True,
            'lastMLRecommendation': None,
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        }
        
        print(f"ℹ️ Statut irrigation demandé: {status}")
        return jsonify(status), 200
    except Exception as e:
        print(f"❌ Erreur statut irrigation: {e}")
        return jsonify({'error': str(e)}), 500

@irrigation_bp.route('/irrigation/manual', methods=['POST'])
def start_manual_irrigation():
    """Démarre l'irrigation manuelle avec MQTT"""
    try:
        global current_irrigation_state
        
        data = request.get_json()
        duration_hours = float(data.get('durationHours', 0))
        duration_minutes = float(data.get('durationMinutes', 30))
        
        total_minutes = (duration_hours * 60) + duration_minutes
        total_seconds = int(total_minutes * 60)
        
        print(f"🚿 DEMANDE IRRIGATION MANUELLE: {total_minutes} min ({total_seconds}s)")
        
        # Forcer l'arrêt de toute irrigation en cours
        if current_irrigation_state['isActive']:
            print("🛑 Arrêt irrigation précédente...")
            mqtt_service.arreter_arrosage()
            current_irrigation_state['isActive'] = False
            current_irrigation_state['type'] = None
            current_irrigation_state['thread'] = None
            time.sleep(1)  # Pause pour la synchronisation
        
        # Démarrer nouvelle irrigation
        success, message = mqtt_service.demarrer_arrosage_async(
            total_seconds, 
            (total_minutes * 20) / 1000,  # Volume estimé
            "manual"
        )
        
        if success:
            current_irrigation_state['isActive'] = True
            current_irrigation_state['type'] = 'manual'
            current_irrigation_state['startTime'] = time.time()
            current_irrigation_state['thread'] = mqtt_service.current_irrigation_thread
            
            print(f"✅ Irrigation manuelle démarrée: {total_minutes} min")
            return jsonify({
                'success': True,
                'message': f'Irrigation démarrée pour {total_minutes} minutes',
                'duration_minutes': total_minutes,
                'mqtt_started': True
            }), 200
        else:
            print(f"❌ Échec démarrage irrigation manuelle: {message}")
            return jsonify({
                'success': False,
                'message': f'Erreur: {message}',
                'mqtt_started': False
            }), 400
            
    except Exception as e:
        print(f"❌ Erreur irrigation manuelle: {e}")
        return jsonify({
            'success': False,
            'message': f'Erreur serveur: {str(e)}',
            'mqtt_started': False
        }), 500

@irrigation_bp.route('/irrigation/stop', methods=['POST'])
def stop_irrigation():
    """Arrête immédiatement l'irrigation en cours"""
    try:
        global current_irrigation_state
        
        print("🛑 DEMANDE ARRÊT IRRIGATION")
        
        # Envoyer commande MQTT OFF
        status, response = mqtt_service.arreter_arrosage()
        
        # Réinitialiser l'état
        current_irrigation_state['isActive'] = False
        current_irrigation_state['type'] = None
        current_irrigation_state['startTime'] = None
        current_irrigation_state['thread'] = None
        
        print(f"✅ Irrigation arrêtée - MQTT Status: {status}")
        
        return jsonify({
            'success': True,
            'message': 'Irrigation arrêtée',
            'mqtt_status': status,
            'mqtt_response': response
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur arrêt irrigation: {e}")
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500

@irrigation_bp.route('/arroser', methods=['POST'])
def arroser_avec_ml():
    """Irrigation automatique avec ML + MQTT"""
    try:
        global current_irrigation_state
        
        data = request.get_json()
        features = data.get('features', [])
        
        print(f"🤖 DEMANDE IRRIGATION ML AUTO avec {len(features)} features")
        
        # Forcer l'arrêt de toute irrigation en cours pour ML
        if current_irrigation_state['isActive']:
            print("🛑 Arrêt irrigation pour démarrage ML...")
            mqtt_service.arreter_arrosage()
            current_irrigation_state['isActive'] = False
            current_irrigation_state['type'] = None
            current_irrigation_state['thread'] = None
            time.sleep(2)  # Pause plus longue pour ML
        
        # Obtenir recommandation ML
        try:
            prediction = ml_service.predict_irrigation(features)
            duree_sec = int(prediction['duree_sec'])
            volume_m3 = prediction['volume_m3']
            
            print(f"🤖 ML RECOMMANDATION: {prediction['duree_minutes']} min, {volume_m3} m³")
            
            # Démarrer irrigation ML avec MQTT
            success, message = mqtt_service.demarrer_arrosage_async(
                duree_sec, 
                volume_m3, 
                "ml_auto"
            )
            
            if success:
                current_irrigation_state['isActive'] = True
                current_irrigation_state['type'] = 'ml'
                current_irrigation_state['startTime'] = time.time()
                current_irrigation_state['thread'] = mqtt_service.current_irrigation_thread
                
                print(f"✅ IRRIGATION ML AUTO DÉMARRÉE: {prediction['duree_minutes']} min")
                
                return jsonify({
                    'duree_minutes': prediction['duree_minutes'],
                    'volume_eau_m3': volume_m3,
                    'status': 'ok',
                    'mqtt_started': True,
                    'mqtt_message': 'Irrigation ML démarrée',
                    'auto_irrigation': True,
                    'matt': f"🤖 Irrigation ML AUTO: {prediction['duree_minutes']} min → {volume_m3:.3f} m³ → MQTT ✅"
                }), 200
            else:
                print(f"❌ ÉCHEC MQTT ML: {message}")
                return jsonify({
                    'duree_minutes': prediction['duree_minutes'],
                    'volume_eau_m3': volume_m3,
                    'status': 'ok',
                    'mqtt_started': False,
                    'mqtt_message': f'Erreur MQTT: {message}',
                    'auto_irrigation': True,
                    'matt': f"🤖 Irrigation ML: {prediction['duree_minutes']} min → {volume_m3:.3f} m³ → MQTT ❌"
                }), 200
                
        except Exception as ml_error:
            print(f"❌ Erreur ML: {ml_error}")
            return jsonify({
                'status': 'error',
                'message': f'Erreur ML: {str(ml_error)}',
                'mqtt_started': False
            }), 500
            
    except Exception as e:
        print(f"❌ Erreur irrigation ML: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Erreur serveur: {str(e)}',
            'mqtt_started': False
        }), 500

@irrigation_bp.route('/irrigation/schedule', methods=['POST'])
def schedule_irrigation():
    """Programme l'irrigation selon un planning"""
    try:
        data = request.get_json()
        schedules = data.get('schedules', [])
        
        print(f"📅 Programmation irrigation: {len(schedules)} tâches")
        
        # Ici on pourrait implémenter un système de cron jobs
        # Pour l'instant, on retourne juste une confirmation
        
        return jsonify({
            'success': True,
            'message': f'Planning enregistré avec {len(schedules)} tâches',
            'schedules_count': len(schedules)
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur programmation: {e}")
        return jsonify({
            'success': False,
            'message': f'Erreur: {str(e)}'
        }), 500
