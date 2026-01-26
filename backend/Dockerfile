FROM node:18-alpine

# Installer OpenSSL 3
RUN apk add --no-cache openssl openssl-dev

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm install

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code
COPY . .

# Build l'application
RUN npm run build

EXPOSE 4000

# Commande de démarrage
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
