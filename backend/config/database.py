
import sqlite3
from datetime import datetime
import os

DATABASE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'irrigation_logs.db')

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
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
    
    conn.commit()
    conn.close()
    print("✅ Base de données SQLite initialisée")

def log_irrigation(action, duration_minutes=None, volume_m3=None, mqtt_status=None, source='manual', details=None):
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO irrigation_logs (action, duration_minutes, volume_m3, mqtt_status, source, details)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (action, duration_minutes, volume_m3, mqtt_status, source, details))
    conn.commit()
    conn.close()

def log_weather(location, temperature, humidity, wind_speed, precipitation):
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO weather_logs (location, temperature, humidity, wind_speed, precipitation)
        VALUES (?, ?, ?, ?, ?)
    ''', (location, temperature, humidity, wind_speed, precipitation))
    conn.commit()
    conn.close()

def log_mqtt(topic, message, status_code):
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO mqtt_logs (topic, message, status_code)
        VALUES (?, ?, ?)
    ''', (topic, message, status_code))
    conn.commit()
    conn.close()
