# Guide de Déploiement

## 🚂 Railway (Backend)

### 1. Créer un nouveau projet Railway
1. Va sur [railway.app](https://railway.app)
2. Clique sur "New Project"
3. Sélectionne "Deploy from GitHub repo"
4. Choisis le repo `Julyskin_logiciel`
5. Sélectionne le dossier `backend`

### 2. Ajouter PostgreSQL
1. Dans ton projet Railway, clique sur "+ New"
2. Sélectionne "Database" → "PostgreSQL"
3. Railway va créer automatiquement la base de données

### 3. Configurer les variables d'environnement
Dans les settings du service backend, ajoute:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=julesskin-secret-key-2026-change-me
JWT_REFRESH_SECRET=julesskin-refresh-secret-key-2026-change-me
PORT=4000
```

**Note**: Railway va automatiquement remplacer `${{Postgres.DATABASE_URL}}` par l'URL de ta base de données.

### 4. Déployer
- Railway va automatiquement déployer le backend
- Les migrations Prisma vont s'exécuter automatiquement
- Le seed va créer les données de test

### 5. Récupérer l'URL du backend
1. Va dans les settings du service backend
2. Copie l'URL publique (ex: `https://julyskinlogiciel-production.up.railway.app`)
3. Tu en auras besoin pour Vercel

---

## ▲ Vercel (Frontend)

### 1. Importer le projet
1. Va sur [vercel.com](https://vercel.com)
2. Clique sur "Add New..." → "Project"
3. Importe le repo `Julyskin_logiciel`

### 2. Configurer le projet
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3. Configurer les variables d'environnement
Dans les settings du projet Vercel, ajoute:

```
NEXT_PUBLIC_API_URL=https://TON-URL-RAILWAY.up.railway.app/api
```

**Remplace** `TON-URL-RAILWAY` par l'URL que tu as copiée depuis Railway.

### 4. Déployer
- Clique sur "Deploy"
- Vercel va build et déployer automatiquement

### 5. Tester
1. Va sur l'URL Vercel (ex: `https://julyskin.vercel.app`)
2. Connecte-toi avec:
   - **Admin**: admin@julesskin.com / Admin123!
   - **Vendeuse**: vendeuse@julesskin.com / Vendeuse123!

---

## 🔄 Redéploiements automatiques

Chaque fois que tu push sur GitHub:
- Railway redéploie automatiquement le backend
- Vercel redéploie automatiquement le frontend

---

## ✅ Vérifications

### Backend (Railway)
```bash
curl https://TON-URL-RAILWAY.up.railway.app/api/settings
```

Tu devrais voir les paramètres de la boutique.

### Frontend (Vercel)
Ouvre l'URL Vercel dans ton navigateur et teste la connexion.

---

## 🐛 Dépannage

### Backend ne démarre pas
1. Vérifie les logs dans Railway
2. Assure-toi que `DATABASE_URL` est bien configuré
3. Vérifie que PostgreSQL est bien connecté

### Frontend ne se connecte pas au backend
1. Vérifie que `NEXT_PUBLIC_API_URL` est correct dans Vercel
2. Vérifie que l'URL Railway est accessible
3. Vérifie les logs du backend pour voir les requêtes CORS

### Erreur 401 (Unauthorized)
- Les tokens JWT expirent après 15 minutes
- Déconnecte-toi et reconnecte-toi

---

## 📝 Notes importantes

1. **Sécurité**: Change les secrets JWT en production
2. **Base de données**: Railway offre 500 MB gratuits
3. **CORS**: Le backend accepte automatiquement les domaines `*.vercel.app`
4. **Seed**: Les données de test sont créées automatiquement au premier déploiement
