# Jules Skin - Système de Gestion

Application de gestion pour institut de beauté.

## Stack
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js 14
- Auth: JWT + RBAC

## Installation

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## Comptes par défaut
- Admin: admin@julesskin.com / Admin123!
- Vendeuse: vendeuse@julesskin.com / Vendeuse123!
