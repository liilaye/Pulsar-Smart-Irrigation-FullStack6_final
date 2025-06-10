
import os

# # Configuration MQTT
# MQTT_BROKER_URL = "http://217.182.210.54:8080"


MQTT_BROKER_HOST = "217.182.210.54"
MQTT_BROKER_PORT = 1883  # Port natif MQTT TCP
MQTT_QOS = 1
MQTT_RETAIN = True 


MQTT_WS_URL = "ws://217.182.210.54:8080/mqtt"
MQTT_TOPIC_DATA = "data/PulsarInfinite/swr"


MQTT_TOPIC_STATUS = "data/PulsarInfinite/status" #infinite/PulsarInfinite/status 
MQTT_TOPIC_CONTROL = "data/PulsarInfinite/control" #infinite/PulsarInfinite/control 
# MQTT_TOPIC_LOGS = "data/PulsarInfinite/logs" #infinite/PulsarInfinite/status 

# Paramètres système
DEBIT_LITRES_PAR_MIN = 20
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'xgboost_arrosage_litres.pkl')

# Clés API
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "votre_cle_api_openweather")
