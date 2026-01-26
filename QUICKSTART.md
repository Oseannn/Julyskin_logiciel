# Démarrage Rapide - Jules Skin

## Installation en 5 minutes

### 1. Prérequis

```bash
node --version  # v18 ou supérieur
docker --version
```

### 2. Démarrer avec Docker

```bash
# Depuis la racine du projet
docker-compose up -d
```

Cela démarre :
- PostgreSQL sur le port 5432
- Backend API sur le port 4000
- Frontend sur le port 3000

### 3. Initialiser la Base de Données (première fois)

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 4. Accéder à l'Application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:4000/api

### 5. Se Connecter

**Compte Admin**
- Email : `admin@julesskin.com`
- Mot de passe : `Admin123!`

**Compte Vendeuse**
- Email : `vendeuse@julesskin.com`
- Mot de passe : `Vendeuse123!`

## Commandes Utiles

### Backend

```bash
cd backend

# Développement
npm run start:dev

# Prisma Studio (interface graphique DB)
npx prisma studio

# Créer une migration
npx prisma migrate dev --name nom_migration
```

### Frontend

```bash
cd frontend

# Développement
npm run dev

# Build production
npm run build
```

### Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

## Structure du Projet

```
jules-skin/
├── backend/              # API Nest.js
│   ├── prisma/          # Schéma et migrations
│   └── src/             # Code source
├── frontend/            # Application Next.js
│   └── src/             # Code source
└── docs/               # Documentation
```

## Fonctionnalités Principales

### Pour Admin
- ✅ Gestion complète des utilisateurs
- ✅ Gestion produits avec stock
- ✅ Gestion services
- ✅ Statistiques et analytics
- ✅ Configuration globale

### Pour Vendeuse
- ✅ Consultation produits/services
- ✅ Création de factures
- ✅ Gestion clients
- ✅ Consultation de ses propres ventes

## Problèmes Courants

### Port déjà utilisé

```bash
# Trouver le processus utilisant le port 3000
lsof -i :3000
# Tuer le processus
kill -9 <PID>
```

### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est démarré
docker-compose ps

# Redémarrer PostgreSQL
docker-compose restart postgres
```

### Erreur Prisma

```bash
cd backend

# Régénérer le client
npx prisma generate

# Réinitialiser la base (⚠️ supprime toutes les données)
npx prisma migrate reset
```

## Support

- 📖 Documentation complète : `/docs`
- 💬 Questions : contact@julesskin.com
