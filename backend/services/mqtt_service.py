
# services/mqtt_service.py
import paho.mqtt.client as mqtt
import json
import time
import threading
from config.mqtt_config import (
    MQTT_BROKER_HOST,
    MQTT_BROKER_PORT,
    MQTT_TOPIC_DATA,
    MQTT_QOS,
    MQTT_RETAIN
)
from config.database import log_mqtt, log_irrigation

class MQTTService:
    def __init__(self):
        self.current_irrigation_thread = None
        self.stop_irrigation_event = threading.Event()
        self.client = mqtt.Client(client_id="flask_backend")
        self.client.on_connect = self.on_connect
        self.client.on_publish = self.on_publish
        try:
            self.client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, 60)
            self.client.loop_start()
            print(f"✅ Connecté au broker MQTT {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
        except Exception as e:
            print(f"❌ Erreur de connexion MQTT : {e}")

    def on_connect(self, client, userdata, flags, rc):
        print("✅ Connecté au broker MQTT" if rc == 0 else f"❌ Connexion échouée avec code {rc}")

    def on_publish(self, client, userdata, mid):
        print("📤 Message MQTT publié")

    def envoyer_commande_mqtt(self, device_state: int):
        timestamp = str(int(time.time() * 1000))
        payload = {
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
                "id": f"flask-{timestamp}",
                "mqtt_receivedTopic": MQTT_TOPIC_DATA,
                "mqtt_receivedQos": "0",
                "timestamp": timestamp
            }
        }

        try:
            print(f"📤 Publication MQTT: {payload} → {MQTT_TOPIC_DATA}")
            result = self.client.publish(
                MQTT_TOPIC_DATA,
                json.dumps(payload),
                qos=MQTT_QOS,
                retain=MQTT_RETAIN
            )
            log_mqtt(MQTT_TOPIC_DATA, json.dumps(payload), result.rc)
            return result.rc, "OK" if result.rc == mqtt.MQTT_ERR_SUCCESS else "Erreur"
        except Exception as e:
            print(f"❌ Erreur de publication MQTT : {e}")
            log_mqtt(MQTT_TOPIC_DATA, json.dumps(payload), 500)
            return 500, str(e)

    def sequence_arrosage(self, duree_sec: int, volume_m3: float = None, source: str = "manual"):
        try:
            # Reset de l'événement d'arrêt
            self.stop_irrigation_event.clear()
            
            # Démarrer l'irrigation
            status_start, _ = self.envoyer_commande_mqtt(1)
            log_irrigation("START", duree_sec / 60, volume_m3, f"MQTT_START_{status_start}", source)
            print(f"🚿 Arrosage lancé pour {duree_sec} secondes")
            
            # Attente avec possibilité d'interruption
            if self.stop_irrigation_event.wait(timeout=duree_sec):
                print("⏹️ Arrosage interrompu par signal d'arrêt")
            else:
                print("⏰ Durée d'arrosage écoulée")
            
            # Arrêter l'irrigation
            status_stop, _ = self.envoyer_commande_mqtt(0)
            log_irrigation("STOP", duree_sec / 60, volume_m3, f"MQTT_STOP_{status_stop}", source)
            print("⏹️ Arrosage terminé")
            
        except Exception as e:
            print(f"❌ Erreur séquence arrosage: {e}")
            self.envoyer_commande_mqtt(0)
            log_irrigation("ERROR", None, None, f"ERROR_{str(e)}", source)
        finally:
            # Nettoyer le thread courant
            self.current_irrigation_thread = None

    def demarrer_arrosage_async(self, duree_sec: int, volume_m3: float = None, source: str = "manual"):
        # Vérifier si un thread d'irrigation est déjà actif
        if self.current_irrigation_thread and self.current_irrigation_thread.is_alive():
            print("⚠️ Thread d'irrigation déjà actif")
            return False, "Arrosage déjà en cours"
        
        # Créer et démarrer le nouveau thread
        self.current_irrigation_thread = threading.Thread(
            target=self.sequence_arrosage,
            args=(duree_sec, volume_m3, source),
            daemon=True  # Thread daemon pour éviter les blocages
        )
        self.current_irrigation_thread.start()
        return True, "Arrosage démarré"

    def arreter_arrosage(self):
        try:
            # Signaler l'arrêt au thread d'irrigation
            self.stop_irrigation_event.set()
            
            # Envoyer commande d'arrêt MQTT immédiatement
            status, response = self.envoyer_commande_mqtt(0)
            log_irrigation("MANUAL_STOP", None, None, f"MANUAL_STOP_{status}", "manual")
            
            # Attendre que le thread se termine (avec timeout)
            if self.current_irrigation_thread and self.current_irrigation_thread.is_alive():
                self.current_irrigation_thread.join(timeout=5)
                if self.current_irrigation_thread.is_alive():
                    print("⚠️ Thread d'irrigation ne s'arrête pas, forcé à None")
                    self.current_irrigation_thread = None
            
            print("✅ Arrosage arrêté avec succès")
            return status, response
            
        except Exception as e:
            print(f"❌ Erreur arrêt arrosage: {e}")
            return 500, str(e)

# Instance globale
mqtt_service = MQTTService()

