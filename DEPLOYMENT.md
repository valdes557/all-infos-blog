# Guide de Déploiement - All Infos Blog

## 🚀 Déployer le Backend sur Render

### Étapes :

1. **Créer un compte sur [Render](https://render.com)**

2. **Créer un nouveau Web Service**
   - Cliquez sur "New" → "Web Service"
   - Connectez votre dépôt GitHub `valdes557/all-infos-blog`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

3. **Configurer les variables d'environnement** (Environment → Add Environment Variable) :
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog_db
   SECRET_ACCESS_KEY=votre_clé_secrète_jwt
   AWS_ACCESS_KEY=votre_clé_aws
   AWS_SECRET_ACCESS_KEY=votre_secret_aws
   AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE=1
   EMAIL_USER=votre_email@gmail.com
   EMAIL_PASS=votre_mot_de_passe_app
   FRONTEND_URL=https://votre-app.vercel.app
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
   ```
   > **Note :** Pour `FIREBASE_SERVICE_ACCOUNT`, copiez le contenu complet de votre fichier JSON Firebase en une seule ligne.

4. **Déployer** - Render déploiera automatiquement

5. **Copier l'URL** du service (ex: `https://all-infos-api.onrender.com`)

---

## 🌐 Déployer le Frontend sur Vercel

### Étapes :

1. **Créer un compte sur [Vercel](https://vercel.com)**

2. **Importer le projet**
   - Cliquez sur "Add New" → "Project"
   - Importez `valdes557/all-infos-blog`
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite

3. **Configurer les variables d'environnement** :
   ```
   VITE_SERVER_DOMAIN=https://all-infos-api.onrender.com
   ```
   *(Utilisez l'URL de votre service Render)*

4. **Déployer** - Vercel déploiera automatiquement

---

## 🔄 Mises à jour automatiques

Après la configuration initiale, chaque `git push` vers la branche `master` déclenchera automatiquement un nouveau déploiement sur Vercel et Render.

```bash
git add -A
git commit -m "Votre message"
git push
```

---

## 📋 Checklist avant déploiement

- [ ] MongoDB Atlas configuré avec une base de données cloud
- [ ] Bucket AWS S3 configuré pour les images
- [ ] Compte email configuré pour les notifications
- [ ] Fichiers Firebase JSON uploadés sur Render (si nécessaire)

---

## 🔐 Base de données MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créez un cluster gratuit (M0)
3. Créez un utilisateur de base de données
4. Autorisez les IPs (0.0.0.0/0 pour Render)
5. Copiez la chaîne de connexion

Format: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/blog_db`
