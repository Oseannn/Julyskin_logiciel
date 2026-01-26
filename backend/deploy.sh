#!/bin/sh
set -e

echo "🚀 Starting deployment..."

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Run seed
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Deployment complete!"
