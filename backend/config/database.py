
import sqlite3
from datetime import datetime
import os
import stat
import tempfile
from pathlib import Path

# Utiliser le répertoire home de l'utilisateur pour éviter les problèmes de permissions
HOME_DIR = Path.home()
DB_DIR = HOME_DIR / '.pulsar_irrigation'
DATABASE_PATH = DB_DIR / 'irrigation_logs.db'

def ensure_db_directory():
    """Créer le répertoire de base de données s'il n'existe pas"""
    try:
        DB_DIR.mkdir(exist_ok=True)
        print(f"✅ Répertoire DB créé/vérifié: {DB_DIR}")
        return True
    except Exception as e:
        print(f"❌ Erreur création répertoire: {e}")
        return False

def get_db_connection():
    # S'assurer que le répertoire existe
    if not ensure_db_directory():
        raise Exception("Impossible de créer le répertoire de base de données")
    
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def ensure_db_permissions():
    """Assurer que la base de données a les bonnes permissions"""
    try:
        # Créer le répertoire s'il n'existe pas
        if not ensure_db_directory():
            return False
            
        # Créer le fichier s'il n'existe pas
        if not DATABASE_PATH.exists():
            DATABASE_PATH.touch()
            print(f"✅ Base de données créée: {DATABASE_PATH}")
        
        # Définir les permissions de lecture/écriture
        DATABASE_PATH.chmod(0o666)
        print(f"✅ Permissions définies pour: {DATABASE_PATH}")
        return True
        
    except Exception as e:
        print(f"❌ Erreur permissions base de données: {e}")
        return False

def init_db():
    # Assurer les permissions avant d'initialiser
    if not ensure_db_permissions():
        print("⚠️ Tentative de création dans un répertoire temporaire...")
        # Fallback vers un répertoire temporaire
        global DATABASE_PATH
        temp_dir = Path(tempfile.gettempdir()) / 'pulsar_irrigation'
        temp_dir.mkdir(exist_ok=True)
        DATABASE_PATH = temp_dir / 'irrigation_logs.db'
        print(f"📂 Utilisation du répertoire temporaire: {DATABASE_PATH}")
    
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
        print(f"✅ Base de données SQLite initialisée: {DATABASE_PATH}")
        
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
