#!/bin/bash
set -e

echo "🔄 Resetting database..."

# Drop all tables and types
npx prisma migrate reset --force --skip-seed

echo "✅ Database reset complete"
echo "🌱 Running migrations..."

# Apply migrations
npx prisma migrate deploy

echo "✅ Migrations applied"
echo "🌱 Seeding database..."

# Seed database
node prisma/seed.js

echo "✅ Database seeded successfully!"
