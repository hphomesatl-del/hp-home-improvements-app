#!/bin/bash
set -e

echo "🚀 HP Home Improvements - Starting Backend"
echo "Environment: ${NODE_ENV:-production}"
echo "Time: $(date)"
echo ""

# Navigate to backend
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --only=production
fi

# Show startup info
echo "📊 Backend Information:"
echo "  Version: 0.1.0"
echo "  Framework: Express.js"
echo "  Port: ${PORT:-5555}"
echo "  Database: PostgreSQL"
echo "  API: hp-home-improvements"
echo ""

# Start the server
echo "⏳ Starting server..."
node server.js
