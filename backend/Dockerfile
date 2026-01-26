FROM node:18-alpine AS builder

# Installer OpenSSL 3 et les outils de build
RUN apk add --no-cache openssl openssl-dev python3 make g++

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances (y compris dev pour le build)
RUN npm install

# Générer le client Prisma
RUN npx prisma generate

# Copier le code source
COPY src ./src

# Build l'application et vérifier que dist existe
RUN npm run build && ls -la dist/

# Stage de production
FROM node:18-alpine

# Installer OpenSSL 3
RUN apk add --no-cache openssl

WORKDIR /app

# Copier package.json et prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma/

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier le code compilé et le client Prisma généré
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Générer le client Prisma dans l'image de production
RUN npx prisma generate

EXPOSE 4000

# Commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
