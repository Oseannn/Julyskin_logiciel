# Architecture Jules Skin

## Vue d'ensemble

Jules Skin est une application web full-stack de gestion pour institut de beauté, construite avec une architecture moderne et scalable.

## Stack Technique

### Backend
- **Framework**: Nest.js (Node.js)
- **Architecture**: Modulaire, Clean Architecture
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Authentification**: JWT + Refresh Tokens
- **Autorisation**: RBAC (Role Based Access Control)
- **Validation**: class-validator, class-transformer
- **Sécurité**: bcrypt, rate limiting, CORS

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form

### Infrastructure
- **Conteneurisation**: Docker, Docker Compose
- **Déploiement Backend**: Railway
- **Déploiement Frontend**: Vercel
- **CI/CD**: GitHub Actions (recommandé)

## Architecture Backend

### Structure Modulaire

```
backend/src/
├── auth/              # Authentification & autorisation
│   ├── guards/        # JWT, Local, Roles guards
│   ├── strategies/    # Passport strategies
│   └── decorators/    # Custom decorators
├── users/             # Gestion utilisateurs
├── products/          # Gestion produits & stock
├── services/          # Gestion services/soins
├── clients/           # Gestion clients
├── categories/        # Catégories produits
├── invoices/          # Facturation
├── stats/             # Statistiques & analytics
├── settings/          # Paramètres application
└── prisma/            # Service Prisma global
```

### Principes Architecturaux

1. **Séparation des responsabilités**
   - Controllers: Gestion des requêtes HTTP
   - Services: Logique métier
   - DTOs: Validation des données
   - Guards: Sécurité et autorisation

2. **Clean Architecture**
   - Indépendance des frameworks
   - Testabilité
   - Indépendance de la base de données

3. **SOLID Principles**
   - Single Responsibility
   - Open/Closed
   - Dependency Injection

## Modèle de Données

### Entités Principales

**User**
- Gestion des comptes (Admin, Vendeuse)
- Authentification
- Historique des actions

**Product**
- Catalogue produits
- Gestion stock
- Prix achat/vente
- Alertes stock bas

**Service**
- Prestations/soins
- Durée et tarification
- Pas de gestion stock

**Client**
- Base clients
- Historique achats
- Coordonnées

**Invoice**
- Facturation
- Numérotation automatique
- Statuts (Draft, Validated, Cancelled)
- Calcul TVA automatique

**InvoiceItem**
- Lignes de facture
- Snapshot des prix
- Produits ou services

**StockMovement**
- Traçabilité stock
- Types: IN, OUT, ADJUSTMENT
- Historique complet

**Category**
- Organisation produits
- Hiérarchie simple

**Settings**
- Configuration globale
- Paramètres boutique
- TVA par défaut

### Relations

```
User 1---* Invoice
User 1---* StockMovement
Client 1---* Invoice
Invoice 1---* InvoiceItem
Product 1---* InvoiceItem
Service 1---* InvoiceItem
Product 1---* StockMovement
Category 1---* Product
```

## Sécurité

### Authentification

1. **Login**
   - Email + Password
   - Hash bcrypt (10 rounds)
   - Génération JWT access token (15min)
   - Génération refresh token (7 jours)

2. **Refresh Token**
   - Stocké en base de données
   - Rotation automatique
   - Révocation possible

3. **Logout**
   - Suppression refresh token
   - Invalidation session

### Autorisation (RBAC)

**Rôle ADMIN**
- Accès complet
- Gestion utilisateurs
- Gestion produits/services
- Ajustement stock
- Statistiques globales
- Configuration

**Rôle VENDEUSE**
- Lecture produits/services (sans prix d'achat)
- Création factures
- Gestion clients
- Consultation propres ventes uniquement
- Lecture stock (sans modification)

### Protection des Routes

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```

## Gestion du Stock

### Flux

1. **Vente (Validation Facture)**
   - Décrémentation automatique
   - Création StockMovement OUT
   - Vérification stock disponible
   - Transaction atomique

2. **Ajustement Manuel (Admin)**
   - Ajout/retrait stock
   - Création StockMovement IN/ADJUSTMENT
   - Raison obligatoire

3. **Alertes**
   - Seuil configurable par produit
   - Endpoint dédié pour produits en alerte

## Facturation

### Workflow

1. **Création (Draft)**
   - Sélection client
   - Ajout produits/services
   - Calcul automatique (subtotal, TVA, total)
   - Numérotation automatique
   - Stock non impacté

2. **Validation**
   - Vérification stock disponible
   - Décrémentation stock
   - Création mouvements stock
   - Facture immuable
   - Transaction atomique

3. **Snapshot Prix**
   - Prix figés au moment de la vente
   - Indépendant des modifications futures

## API Endpoints

### Authentification
```
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
```

### Utilisateurs (Admin)
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
PATCH  /api/users/:id/toggle-active
```

### Produits
```
GET    /api/products
POST   /api/products (Admin)
GET    /api/products/:id
PATCH  /api/products/:id (Admin)
POST   /api/products/:id/adjust-stock (Admin)
GET    /api/products/low-stock (Admin)
```

### Services
```
GET    /api/services
POST   /api/services (Admin)
GET    /api/services/:id
PATCH  /api/services/:id (Admin)
```

### Clients
```
GET    /api/clients?search=
POST   /api/clients
GET    /api/clients/:id
PATCH  /api/clients/:id
```

### Factures
```
GET    /api/invoices?startDate=&endDate=&status=
POST   /api/invoices
GET    /api/invoices/:id
POST   /api/invoices/:id/validate
```

### Statistiques (Admin)
```
GET    /api/stats/dashboard?startDate=&endDate=
```

### Catégories
```
GET    /api/categories
POST   /api/categories (Admin)
GET    /api/categories/:id
PATCH  /api/categories/:id (Admin)
```

### Paramètres (Admin)
```
GET    /api/settings
PATCH  /api/settings
```

## Frontend Architecture

### Structure

```
frontend/src/
├── app/
│   ├── login/         # Page connexion
│   ├── dashboard/     # Pages dashboard
│   │   ├── products/
│   │   ├── services/
│   │   ├── clients/
│   │   ├── invoices/
│   │   ├── users/
│   │   ├── stats/
│   │   └── settings/
│   └── layout.tsx
├── components/        # Composants réutilisables
├── lib/              # Utilitaires
│   └── api.ts        # Client API Axios
└── store/            # State management
    └── authStore.ts  # Store authentification
```

### State Management

- **Zustand** pour l'état global
- **React Hook Form** pour les formulaires
- **Local state** pour l'état des composants

### Routing

- **App Router** Next.js 14
- Routes protégées par middleware
- Redirection automatique si non authentifié

## Déploiement

### Backend (Railway)

1. Créer projet Railway
2. Ajouter PostgreSQL
3. Connecter repository
4. Variables d'environnement :
   ```
   DATABASE_URL
   JWT_SECRET
   JWT_REFRESH_SECRET
   FRONTEND_URL
   ```
5. Railway détecte automatiquement Nest.js

### Frontend (Vercel)

1. Importer projet
2. Root Directory: `frontend`
3. Variables d'environnement :
   ```
   NEXT_PUBLIC_API_URL
   ```
4. Déploiement automatique

### Migrations Prisma

```bash
# Développement
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

## Évolutions Futures (SaaS-Ready)

1. **Multi-tenancy**
   - Ajout `tenantId` sur toutes les entités
   - Isolation des données par boutique
   - Gestion abonnements

2. **Paiements en ligne**
   - Intégration Stripe
   - Gestion abonnements
   - Facturation récurrente

3. **Notifications**
   - Email (SendGrid)
   - SMS (Twilio)
   - Push notifications

4. **Rapports avancés**
   - Export Excel/PDF
   - Graphiques interactifs
   - Prévisions IA

5. **API publique**
   - Documentation OpenAPI
   - Rate limiting par client
   - Webhooks

6. **Mobile**
   - Application React Native
   - Synchronisation offline
   - Scanner codes-barres

## Bonnes Pratiques

### Code Quality

- TypeScript strict mode
- ESLint + Prettier
- Tests unitaires (Jest)
- Tests E2E (recommandé)

### Sécurité

- Validation stricte des entrées
- Sanitization des données
- Rate limiting
- HTTPS obligatoire en production
- Secrets dans variables d'environnement

### Performance

- Indexation base de données
- Pagination des listes
- Cache Redis (recommandé)
- CDN pour assets statiques

### Monitoring

- Logs structurés
- Error tracking (Sentry recommandé)
- Métriques performance
- Alertes automatiques
