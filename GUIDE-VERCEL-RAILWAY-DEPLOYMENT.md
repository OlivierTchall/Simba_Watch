# Simba-Watch - Déploiement sur Vercel + Railway

## 🎯 **Instructions Étape par Étape**

### **ÉTAPE 1: Préparer GitHub (5 minutes)**

#### 1.1 Créer repository GitHub
1. Aller sur **github.com**
2. Cliquer **"New repository"**
3. Nom: `simba-watch`
4. Cocher **"Public"**
5. Cliquer **"Create repository"**

#### 1.2 Pousser le code (si pas encore fait)
```bash
# Dans votre dossier simba-watch
git init
git add .
git commit -m "Initial commit - Simba-Watch app"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/simba-watch.git
git push -u origin main
```

---

### **ÉTAPE 2: Déployer Backend sur Railway (10 minutes)**

#### 2.1 Créer compte Railway
1. Aller sur **railway.app**
2. Cliquer **"Login"**
3. Se connecter avec **GitHub**
4. Autoriser Railway à accéder à vos repositories

#### 2.2 Créer nouveau projet
1. Cliquer **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Choisir votre repository **"simba-watch"**
4. Railway va détecter automatiquement Python et FastAPI

#### 2.3 Configurer les variables d'environnement
1. Dans votre projet Railway, cliquer **"Variables"**
2. Ajouter ces variables une par une:

```env
NEWS_API_KEY=7cdbae1ef22b4adda9740958b0383f13
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAABVj3AEAAAAAmhiW9ldmhlJ64ANMCoU35THhqBs%3DkgmhbKcZ6ALLft36nJxj0Z6OFLLHjjSFYqrFcABaE2QOk3GTx2
JWT_SECRET=simba-watch-secret-key-2024
MONGO_URL=mongodb://mongo:27017
```

#### 2.4 Ajouter MongoDB
1. Dans le même projet, cliquer **"+ New"**
2. Sélectionner **"Database"**
3. Choisir **"Add MongoDB"**
4. Railway va créer une instance MongoDB automatiquement
5. La variable `MONGO_URL` sera automatiquement mise à jour

#### 2.5 Configurer le domaine backend
1. Dans l'onglet **"Settings"** de votre service backend
2. Section **"Domains"**
3. Cliquer **"Generate Domain"**
4. Copier l'URL générée (ex: `https://simba-watch-production-abc123.up.railway.app`)

---

### **ÉTAPE 3: Déployer Frontend sur Vercel (5 minutes)**

#### 3.1 Créer compte Vercel
1. Aller sur **vercel.com**
2. Cliquer **"Sign Up"**
3. Se connecter avec **GitHub**
4. Autoriser Vercel

#### 3.2 Importer projet
1. Dans dashboard Vercel, cliquer **"Add New Project"**
2. Sélectionner votre repository **"simba-watch"**
3. Cliquer **"Import"**

#### 3.3 Configurer le build
1. **Root Directory**: Laisser vide
2. **Build Command**: `cd frontend && npm run build`
3. **Output Directory**: `frontend/build`
4. **Install Command**: `cd frontend && npm install`

#### 3.4 Configurer variables d'environnement
1. Cliquer **"Environment Variables"**
2. Ajouter:
```env
Name: REACT_APP_BACKEND_URL
Value: https://votre-url-railway.up.railway.app
```
(Remplacer par l'URL Railway de l'étape 2.5)

#### 3.5 Déployer
1. Cliquer **"Deploy"**
2. Attendre 2-3 minutes
3. Votre app sera disponible à : `https://votre-app.vercel.app`

---

### **ÉTAPE 4: Configurer CORS (Important!)**

#### 4.1 Mettre à jour le backend
Dans Railway, aller dans **"Variables"** et ajouter:
```env
FRONTEND_URL=https://votre-app.vercel.app
```

Le code backend est déjà configuré pour accepter les requêtes cross-origin.

---

### **ÉTAPE 5: Tester l'Application**

#### 5.1 Vérifier backend
1. Aller sur votre URL Railway: `https://votre-backend.up.railway.app/api/health`
2. Vous devriez voir: `{"status":"healthy","service":"Simba-Watch API"}`

#### 5.2 Vérifier frontend
1. Aller sur votre URL Vercel: `https://votre-app.vercel.app`
2. Vous devriez voir la page de login Simba-Watch

#### 5.3 Test complet
1. Créer un compte utilisateur
2. Se connecter
3. Tester les modules de monitoring
4. Vérifier que les données s'affichent

---

## 🎉 **Félicitations!**

Votre application Simba-Watch est maintenant déployée et accessible partout dans le monde!

### **Vos URLs:**
- **Frontend**: `https://votre-app.vercel.app`
- **Backend**: `https://votre-backend.up.railway.app`
- **API Docs**: `https://votre-backend.up.railway.app/docs`

### **Fonctionnalités disponibles:**
✅ Monitoring technologique avec NewsAPI
✅ Monitoring des mentions Twitter
✅ Gestion des concurrents
✅ Tableau de bord avec statistiques
✅ Support multi-langues (Français/Anglais)
✅ Interface mobile responsive
✅ HTTPS automatique
✅ Certificats SSL gratuits

---

## 🔄 **Mises à jour automatiques**

Désormais, quand vous modifiez votre code:
1. **Poussez sur GitHub**: `git push origin main`
2. **Railway** redéploie automatiquement le backend
3. **Vercel** redéploie automatiquement le frontend

---

## 📊 **Monitoring & Limites**

### **Railway (Backend):**
- **500 heures/mois** gratuit (largement suffisant)
- **1GB RAM** inclus
- **1GB stockage** inclus
- **Monitoring** intégré

### **Vercel (Frontend):**
- **100 déploiements/mois** gratuit
- **100GB bande passante** gratuit
- **Domaine personnalisé** gratuit
- **Analytics** intégrées

---

## 🎯 **Prochaines étapes (Optionnelles)**

### **Domaine personnalisé:**
1. **Acheter domaine** (ex: OVH, Namecheap)
2. **Vercel**: Ajouter domaine dans Settings > Domains
3. **Configurer DNS** selon instructions Vercel

### **Monitoring avancé:**
1. **Railway**: Onglet "Metrics" pour performance
2. **Vercel**: Onglet "Analytics" pour usage
3. **Alerts** configurable si problème

### **Sauvegardes:**
1. **MongoDB Atlas** (upgrade gratuit possible)
2. **Backups automatiques** via Railway
3. **Code source** toujours sur GitHub

---

## 🆘 **Besoin d'aide?**

Si vous rencontrez un problème:
1. **Vérifier les logs** Railway/Vercel
2. **Tester les URLs** individuellement
3. **Vérifier variables d'environnement**
4. **Me contacter** pour assistance

**Votre application Simba-Watch est maintenant prête pour vos utilisateurs africains!** 🌍🎉