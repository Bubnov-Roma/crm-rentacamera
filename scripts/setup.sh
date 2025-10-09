#!/bin/bash

echo  "🚀 Setting up CRM Rentacamera project..."

# Install pnpm if not exists
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup database
echo "🗄️ Setting up database..."
cd packages/database
pnpm db:generate
cd ../..

# Build packages
echo "🔨 Building packages..."
pnpm build

# Final message
echo "✅ Setup completed! Run 'pnpm dev' to start development."
echo "🎯 To start development, run: pnpm dev"