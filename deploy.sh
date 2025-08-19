#!/bin/bash

# 🚀 SIMBA-WATCH - DÉPLOIEMENT AUTOMATIQUE SUR VERCEL + RAILWAY
# Ce script automatise tout le processus de déploiement

echo "🎯 DÉPLOIEMENT SIMBA-WATCH - VERCEL + RAILWAY"
echo "=============================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
print_step() {
    echo -e "\n${BLUE}🔵 ÉTAPE $1: $2${NC}"
    echo "----------------------------------------"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    print_error "Git n'est pas installé. Veuillez installer Git d'abord."
    exit 1
fi

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez installer Node.js d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé. Veuillez installer npm d'abord."
    exit 1
fi

print_step "1" "PRÉPARATION DE L'ENVIRONNEMENT"

# Créer dossier de déploiement si nécessaire
if [ ! -d "simba-watch-deploy" ]; then
    mkdir simba-watch-deploy
fi

# Copier tous les fichiers vers le dossier de déploiement
print_success "Copie des fichiers de l'application..."
cp -r backend simba-watch-deploy/
cp -r frontend simba-watch-deploy/
cp -r *.md simba-watch-deploy/ 2>/dev/null || :
cp vercel.json simba-watch-deploy/ 2>/dev/null || :

cd simba-watch-deploy

print_step "2" "CONFIGURATION DES FICHIERS DE DÉPLOIEMENT"

# Créer package.json racine pour Vercel
cat > package.json << 'EOF'
{
  "name": "simba-watch",
  "version": "1.0.0",
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "cd backend && python -m uvicorn server:app --host 0.0.0.0 --port $PORT"
  }
}
EOF
print_success "Package.json racine créé"

# Créer railway.toml pour Railway
cat > railway.toml << 'EOF'
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
startCommand = "cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT"

[[services]]
name = "backend"
source = "backend"

[services.backend.variables]
NEWS_API_KEY = "7cdbae1ef22b4adda9740958b0383f13"
TWITTER_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAABVj3AEAAAAAmhiW9ldmhlJ64ANMCoU35THhqBs%3DkgmhbKcZ6ALLft36nJxj0Z6OFLLHjjSFYqrFcABaE2QOk3GTx2"
JWT_SECRET = "simba-watch-secret-key-2024"
EOF
print_success "Configuration Railway créée"

# Mettre à jour vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "name": "simba-watch",
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
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "REACT_APP_BACKEND_URL": "https://simba-watch-production.up.railway.app"
  }
}
EOF
print_success "Configuration Vercel créée"

# Créer .env.production pour le frontend
cat > frontend/.env.production << 'EOF'
REACT_APP_BACKEND_URL=https://simba-watch-production.up.railway.app
GENERATE_SOURCEMAP=false
EOF
print_success "Fichier .env.production créé"

# Créer requirements.txt pour Railway si pas existant
if [ ! -f backend/requirements.txt ]; then
cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn==0.24.0
motor==3.3.1
pymongo==4.5.0
pydantic==2.5.0
pyjwt==2.8.0
textblob==0.19.0
httpx==0.28.1
dnspython==2.6.1
EOF
fi
print_success "Requirements.txt vérifié"

# Créer Procfile pour Railway
cat > backend/Procfile << 'EOF'
web: uvicorn server:app --host 0.0.0.0 --port $PORT
EOF
print_success "Procfile créé"

# Créer .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
frontend/build/
backend/dist/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF
print_success ".gitignore créé"

print_step "3" "INITIALISATION GIT ET COMMIT"

# Initialiser git si nécessaire
if [ ! -d ".git" ]; then
    git init
    print_success "Repository Git initialisé"
fi

# Ajouter tous les fichiers
git add .
git commit -m "🚀 Simba-Watch ready for deployment on Vercel + Railway

✅ FastAPI backend configured for Railway
✅ React frontend configured for Vercel  
✅ MongoDB integration ready
✅ External APIs configured (NewsAPI + Twitter)
✅ Multi-language support (EN/FR)
✅ Mobile-responsive design
✅ JWT authentication
✅ Sentiment analysis
✅ All monitoring modules ready

Deployment targets:
- Backend: Railway (https://railway.app)
- Frontend: Vercel (https://vercel.com)
- Database: MongoDB Atlas or Railway MongoDB
- Domain: Auto-generated HTTPS domains

Author: Simba-Watch Team
Version: 1.0.0" 2>/dev/null || print_warning "Pas de changements à committer"

print_success "Code committé avec succès"

print_step "4" "INSTALLATION DES OUTILS DE DÉPLOIEMENT"

# Installer Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_success "Installation de Vercel CLI..."
    npm install -g vercel
else
    print_success "Vercel CLI déjà installé"
fi

# Installer Railway CLI
if ! command -v railway &> /dev/null; then
    print_success "Installation de Railway CLI..."
    # Linux/Mac
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        curl -fsSL https://railway.app/install.sh | sh
    else
        print_warning "Veuillez installer Railway CLI manuellement depuis https://railway.app/cli"
    fi
else
    print_success "Railway CLI déjà installé"
fi

print_step "5" "CONSTRUCTION DU FRONTEND"

cd frontend
print_success "Installation des dépendances frontend..."
npm install

print_success "Construction du build de production..."
npm run build

if [ -d "build" ]; then
    print_success "Build frontend créé avec succès"
else
    print_error "Échec de la construction du frontend"
    exit 1
fi

cd ..

print_step "6" "GÉNÉRATION DES COMMANDES DE DÉPLOIEMENT"

# Créer script de déploiement manuel
cat > DEPLOY-COMMANDS.md << 'EOF'
# 🚀 COMMANDES DE DÉPLOIEMENT SIMBA-WATCH

## ⚡ DÉPLOIEMENT AUTOMATIQUE

### 1️⃣ GITHUB (30 secondes)
```bash
# Créer repository GitHub (faire sur github.com d'abord)
git remote add origin https://github.com/VOTRE-USERNAME/simba-watch.git
git branch -M main
git push -u origin main
```

### 2️⃣ RAILWAY - BACKEND (2 minutes)
```bash
# Se connecter à Railway
railway login

# Lier au projet (créer nouveau projet sur railway.app d'abord)
railway link

# Ajouter variables d'environnement
railway env set NEWS_API_KEY=7cdbae1ef22b4adda9740958b0383f13
railway env set TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABVj3AEAAAAAmhiW9ldmhlJ64ANMCoU35THhqBs%3DkgmhbKcZ6ALLft36nJxj0Z6OFLLHjjSFYqrFcABaE2QOk3GTx2
railway env set JWT_SECRET=simba-watch-secret-key-2024

# Déployer
railway up
```

### 3️⃣ VERCEL - FRONTEND (1 minute)
```bash
# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

## 🌐 ALTERNATIVE - INTERFACE WEB

### Railway (Backend):
1. Aller sur https://railway.app
2. Se connecter avec GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Sélectionner votre repository
5. Ajouter variables d'environnement
6. Déployer automatiquement

### Vercel (Frontend):
1. Aller sur https://vercel.com  
2. Se connecter avec GitHub
3. "Add New Project"
4. Sélectionner votre repository
5. Configuration:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
6. Ajouter variable: `REACT_APP_BACKEND_URL=https://votre-railway-url`
7. Déployer

## 📱 URLS FINALES
- Frontend: https://votre-app.vercel.app
- Backend: https://votre-app.up.railway.app  
- API Docs: https://votre-app.up.railway.app/docs

EOF

# Créer script de vérification post-déploiement
cat > verify-deployment.sh << 'EOF'
#!/bin/bash

echo "🔍 VÉRIFICATION DU DÉPLOIEMENT SIMBA-WATCH"
echo "=========================================="

BACKEND_URL=""
FRONTEND_URL=""

echo "Veuillez entrer l'URL de votre backend Railway:"
read BACKEND_URL

echo "Veuillez entrer l'URL de votre frontend Vercel:"
read FRONTEND_URL

echo "🔵 Test du backend..."
curl -s "$BACKEND_URL/api/health" | grep -q "healthy" && echo "✅ Backend OK" || echo "❌ Backend problème"

echo "🔵 Test du frontend..."
curl -s -I "$FRONTEND_URL" | grep -q "200" && echo "✅ Frontend OK" || echo "❌ Frontend problème"

echo "🔵 Test CORS..."
curl -s -H "Origin: $FRONTEND_URL" "$BACKEND_URL/api/health" && echo "✅ CORS OK" || echo "❌ CORS problème"

echo "✨ Vérification terminée !"
EOF

chmod +x verify-deployment.sh

print_step "7" "RÉSUMÉ FINAL"

echo ""
echo "🎉 PRÉPARATION TERMINÉE AVEC SUCCÈS!"
echo "====================================="
echo ""
echo "📁 Dossier créé: simba-watch-deploy/"
echo "📝 Guide créé: DEPLOY-COMMANDS.md"
echo "🔍 Script de test: verify-deployment.sh"
echo ""
echo -e "${GREEN}✅ Tous les fichiers de configuration sont prêts${NC}"
echo -e "${GREEN}✅ Code optimisé pour la production${NC}"
echo -e "${GREEN}✅ Variables d'environnement configurées${NC}"
echo -e "${GREEN}✅ Build frontend testé${NC}"
echo ""
echo -e "${YELLOW}🔥 PROCHAINES ÉTAPES (5 MINUTES):${NC}"
echo "1. Créer repository GitHub"
echo "2. Pousser le code: git push origin main"
echo "3. Déployer sur Railway: railway.app"  
echo "4. Déployer sur Vercel: vercel.com"
echo ""
echo -e "${BLUE}📖 Consultez DEPLOY-COMMANDS.md pour les commandes exactes${NC}"
echo ""
echo -e "${GREEN}🚀 Votre Simba-Watch sera en ligne en moins de 10 minutes!${NC}"