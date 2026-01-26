# Guide de Déploiement - Jules Skin

## Prérequis

- Compte GitHub
- Compte Railway (backend + database)
- Compte Vercel (frontend)
- Node.js 18+ installé localement

## 1. Préparation du Code

### 1.1 Repository Git

```bash
# Initialiser le repository
git init
git add .
git commit -m "Initial commit"

# Créer repository sur GitHub et pousser
git remote add origin https://github.com/votre-username/jules-skin.git
git push -u origin main
```

### 1.2 Variables d'Environnement

Créer les fichiers `.env` à partir des `.env.example` :

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

## 2. Déploiement Backend (Railway)

### 2.1 Créer un Projet Railway

1. Aller sur [railway.app](https://railway.app)
2. Se connecter avec GitHub
3. Cliquer sur "New Project"
4. Sélectionner "Deploy from GitHub repo"
5. Choisir le repository `jules-skin`

### 2.2 Ajouter PostgreSQL

1. Dans le projet Railway, cliquer sur "New"
2. Sélectionner "Database" → "PostgreSQL"
3. Railway crée automatiquement la base de données
4. Noter l'URL de connexion (disponible dans les variables)

### 2.3 Configurer le Service Backend

1. Cliquer sur "New" → "GitHub Repo"
2. Sélectionner le repository
3. Dans "Settings" :
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`

### 2.4 Variables d'Environnement Backend

Dans Railway, aller dans l'onglet "Variables" et ajouter :

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
JWT_REFRESH_SECRET=votre-secret-refresh-super-securise-changez-moi
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://votre-app.vercel.app
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

**Important** : 
- `${{Postgres.DATABASE_URL}}` est automatiquement remplacé par Railway
- Générer des secrets forts pour JWT :
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### 2.5 Déployer

1. Railway détecte automatiquement les changements
2. Le déploiement démarre automatiquement
3. Attendre la fin du build (2-3 minutes)
4. Noter l'URL publique (ex: `https://jules-skin-backend.up.railway.app`)

### 2.6 Seed Initial (Optionnel)

Pour créer les données initiales :

```bash
# Depuis votre machine locale
DATABASE_URL="postgresql://..." npm run prisma:seed
```

Ou via Railway CLI :

```bash
railway run npm run prisma:seed
```

## 3. Déploiement Frontend (Vercel)

### 3.1 Importer le Projet

1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer sur "Add New" → "Project"
4. Importer le repository `jules-skin`

### 3.2 Configuration du Projet

Dans les paramètres d'import :

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (par défaut)
- **Output Directory**: `.next` (par défaut)

### 3.3 Variables d'Environnement Frontend

Ajouter dans Vercel :

```env
NEXT_PUBLIC_API_URL=https://jules-skin-backend.up.railway.app/api
```

**Important** : Utiliser l'URL Railway du backend (sans trailing slash)

### 3.4 Déployer

1. Cliquer sur "Deploy"
2. Attendre la fin du build (1-2 minutes)
3. Noter l'URL de production (ex: `https://jules-skin.vercel.app`)

### 3.5 Mettre à Jour le Backend

Retourner sur Railway et mettre à jour la variable :

```env
FRONTEND_URL=https://jules-skin.vercel.app
```

Redéployer le backend pour appliquer les changements CORS.

## 4. Configuration DNS (Optionnel)

### 4.1 Domaine Personnalisé Backend

Dans Railway :
1. Aller dans "Settings" → "Domains"
2. Ajouter un domaine personnalisé
3. Configurer les DNS selon les instructions

### 4.2 Domaine Personnalisé Frontend

Dans Vercel :
1. Aller dans "Settings" → "Domains"
2. Ajouter un domaine personnalisé
3. Configurer les DNS selon les instructions

## 5. Migrations de Base de Données

### 5.1 Développement Local

```bash
cd backend
npx prisma migrate dev --name nom_migration
```

### 5.2 Production

Les migrations sont appliquées automatiquement au déploiement via :

```bash
npx prisma migrate deploy
```

Configuré dans le "Start Command" de Railway.

### 5.3 Rollback (Si Nécessaire)

```bash
# Via Railway CLI
railway run npx prisma migrate resolve --rolled-back nom_migration
```

## 6. Monitoring et Logs

### 6.1 Railway

- Logs en temps réel dans l'interface
- Métriques CPU/RAM/Network
- Alertes configurables

### 6.2 Vercel

- Logs de build et runtime
- Analytics intégrés
- Web Vitals

### 6.3 Outils Recommandés

**Monitoring d'Erreurs**
- [Sentry](https://sentry.io) - Tracking d'erreurs
- Configuration :
  ```bash
  npm install @sentry/nextjs @sentry/node
  ```

**Logs Structurés**
- [Logtail](https://logtail.com)
- [Datadog](https://www.datadoghq.com)

**Uptime Monitoring**
- [UptimeRobot](https://uptimerobot.com)
- [Pingdom](https://www.pingdom.com)

## 7. CI/CD avec GitHub Actions

### 7.1 Créer le Workflow

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run lint
        run: cd frontend && npm run lint
```

### 7.2 Déploiement Automatique

Railway et Vercel déploient automatiquement à chaque push sur `main`.

## 8. Sécurité en Production

### 8.1 Checklist

- [ ] Secrets JWT forts et uniques
- [ ] HTTPS activé (automatique sur Railway/Vercel)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Variables d'environnement sécurisées
- [ ] Logs ne contiennent pas de données sensibles
- [ ] Base de données avec backup automatique
- [ ] Mots de passe admin changés

### 8.2 Backups Base de Données

Railway propose des backups automatiques. Pour un backup manuel :

```bash
# Via Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql
```

### 8.3 Rotation des Secrets

Changer régulièrement :
- JWT secrets
- Mots de passe admin
- Clés API tierces

## 9. Scaling

### 9.1 Backend (Railway)

- Scaling vertical automatique
- Pour scaling horizontal : utiliser Railway Pro
- Ajouter Redis pour cache (recommandé)

### 9.2 Frontend (Vercel)

- CDN global automatique
- Scaling automatique
- Edge Functions disponibles

### 9.3 Base de Données

- Railway : upgrade vers plan supérieur
- Alternative : [Supabase](https://supabase.com), [Neon](https://neon.tech)

## 10. Coûts Estimés

### Développement (Gratuit)

- Railway : Plan gratuit (500h/mois)
- Vercel : Plan gratuit (100GB bandwidth)
- PostgreSQL : Inclus dans Railway

### Production (Petit Volume)

- Railway Pro : ~$5-20/mois
- Vercel Pro : $20/mois (optionnel)
- Total : ~$25-40/mois

### Production (Volume Moyen)

- Railway : ~$50/mois
- Vercel Pro : $20/mois
- Monitoring : ~$10/mois
- Total : ~$80/mois

## 11. Troubleshooting

### Erreur de Migration Prisma

```bash
# Réinitialiser les migrations
railway run npx prisma migrate reset
railway run npx prisma migrate deploy
railway run npm run prisma:seed
```

### Erreur CORS

Vérifier que `FRONTEND_URL` dans Railway correspond exactement à l'URL Vercel.

### Erreur 502 Backend

- Vérifier les logs Railway
- Vérifier que le port est bien 4000
- Vérifier que `DATABASE_URL` est correcte

### Build Frontend Échoue

- Vérifier que `NEXT_PUBLIC_API_URL` est définie
- Vérifier les logs de build Vercel
- Tester le build localement : `npm run build`

## 12. Maintenance

### Mises à Jour

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

### Monitoring Régulier

- Vérifier les logs quotidiennement
- Surveiller les métriques de performance
- Tester les fonctionnalités critiques
- Vérifier les backups

## Support

Pour toute question :
- Documentation : `/docs`
- Issues GitHub : `https://github.com/votre-username/jules-skin/issues`
- Email : contact@julesskin.com
