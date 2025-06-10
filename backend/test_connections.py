
#!/usr/bin/env python3
"""
Script de test des connexions du backend Flask PulsarInfinite
"""

import requests
import json
import time
from services.mqtt_service import mqtt_service
from services.weather_service import weather_service
from services.ml_service import ml_service

def test_mqtt_connection():
    """Test de la connexion MQTT"""
    print("Test connexion MQTT...")
    try:
        status, response = mqtt_service.envoyer_commande_mqtt(0)
        if status < 400:
            print("cd .. MQTT: Connexion OK")
            return True
        else:
            print(f" MQTT: Erreur {status} - {response}")
            return False
    except Exception as e:
        print(f" MQTT: Exception - {e}")
        return False

def test_weather_api():
    """Test de l'API météo"""
    print("Test API météo...")
    try:
        data = weather_service.get_weather_data("thies")
        if data and 'temperature' in data:
            print(f"Météo: {data['location']} - {data['temperature']}")
            return True
        else:
            print("Météo: Données invalides")
            return False
    except Exception as e:
        print(f"Météo: Exception - {e}")
        return False

def test_ml_model():
    """Test du modèle ML"""
    print("Test modèle ML...")
    try:
        if ml_service.model is None:
            print(" ML: Modèle non chargé")
            return False
        
        # Test avec des données factices
        features = [25, 2.5, 65, 12, 1, 25000, 26, 42, 1.2, 6.8, 45, 38, 152, 3, 2]
        prediction = ml_service.predict_irrigation(features)
        
        print(f"✅ ML: Prédiction {prediction['volume_m3']} m³ en {prediction['duree_minutes']} min")
        return True
    except Exception as e:
        print(f" ML: Exception - {e}")
        return False

def test_flask_endpoints():
    """Test des endpoints Flask"""
    print("🔄 Test endpoints Flask...")
    base_url = "http://localhost:5002/api"
    
    tests = [
        ("GET", f"{base_url}/irrigation/status", None),
        ("GET", f"{base_url}/weather/thies", None),
        ("GET", f"{base_url}/logs/irrigation", None)
    ]
    
    results = []
    for method, url, data in tests:
        try:
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=5)
            
            if response.status_code < 400:
                print(f"✅ {method} {url.split('/')[-1]}: OK")
                results.append(True)
            else:
                print(f"{method} {url.split('/')[-1]}: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f" {method} {url.split('/')[-1]}: {e}")
            results.append(False)
    
    return all(results)

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Test des connexions PulsarInfinite")
    print("=" * 60)
    
    mqtt_ok = test_mqtt_connection()
    weather_ok = test_weather_api()
    ml_ok = test_ml_model()
    
    print("\n" + "=" * 60)
    print("📊 Résumé des tests:")
    print(f"📡 MQTT: {' OK' if mqtt_ok else '❌ KO'}")
    print(f"🌤️ Météo: {' OK' if weather_ok else '❌ KO'}")
    print(f"🤖 ML: {'OK' if ml_ok else '❌ KO'}")
    
    if all([mqtt_ok, weather_ok, ml_ok]):
        print("Tous les services sont fonctionnels!")
    else:
        print("Certains services nécessitent une vérification.")
    
    print("=" * 60)
