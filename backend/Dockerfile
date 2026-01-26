# ============================================
# BUILD STAGE
# ============================================
FROM node:18-alpine AS builder

# Install build dependencies and OpenSSL 3
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    python3 \
    make \
    g++

WORKDIR /app

# Copy dependency files (lockfile now exists!)
COPY package.json package-lock.json ./

# Install ALL dependencies using lockfile (deterministic, faster)
RUN npm ci

# Copy configuration files
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Verify build output exists
RUN echo "=== Verifying build output ===" && \
    ls -la dist/ && \
    test -f dist/main.js && \
    echo "✓ dist/main.js exists" || \
    (echo "✗ ERROR: dist/main.js not found!" && exit 1)

# ============================================
# PRODUCTION STAGE
# ============================================
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache openssl dumb-init

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies using lockfile
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy compiled application from builder
COPY --from=builder /app/dist ./dist

# Verify the main file exists in production image
RUN test -f dist/main.js || (echo "ERROR: dist/main.js missing in production image!" && exit 1)

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

USER nestjs

# Expose port
EXPOSE 4000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start command: run migrations then start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
