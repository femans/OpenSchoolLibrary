# OpenSchoolLibrary - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Prerequisites Check
```bash
node --version  # Should be 20+
npm --version   # Should be 10+
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Supabase credentials
# Get these from: https://app.supabase.com/project/_/settings/api
nano .env  # or use your preferred editor
```

Required variables:
- `PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service_role key (keep secret!)

### 4. Setup Database

#### Option A: Supabase Dashboard (Easiest)
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and run `db/schema.sql`
3. Copy and run `migrations/seed-single-org.sql`

#### Option B: Supabase CLI
```bash
# Install CLI
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
cat db/schema.sql | supabase db execute
cat migrations/seed-single-org.sql | supabase db execute
```

### 5. Create Admin User

Start the dev server first:
```bash
npm run dev
```

Then:
1. Visit http://localhost:5173/login
2. Click "Sign Up" and create an account
3. Go to Supabase Dashboard → Authentication → Users
4. Copy your `user_id` (UUID)
5. Run this SQL in Supabase Dashboard → SQL Editor:

```sql
INSERT INTO admins (org_id, user_id, email, role)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'YOUR-USER-ID-HERE',  -- Paste your user_id
    'your-email@example.com',  -- Your email
    'superadmin'
);
```

### 6. Access the App

Visit http://localhost:5173 and log in!

## 🎯 What to Do First

1. **Add Books**: Go to Admin → Books → Add Book
2. **Add Locations**: Create locations in your database or via code
3. **Create Copies**: For each book, add physical copies
4. **Add Children**: Create anonymous reader profiles with emoji IDs
5. **Try Checkout**: Checkout a book to a student
6. **View Reading Journal**: Click "Show QR" on a child to see their public journal

## 📚 Sample Data

The seed script includes:
- 3 sample locations (Main Library, Classroom A, Classroom B)
- 3 sample books (classic children's literature)
- 2 sample children with emoji IDs

## 🐳 Docker Quick Start

```bash
# Create .env file first (see step 3 above)

# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Access at http://localhost:3000
```

## 🚨 Common Issues

### "Cannot connect to Supabase"
- Check your URL and keys in `.env`
- Ensure your Supabase project is active
- Check for typos in environment variables

### "Not authenticated" or "User not found"
- Make sure you created an admin record (step 5)
- Log out and log back in
- Check the `admins` table has your user

### "Books not loading"
- Check database schema is applied
- Verify `SINGLE_ORG_MODE=true` in `.env`
- Check browser console for errors

### Type errors during build
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check Node.js version (needs 20+)

## 📖 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture overview
- Review `db/schema.sql` to understand the data model
- Explore the code in `src/routes/` for page implementations
- Check `src/routes/api/` for API endpoint implementations

## 🆘 Need Help?

- Check the comprehensive README.md
- Review inline TODO comments in the code
- Open a GitHub issue
- Check Supabase documentation: https://supabase.com/docs

---

**You're all set! Happy library managing! 📚✨**
