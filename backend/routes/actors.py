
from flask import Blueprint, request, jsonify
from config.database import get_db_connection
import json
import logging

actors_bp = Blueprint('actors', __name__)

@actors_bp.route('/actors/register', methods=['POST'])
def register_actor():
    """Enregistrer un nouvel acteur agricole"""
    try:
        data = request.get_json()
        
        # Validation des données requises
        required_fields = ['prenom', 'nom', 'role', 'region', 'localite', 
                          'superficie', 'systeme_irrigation', 'type_sol', 'type_culture', 'speculation']
        
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"Champ requis manquant: {field}"}), 400
        
        conn = get_db_connection()
        
        # Vérifier si la table existe, sinon la créer
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insérer le nouvel acteur
        cursor = conn.execute('''
            INSERT INTO actors (prenom, nom, role, region, localite, superficie, 
                              systeme_irrigation, type_sol, type_culture, speculation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['prenom'],
            data['nom'], 
            data['role'],
            data['region'],
            data['localite'],
            int(data['superficie']),
            data['systeme_irrigation'],
            data['type_sol'],
            data['type_culture'],
            data['speculation']
        ))
        
        actor_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logging.info(f"✅ Nouvel acteur enregistré: {data['prenom']} {data['nom']} (ID: {actor_id})")
        
        return jsonify({
            "success": True,
            "message": "Acteur enregistré avec succès",
            "id": actor_id,
            "actor": data
        }), 201
        
    except Exception as e:
        logging.error(f"❌ Erreur enregistrement acteur: {e}")
        return jsonify({"error": "Erreur interne du serveur"}), 500

@actors_bp.route('/actors/list', methods=['GET'])
def list_actors():
    """Récupérer la liste de tous les acteurs enregistrés"""
    try:
        conn = get_db_connection()
        
        # Vérifier si la table existe
        cursor = conn.execute('''
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='actors'
        ''')
        
        if not cursor.fetchone():
            conn.close()
            return jsonify({"actors": []}), 200
        
        # Récupérer tous les acteurs
        cursor = conn.execute('''
            SELECT id, prenom, nom, role, region, localite, superficie,
                   systeme_irrigation, type_sol, type_culture, speculation, created_at
            FROM actors 
            ORDER BY created_at DESC
        ''')
        
        actors = []
        for row in cursor.fetchall():
            actors.append({
                "id": row[0],
                "prenom": row[1],
                "nom": row[2], 
                "role": row[3],
                "region": row[4],
                "localite": row[5],
                "superficie": row[6],
                "systeme_irrigation": row[7],
                "type_sol": row[8],
                "type_culture": row[9],
                "speculation": row[10],
                "created_at": row[11]
            })
        
        conn.close()
        
        logging.info(f"📋 Liste acteurs récupérée: {len(actors)} acteur(s)")
        
        return jsonify({
            "success": True,
            "actors": actors,
            "total": len(actors)
        }), 200
        
    except Exception as e:
        logging.error(f"❌ Erreur récupération acteurs: {e}")
        return jsonify({"error": "Erreur interne du serveur"}), 500

@actors_bp.route('/actors/<int:actor_id>', methods=['GET'])
def get_actor(actor_id):
    """Récupérer les détails d'un acteur spécifique"""
    try:
        conn = get_db_connection()
        
        cursor = conn.execute('''
            SELECT id, prenom, nom, role, region, localite, superficie,
                   systeme_irrigation, type_sol, type_culture, speculation, created_at
            FROM actors 
            WHERE id = ?
        ''', (actor_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Acteur non trouvé"}), 404
        
        actor = {
            "id": row[0],
            "prenom": row[1],
            "nom": row[2],
            "role": row[3], 
            "region": row[4],
            "localite": row[5],
            "superficie": row[6],
            "systeme_irrigation": row[7],
            "type_sol": row[8],
            "type_culture": row[9],
            "speculation": row[10],
            "created_at": row[11]
        }
        
        logging.info(f"👤 Acteur récupéré: {actor['prenom']} {actor['nom']}")
        
        return jsonify({
            "success": True,
            "actor": actor
        }), 200
        
    except Exception as e:
        logging.error(f"❌ Erreur récupération acteur {actor_id}: {e}")
        return jsonify({"error": "Erreur interne du serveur"}), 500
