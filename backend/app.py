
from flask import Flask, jsonify
from flask_cors import CORS
from config.database import init_db
from routes.irrigation import irrigation_bp
from routes.weather import weather_bp
from routes.mqtt import mqtt_bp
from routes.logs import logs_bp
from routes.actors import actors_bp
import os

def create_app():
    app = Flask(__name__)
    
    # CORS pour développement local uniquement
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:8080"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    app.config['SECRET_KEY'] = 'dev-local-key'
    app.config['DATABASE_URL'] = 'sqlite:///irrigation_logs.db'
    
    # Initialiser DB
    init_db()
    
    # Enregistrer routes
    app.register_blueprint(irrigation_bp, url_prefix='/api')
    app.register_blueprint(weather_bp, url_prefix='/api')
    app.register_blueprint(mqtt_bp, url_prefix='/api')
    app.register_blueprint(logs_bp, url_prefix='/api')
    app.register_blueprint(actors_bp, url_prefix='/api')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "ok", 
            "message": "Backend Flask LOCAL opérationnel",
            "mode": "development_local",
            "endpoints": [
                "/api/arroser", 
                "/api/mqtt/test-publish", 
                "/api/irrigation/status",
                "/api/actors/register",
                "/api/actors/list"
            ]
        }), 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("🚀 Backend Flask LOCAL - http://localhost:5002")
    print("✅ Configuré pour frontend sur localhost:8080")
    print("✅ Nouvelles routes acteurs disponibles")
    app.run(debug=True, host='localhost', port=5002)
