
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

@irrigation_bp.route('/irrigation/system', methods=['POST'])
def irrigation_system():
    """Configuration du système d'irrigation avec logique métier"""
    try:
        data = request.get_json()
        system_type = data.get('systemType')
        
        if not system_type:
            return jsonify({"success": False, "message": "Type de système manquant"}), 400
        
        print(f"🔧 Configuration système reçue: {system_type}")
        
        # Logique métier pour traitement du système d'irrigation
        if system_type == 'aucun':
            recommendation = analyze_and_recommend_system()
            message = f"Aucun système détecté. Recommandation: {recommendation['system']} - {recommendation['reason']}"
            log_irrigation("SYSTEM_RECOMMENDATION", None, None, f"RECOMMEND_{recommendation['system']}", "config")
        else:
            # Analyser le système existant et optimiser
            optimization = optimize_existing_system(system_type)
            message = f"Système {system_type} configuré. Optimisation: {optimization['suggestion']}"
            log_irrigation("SYSTEM_CONFIG", None, None, f"SYSTEM_{system_type}", "config")
        
        return jsonify({
            "success": True,
            "message": message,
            "data": {
                "systemType": system_type,
                "analysis": analyze_system_efficiency(system_type) if system_type != 'aucun' else None
            }
        })
        
    except Exception as e:
        print(f"❌ Erreur configuration système: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@irrigation_bp.route('/irrigation/schedule', methods=['POST'])
def irrigation_schedule():
    """Configuration du planning d'irrigation"""
    try:
        data = request.get_json()
        schedules = data.get('schedules')
        
        if not schedules:
            return jsonify({"success": False, "message": "Planning manquant"}), 400
        
        # Log du planning
        enabled_days = [day for day, config in schedules.items() if config.get('enabled')]
        log_irrigation("SCHEDULE_CONFIG", None, None, f"SCHEDULE_{len(enabled_days)}_days", "config")
        
        return jsonify({
            "success": True,
            "message": f"Planning configuré pour {len(enabled_days)} jours"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Nouvelles routes pour les analyses temps réel
@irrigation_bp.route('/analytics/trends', methods=['GET'])
def get_trends():
    """Analyse des tendances en temps réel"""
    try:
        # Simuler des données d'analyse basées sur les logs récents
        import random
        from datetime import datetime, timedelta
        
        # Ici vous pouvez implémenter la vraie logique d'analyse
        trends = {
            "waterConsumption": round(random.uniform(0.5, 1.2), 2),
            "soilMoisture": random.randint(35, 65),
            "efficiency": random.randint(80, 95),
            "trend": random.choice(['increasing', 'decreasing', 'stable'])
        }
        
        print("📊 Envoi analyse des tendances:", trends)
        return jsonify(trends)
        
    except Exception as e:
        print(f"❌ Erreur analyse tendances: {e}")
        return jsonify({"error": str(e)}), 500

@irrigation_bp.route('/analytics/ml-predictions', methods=['GET'])
def get_ml_predictions():
    """Prédictions ML en temps réel"""
    try:
        # Simuler des prédictions ML basées sur les conditions actuelles
        import random
        
        predictions = {
            "nextIrrigationHours": random.randint(2, 12),
            "recommendedDuration": random.randint(20, 45),
            "soilCondition": random.choice(['Optimal', 'Sec', 'Humide']),
            "weatherImpact": random.choice(['Favorable', 'Défavorable', 'Neutre'])
        }
        
        print("🧠 Envoi prédictions ML:", predictions)
        return jsonify(predictions)
        
    except Exception as e:
        print(f"❌ Erreur prédictions ML: {e}")
        return jsonify({"error": str(e)}), 500

def analyze_and_recommend_system():
    """Analyser le terrain et recommander un système d'irrigation efficace"""
    # Logique d'analyse pour recommander un système adapté
    # Basé sur les paramètres du sol, climat, culture, etc.
    
    recommendations = {
        'goutte-a-goutte': {
            'efficiency': 95,
            'reason': 'Économique en eau, adapté aux cultures en ligne comme l\'arachide'
        },
        'aspersion': {
            'efficiency': 80,
            'reason': 'Bon pour grandes surfaces, simulation pluie naturelle'
        },
        'micro-aspersion': {
            'efficiency': 85,
            'reason': 'Compromis entre économie et couverture'
        }
    }
    
    # Pour Thiès/Taïba Ndiaye avec culture d'arachide
    return {
        'system': 'goutte-a-goutte',
        'reason': recommendations['goutte-a-goutte']['reason'],
        'efficiency': recommendations['goutte-a-goutte']['efficiency']
    }

def optimize_existing_system(system_type):
    """Optimiser un système d'irrigation existant"""
    optimizations = {
        'goutte-a-goutte': {
            'suggestion': 'Vérifier les goutteurs, programmer arrosage tôt matin',
            'efficiency_gain': 10
        },
        'aspersion': {
            'suggestion': 'Réduire pression, éviter heures chaudes',
            'efficiency_gain': 15
        },
        'tourniquet': {
            'suggestion': 'Ajuster vitesse rotation selon vent',
            'efficiency_gain': 12
        }
    }
    
    return optimizations.get(system_type, {
        'suggestion': 'Maintenance régulière recommandée',
        'efficiency_gain': 5
    })

def analyze_system_efficiency(system_type):
    """Analyser l'efficacité du système actuel"""
    efficiencies = {
        'goutte-a-goutte': 90,
        'aspersion': 75,
        'tourniquet': 70,
        'laser': 85,
        'micro-aspersion': 80,
        'submersion': 60
    }
    
    return {
        'efficiency': efficiencies.get(system_type, 70),
        'waterSaving': efficiencies.get(system_type, 70) - 50,
        'suitability': 'Excellent' if efficiencies.get(system_type, 70) > 85 else 'Bon'
    }
