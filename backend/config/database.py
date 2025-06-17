import sqlite3
from datetime import datetime
import os
import stat

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'irrigation_logs.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_db_permissions():
    """Assurer que la base de données a les bonnes permissions"""
    try:
        # Créer le fichier s'il n'existe pas
        if not os.path.exists(DATABASE_PATH):
            # Créer un fichier vide
            open(DATABASE_PATH, 'a').close()
            print(f"✅ Base de données créée: {DATABASE_PATH}")
        
        # Définir les permissions de lecture/écriture
        os.chmod(DATABASE_PATH, stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP)
        print(f"✅ Permissions définies pour: {DATABASE_PATH}")
        
        # Vérifier les permissions du répertoire parent
        parent_dir = os.path.dirname(DATABASE_PATH)
        if not os.access(parent_dir, os.W_OK):
            print(f"⚠️ Répertoire parent sans permission d'écriture: {parent_dir}")
            
    except Exception as e:
        print(f"❌ Erreur permissions base de données: {e}")

def init_db():
    # Assurer les permissions avant d'initialiser
    ensure_db_permissions()
    
    try:
        conn = get_db_connection()
        
        # Table pour les logs d'irrigation
        conn.execute('''
            CREATE TABLE IF NOT EXISTS irrigation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                duration_minutes REAL,
                volume_m3 REAL,
                mqtt_status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                source TEXT DEFAULT 'manual',
                details TEXT
            )
        ''')
        
        # Table pour les logs météo
        conn.execute('''
            CREATE TABLE IF NOT EXISTS weather_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location TEXT NOT NULL,
                temperature REAL,
                humidity REAL,
                wind_speed REAL,
                precipitation REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Table pour les logs MQTT
        conn.execute('''
            CREATE TABLE IF NOT EXISTS mqtt_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL,
                message TEXT,
                status_code INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Table pour les acteurs agricoles
        conn.execute('''
            CREATE TABLE IF NOT EXISTS actors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prenom TEXT NOT NULL,
                nom TEXT NOT NULL,
                role TEXT NOT NULL,
                region TEXT NOT NULL,
                localite TEXT NOT NULL,
                superficie INTEGER NOT NULL,
                systeme_irrigation TEXT NOT NULL,
                type_sol TEXT NOT NULL,
                type_culture TEXT NOT NULL,
                speculation TEXT NOT NULL,
                coordinates_lat REAL,
                coordinates_lng REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Base de données SQLite initialisée avec table actors")
        
    except sqlite3.OperationalError as e:
        if "readonly database" in str(e):
            print(f"❌ Base de données en lecture seule: {DATABASE_PATH}")
            print("🔧 Solutions:")
            print("1. Supprimez le fichier irrigation_logs.db")
            print("2. Redémarrez le serveur Flask")
            print("3. Ou changez les permissions: chmod 666 irrigation_logs.db")
        else:
            print(f"❌ Erreur SQLite: {e}")
        raise
    except Exception as e:
        print(f"❌ Erreur initialisation DB: {e}")
        raise

def log_irrigation(action, duration_minutes=None, volume_m3=None, mqtt_status=None, source='manual', details=None):
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO irrigation_logs (action, duration_minutes, volume_m3, mqtt_status, source, details)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (action, duration_minutes, volume_m3, mqtt_status, source, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"❌ Erreur log irrigation: {e}")

def log_weather(location, temperature, humidity, wind_speed, precipitation):
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO weather_logs (location, temperature, humidity, wind_speed, precipitation)
            VALUES (?, ?, ?, ?, ?)
        ''', (location, temperature, humidity, wind_speed, precipitation))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"❌ Erreur log météo: {e}")

def log_mqtt(topic, message, status_code):
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO mqtt_logs (topic, message, status_code)
            VALUES (?, ?, ?)
        ''', (topic, message, status_code))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"❌ Erreur log MQTT: {e}")
