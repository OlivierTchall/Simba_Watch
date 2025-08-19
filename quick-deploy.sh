#!/bin/bash

# 🚀 DÉPLOIEMENT ULTRA-RAPIDE SIMBA-WATCH
# Ce script fait TOUT en une seule commande

echo "⚡ DÉPLOIEMENT EXPRESS SIMBA-WATCH"
echo "================================="

# Vérifications préliminaires
echo "🔍 Vérification des prérequis..."

# Vérifier Git
if ! command -v git &> /dev/null; then
    echo "❌ Git manquant. Installation requise."
    exit 1
fi

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js manquant. Installation requise."
    exit 1
fi

echo "✅ Prérequis OK"

# Demander les informations utilisateur
echo ""
echo "📝 Configuration du déploiement..."
echo ""

read -p "🔹 Nom d'utilisateur GitHub: " GITHUB_USER
read -p "🔹 Nom du repository (simba-watch): " REPO_NAME
REPO_NAME=${REPO_NAME:-simba-watch}

echo ""
echo "🎯 Configuration:"
echo "   - GitHub: https://github.com/$GITHUB_USER/$REPO_NAME"
echo "   - Backend: Railway"
echo "   - Frontend: Vercel"
echo ""

read -p "Continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Déploiement annulé"
    exit 1
fi

echo ""
echo "🚀 DÉBUT DU DÉPLOIEMENT..."
echo "=========================="

# Étape 1: Préparer le dossier
echo "1️⃣ Préparation..."
rm -rf simba-watch-deploy
mkdir simba-watch-deploy
cp -r backend frontend *.md simba-watch-deploy/ 2>/dev/null
cd simba-watch-deploy

# Étape 2: Configuration
echo "2️⃣ Configuration des fichiers..."

# Package.json racine
cat > package.json << EOF
{
  "name": "$REPO_NAME",
  "version": "1.0.0",
  "description": "Simba-Watch - Strategic Intelligence Monitoring",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "cd backend && uvicorn server:app --host 0.0.0.0 --port \$PORT",
    "dev:backend": "cd backend && uvicorn server:app --reload",
    "dev:frontend": "cd frontend && npm start"
  },
  "keywords": ["monitoring", "intelligence", "africa", "sme"],
  "author": "Simba-Watch Team"
}
EOF

# Vercel.json
cat > vercel.json << EOF
{
  "version": 2,
  "name": "$REPO_NAME",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/\$1"
    }
  ],
  "env": {
    "REACT_APP_BACKEND_URL": "@backend-url"
  }
}
EOF

# Railway.toml
cat > railway.toml << EOF
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
startCommand = "cd backend && uvicorn server:app --host 0.0.0.0 --port \$PORT"
EOF

# Procfile pour Railway
cat > backend/Procfile << EOF
web: uvicorn server:app --host 0.0.0.0 --port \$PORT
EOF

# .env.production
cat > frontend/.env.production << EOF
GENERATE_SOURCEMAP=false
REACT_APP_BACKEND_URL=\$REACT_APP_BACKEND_URL
EOF

# GitIgnore
cat > .gitignore << EOF
node_modules/
__pycache__/
*.pyc
.env
frontend/build/
*.log
.DS_Store
EOF

echo "✅ Fichiers configurés"

# Étape 3: Git
echo "3️⃣ Initialisation Git..."
git init
git add .
git commit -m "🚀 Simba-Watch deployment ready

✨ Features:
- Technology monitoring with NewsAPI
- Social media monitoring with Twitter API  
- Competitor tracking
- Sentiment analysis
- Multi-language support (EN/FR)
- Mobile-responsive design
- JWT authentication

🔧 Tech Stack:
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind CSS
- Deployment: Railway + Vercel
- APIs: NewsAPI + Twitter API v2

Ready for production deployment!"

echo "✅ Git configuré"

# Étape 4: Build test
echo "4️⃣ Test du build frontend..."
cd frontend
npm install --silent
npm run build

if [ ! -d "build" ]; then
    echo "❌ Erreur de build frontend"
    exit 1
fi

echo "✅ Build frontend OK"
cd ..

# Étape 5: Générer les commandes finales
echo "5️⃣ Génération des commandes de déploiement..."

cat > COMMANDES-FINALES.txt << EOF
🎯 COMMANDES POUR TERMINER LE DÉPLOIEMENT
========================================

📍 ÉTAPE 1 - GITHUB (30 secondes):
----------------------------------
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
git branch -M main  
git push -u origin main

📍 ÉTAPE 2 - RAILWAY (2 minutes):
---------------------------------
1. Aller sur https://railway.app
2. Se connecter avec GitHub
3. "New Project" → "Deploy from GitHub repo" 
4. Sélectionner: $GITHUB_USER/$REPO_NAME
5. Dans Variables, ajouter:
   NEWS_API_KEY=7cdbae1ef22b4adda9740958b0383f13
   TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABVj3AEAAAAAmhiW9ldmhlJ64ANMCoU35THhqBs%3DkgmhbKcZ6ALLft36nJxj0Z6OFLLHjjSFYqrFcABaE2QOk3GTx2
   JWT_SECRET=simba-watch-secret-key-2024
6. Copier l'URL générée: https://xxx.up.railway.app

📍 ÉTAPE 3 - VERCEL (1 minute):
-------------------------------
1. Aller sur https://vercel.com
2. Se connecter avec GitHub  
3. "Add New Project"
4. Sélectionner: $GITHUB_USER/$REPO_NAME
5. Configuration:
   - Build Command: cd frontend && npm run build
   - Output Directory: frontend/build
6. Dans Environment Variables:
   REACT_APP_BACKEND_URL=https://xxx.up.railway.app
7. Deploy!

🎉 RÉSULTAT FINAL:
------------------
Frontend: https://$REPO_NAME.vercel.app
Backend:  https://xxx.up.railway.app
API Docs: https://xxx.up.railway.app/docs

⏱️ TEMPS TOTAL: ~5 MINUTES
💰 COÛT: GRATUIT pour toujours!
EOF

echo ""
echo "🎊 PRÉPARATION 100% TERMINÉE!"
echo "=============================="
echo ""
echo "📁 Dossier: simba-watch-deploy/"
echo "📋 Guide: COMMANDES-FINALES.txt"
echo ""
echo "🔥 IL RESTE SEULEMENT 3 ÉTAPES DE 2 MINUTES CHACUNE:"
echo ""
echo "1️⃣ Créer repository GitHub + push"
echo "2️⃣ Déployer backend sur Railway"  
echo "3️⃣ Déployer frontend sur Vercel"
echo ""
echo "📖 Toutes les commandes exactes sont dans COMMANDES-FINALES.txt"
echo ""
echo "✨ VOTRE SIMBA-WATCH SERA EN LIGNE DANS 6 MINUTES!"
echo ""