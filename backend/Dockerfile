FROM node:18-alpine AS builder

# Installer OpenSSL 3
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances (y compris dev pour le build)
RUN npm install

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Build l'application
RUN npm run build

# Stage de production
FROM node:18-alpine

# Installer OpenSSL 3
RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Installer uniquement les dépendances de production
RUN npm ci --only=production

EXPOSE 4000

# Commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
