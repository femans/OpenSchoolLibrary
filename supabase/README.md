# OpenSchoolLibrary - Supabase Local Development

This directory is used by Supabase CLI for local development.

## Setup Local Supabase

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Initialize (already done if this file exists):

```bash
supabase init
```

3. Start local Supabase:

```bash
supabase start
```

4. This will provide local credentials:

- API URL: http://localhost:54321
- Anon key: (will be displayed)
- Service role key: (will be displayed)

5. Apply migrations:

```bash
supabase db reset  # Applies all migrations
```

## Useful Commands

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (apply migrations)
supabase db reset

# Create new migration
supabase migration new migration_name

# Link to remote project
supabase link --project-ref your-project-ref

# Push local changes to remote
supabase db push

# Pull remote changes to local
supabase db pull
```

## Local Development URLs

- Studio: http://localhost:54323
- API: http://localhost:54321
- Database: postgresql://postgres:postgres@localhost:54322/postgres
