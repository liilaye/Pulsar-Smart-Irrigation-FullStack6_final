
from flask import Flask
from flask_cors import CORS
from config.database import init_db
from routes.irrigation import irrigation_bp
from routes.weather import weather_bp
from routes.mqtt import mqtt_bp
from routes.logs import logs_bp
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['DATABASE_URL'] = os.environ.get('DATABASE_URL', 'sqlite:///irrigation_logs.db')
    
    # Initialiser la base de données
    init_db()
    
    # Enregistrer les blueprints
    app.register_blueprint(irrigation_bp, url_prefix='/api')
    app.register_blueprint(weather_bp, url_prefix='/api')
    app.register_blueprint(mqtt_bp, url_prefix='/api')
    app.register_blueprint(logs_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Backend Flask PulsarInfinite disponible sur http://localhost:5002")
    app.run(debug=True, host='0.0.0.0', port=5002)
