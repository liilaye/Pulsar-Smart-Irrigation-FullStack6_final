
# 🚀 Guide de Démarrage Rapide - PulsarInfinite

## Prérequis

### macOS
- **Python 3.8+** : `brew install python3`
- **Node.js 16+** : `brew install node`
- **Git** : `brew install git`

### Vérification des prérequis
```bash
python3 --version  # >= 3.8
node --version     # >= 16.0
npm --version      # >= 8.0
git --version      # >= 2.0
```

## 🎯 Démarrage en 3 étapes

### 1. Clonage et installation
```bash
# Cloner le projet
git clone <votre-repo-url>
cd PulsarInfinite

# Donner les permissions au script (macOS/Linux)
chmod +x start-macos.sh
```

### 2. Configuration Backend (optionnel)
```bash
# Créer le fichier de configuration
cd backend
cp .env.example .env

# Éditer avec vos clés API (optionnel pour le développement)
nano .env
```

### 3. Démarrage automatique
```bash
# Depuis la racine du projet
./start-macos.sh
```

## ✅ Vérification du fonctionnement

### Tests rapides
1. **Frontend** : http://localhost:5173
2. **Backend API** : http://localhost:5002/api/health
3. **Connexion Backend** : Vérifiez l'indicateur vert dans l'interface

### Résolution des problèmes courants

#### Port déjà utilisé
```bash
# Trouver le processus qui utilise le port
lsof -i :5173  # ou :5002
kill <PID>
```

#### Erreur Python
```bash
# Vérifier l'installation Python
which python3
pip3 install --upgrade pip
```

#### Erreur Node.js
```bash
# Nettoyer le cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 🔄 Démarrage manuel (alternative)

### Terminal 1 - Backend
```bash
cd backend
pip3 install -r requirements.txt
python3 app.py
```

### Terminal 2 - Frontend
```bash
npm install
npm run dev
```

## 🛑 Arrêt des services

### Depuis le terminal de démarrage
- Appuyez sur `Ctrl+C`

### Manuellement
```bash
# Trouver les processus
ps aux | grep "python3 app.py"
ps aux | grep "vite"

# Arrêter les processus
kill <PID_FLASK> <PID_VITE>
```

## 📋 Checklist de démarrage

- [ ] Python 3.8+ installé
- [ ] Node.js 16+ installé
- [ ] Dépendances backend installées
- [ ] Dépendances frontend installées
- [ ] Backend démarré sur port 5002
- [ ] Frontend démarré sur port 5173
- [ ] Test de connexion API réussi
- [ ] Interface utilisateur accessible

## 🎉 Prochaines étapes

1. **Explorez l'interface** : Dashboard, contrôles d'irrigation
2. **Testez les fonctionnalités** : Recommandations ML, contrôle manuel
3. **Consultez les logs** : Vérifiez les connexions dans la console
4. **Personnalisez** : Ajustez les paramètres selon vos besoins

## 🆘 Besoin d'aide ?

- Vérifiez les logs dans la console du navigateur
- Consultez les logs du backend dans le terminal
- Reportez-vous au `README.md` pour plus de détails
- Créez une issue si le problème persiste

---

**Bon développement avec PulsarInfinite ! 🌱**
