#!/bin/bash

# OpenSchoolLibrary - Setup Script for Single-Org Mode

set -e

echo "🚀 OpenSchoolLibrary Setup - Single-Org Mode"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your Supabase credentials before continuing!"
    echo ""
    exit 1
fi

# Check if Supabase credentials are set
if grep -q "your-project.supabase.co" .env; then
    echo "⚠️  Please update .env with your actual Supabase credentials!"
    echo ""
    exit 1
fi

echo "✅ Environment file configured"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Install it with:"
    echo "   npm install -g supabase"
    echo ""
    echo "Then run the database setup manually:"
    echo "   1. supabase init"
    echo "   2. supabase link --project-ref YOUR_PROJECT_REF"
    echo "   3. Apply db/schema.sql via Supabase Dashboard SQL Editor"
    echo "   4. Apply migrations/seed-single-org.sql via Supabase Dashboard"
    echo ""
else
    echo "✅ Supabase CLI found"
    echo ""
    
    read -p "Do you want to apply database migrations now? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📊 Applying database schema..."
        # Note: This assumes you've already linked your Supabase project
        # If not, run: supabase link --project-ref YOUR_PROJECT_REF
        
        echo "⚠️  Make sure you've run: supabase link --project-ref YOUR_PROJECT_REF"
        read -p "Have you linked your Supabase project? (y/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Applying schema..."
            # Apply main schema
            cat db/schema.sql | supabase db execute
            
            echo "Seeding single-org data..."
            cat migrations/seed-single-org.sql | supabase db execute
            
            echo "✅ Database setup complete!"
            echo ""
        fi
    fi
fi

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Create an admin user:"
echo "   - Visit http://localhost:5173/login"
echo "   - Sign up with your email"
echo "   - Get your user_id from Supabase Dashboard → Authentication → Users"
echo "   - Run this SQL in Supabase Dashboard → SQL Editor:"
echo ""
echo "   INSERT INTO admins (org_id, user_id, email, role)"
echo "   VALUES ("
echo "       '00000000-0000-0000-0000-000000000000',"
echo "       'YOUR-USER-ID-HERE',"
echo "       'your-email@example.com',"
echo "       'superadmin'"
echo "   );"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Visit http://localhost:5173"
echo ""
echo "For more information, see README.md"
echo ""
