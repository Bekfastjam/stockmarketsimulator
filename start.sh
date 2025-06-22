#!/bin/bash

echo "🚀 Starting Stock Market Simulator..."

# Check if we're in production mode
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Building for production..."
    npm run build
    echo "🏃 Starting production server..."
    npm run start
else
    echo "🔧 Starting development server..."
    npm run dev
fi 