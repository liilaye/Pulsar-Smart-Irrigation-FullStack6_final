
import requests
import json
import time
import threading
from config.mqtt_config import MQTT_BROKER_URL, MQTT_TOPIC_DATA
from config.database import log_mqtt, log_irrigation

class MQTTService:
    def __init__(self):
        self.current_irrigation_thread = None
        
    def envoyer_commande_mqtt(self, device_state: int):
        """Envoie une commande ON/OFF via MQTT"""
        payload = {
            "topic": MQTT_TOPIC_DATA,
            "message": {
                "type": "JOIN",
                "fcnt": 0,
                "json": {
                    "switch_relay": {
                        "device": device_state
                    }
                },
                "mqttHeaders": {
                    "mqtt_receivedRetained": "false",
                    "mqtt_id": "0",
                    "mqtt_duplicate": "false",
                    "id": f"flask_{int(time.time())}",
                    "mqtt_receivedTopic": MQTT_TOPIC_DATA,
                    "mqtt_receivedQos": "1",
                    "timestamp": str(int(time.time() * 1000))
                }
            }
        }
        
        try:
            print(f"📤 Envoi commande MQTT: device={device_state}")
            response = requests.post(f"{MQTT_BROKER_URL}/api/mqtt/publish", json=payload, timeout=10)
            status_code = response.status_code
            response_text = response.text
            
            # Log dans la base de données
            log_mqtt(MQTT_TOPIC_DATA, json.dumps(payload), status_code)
            
            print(f"✅ MQTT Response: {status_code} - {response_text}")
            return status_code, response_text
            
        except Exception as e:
            print(f"❌ MQTT Error: {e}")
            log_mqtt(MQTT_TOPIC_DATA, json.dumps(payload), 500)
            return 500, str(e)
    
    def sequence_arrosage(self, duree_sec: int, volume_m3: float = None, source: str = "manual"):
        """Séquence complète d'arrosage avec timing"""
        try:
            # Démarrer l'arrosage
            status_start, _ = self.envoyer_commande_mqtt(1)
            log_irrigation("START", duree_sec/60, volume_m3, f"MQTT_START_{status_start}", source)
            
            print(f"🚿 Arrosage démarré pour {duree_sec} secondes")
            
            # Attendre la durée spécifiée
            time.sleep(duree_sec)
            
            # Arrêter l'arrosage
            status_stop, _ = self.envoyer_commande_mqtt(0)
            log_irrigation("STOP", duree_sec/60, volume_m3, f"MQTT_STOP_{status_stop}", source)
            
            print("⏹️ Arrosage terminé")
            
        except Exception as e:
            print(f"❌ Erreur séquence arrosage: {e}")
            # Tentative d'arrêt en cas d'erreur
            self.envoyer_commande_mqtt(0)
            log_irrigation("ERROR", None, None, f"ERROR_{str(e)}", source)
    
    def demarrer_arrosage_async(self, duree_sec: int, volume_m3: float = None, source: str = "manual"):
        """Démarre l'arrosage dans un thread séparé"""
        if self.current_irrigation_thread and self.current_irrigation_thread.is_alive():
            return False, "Arrosage déjà en cours"
        
        self.current_irrigation_thread = threading.Thread(
            target=self.sequence_arrosage, 
            args=(duree_sec, volume_m3, source)
        )
        self.current_irrigation_thread.start()
        return True, "Arrosage démarré"
    
    def arreter_arrosage(self):
        """Arrête immédiatement l'arrosage"""
        status, response = self.envoyer_commande_mqtt(0)
        log_irrigation("MANUAL_STOP", None, None, f"MANUAL_STOP_{status}", "manual")
        return status, response

# Instance globale
mqtt_service = MQTTService()
