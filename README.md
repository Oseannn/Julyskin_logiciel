# Jules Skin - Système de Gestion

Application web complète de gestion pour institut de beauté et boutique cosmétique.

## Stack Technique

- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Backend**: Nest.js (Architecture modulaire)
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Conteneurisation**: Docker & Docker Compose
- **Authentification**: JWT + Refresh Tokens
- **Autorisation**: RBAC (Role Based Access Control)

## Installation Locale

### Prérequis
- Node.js 18+
- Docker & Docker Compose

### Démarrage Rapide

```bash
# Démarrer avec Docker
docker-compose up -d

# Appliquer les migrations (première fois)
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Accès

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **PostgreSQL**: localhost:5432

### Comptes par défaut

**Admin**
- Email: admin@julesskin.com
- Password: Admin123!

**Vendeuse**
- Email: vendeuse@julesskin.com
- Password: Vendeuse123!

## Développement Manuel

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Modules Fonctionnels

- **Authentification** - JWT + Refresh tokens, RBAC
- **Produits** - CRUD, gestion stock, alertes
- **Services** - CRUD soins et prestations
- **Clients** - Gestion base clients
- **Facturation** - Création, export PDF, numérotation auto
- **Ventes** - Historique, suivi, statistiques
- **Statistiques** - Dashboard admin, KPIs

## Permissions

### Admin
- Gestion complète utilisateurs
- CRUD produits/services avec prix d'achat
- Ajustement stock manuel
- Toutes les factures
- Statistiques globales
- Configuration

### Vendeuse
- Lecture produits/services (sans prix d'achat)
- Création factures
- Gestion clients
- Ses propres ventes uniquement
- Lecture stock

## Documentation

- `docs/ARCHITECTURE.md` - Architecture détaillée
- `docs/API.md` - Documentation API
- `docs/DEPLOYMENT.md` - Guide déploiement
- `QUICKSTART.md` - Guide démarrage rapide

## Déploiement Production

### Backend (Railway)
1. Créer projet Railway + PostgreSQL
2. Connecter repository GitHub
3. Configurer variables d'environnement
4. Déployer automatiquement

### Frontend (Vercel)
1. Importer projet depuis GitHub
2. Root Directory: `frontend`
3. Ajouter `NEXT_PUBLIC_API_URL`
4. Déployer automatiquement

Voir `docs/DEPLOYMENT.md` pour les détails.

## Support

Pour toute question: contact@julesskin.com
