#!/bin/bash
set -e

echo "🔍 Verifying NestJS Build Configuration..."
echo ""

# Check required files
echo "✓ Checking required files..."
required_files=(
    "package.json"
    "tsconfig.json"
    "tsconfig.build.json"
    "nest-cli.json"
    "src/main.ts"
    "Dockerfile"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file exists"
    else
        echo "  ✗ $file MISSING!"
        exit 1
    fi
done

echo ""
echo "✓ Installing dependencies..."
npm ci

echo ""
echo "✓ Generating Prisma Client..."
npx prisma generate

echo ""
echo "✓ Building application..."
npm run build

echo ""
echo "✓ Verifying build output..."
if [ -f "dist/main.js" ]; then
    echo "  ✓ dist/main.js exists"
    echo "  ✓ File size: $(du -h dist/main.js | cut -f1)"
else
    echo "  ✗ dist/main.js NOT FOUND!"
    echo "  Contents of dist/:"
    ls -la dist/ || echo "  dist/ directory doesn't exist!"
    exit 1
fi

echo ""
echo "✓ Checking dist/ structure..."
ls -lah dist/

echo ""
echo "✅ All checks passed! Build is ready for deployment."
