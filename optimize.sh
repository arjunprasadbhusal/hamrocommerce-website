#!/bin/bash

# Laravel Backend Optimization Commands
echo "🚀 Starting Laravel Backend Optimization..."

cd Laravel

# Apply database migrations (includes performance indexes)
echo "📊 Running database migrations..."
php artisan migrate

# Clear all caches
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
echo "⚡ Optimizing for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Install dependencies if needed
echo "📦 Checking composer dependencies..."
composer install --optimize-autoloader --no-dev

echo "✅ Laravel backend optimization complete!"

cd ..

# React Frontend Optimization
echo "🎨 Starting React Frontend Optimization..."

cd hamro-commerce

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build optimized production bundle
echo "🔨 Building optimized production bundle..."
npm run build

# Optional: Preview the build
echo "👀 To preview the build, run: npm run preview"

echo "✅ React frontend optimization complete!"

cd ..

echo ""
echo "✅ ALL OPTIMIZATIONS COMPLETE! 🎉"
echo ""
echo "Performance improvements applied:"
echo "  ✅ Database indexes added"
echo "  ✅ API response caching enabled"
echo "  ✅ Query optimization with eager loading"
echo "  ✅ Frontend code splitting & lazy loading"
echo "  ✅ Component memoization"
echo "  ✅ Build optimization"
echo ""
echo "Next steps:"
echo "  1. Test the application locally"
echo "  2. Run performance tests (Lighthouse)"
echo "  3. Deploy to production"
echo "  4. Monitor performance metrics"
echo ""
echo "For detailed information, see:"
echo "  - QUICK_START_OPTIMIZATIONS.md"
echo "  - PERFORMANCE_OPTIMIZATION.md"
