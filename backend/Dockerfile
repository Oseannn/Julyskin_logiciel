# ============================================
# BUILD STAGE
# ============================================
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all necessary files for build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma ./prisma/
COPY src ./src

# Generate Prisma Client and build
RUN npx prisma generate
RUN npm run build

# Verify build succeeded
RUN ls -la dist/ && test -f dist/main.js || (echo "ERROR: Build failed - dist/main.js not found" && exit 1)

# ============================================
# PRODUCTION STAGE
# ============================================
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache openssl dumb-init

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
