# OpenSchoolLibrary - Database Migrations

This directory contains database migration files for OpenSchoolLibrary.

## Files

- `seed-single-org.sql` - Seeds a default organization and sample data for single-org mode

## Usage

### With Supabase CLI

```bash
# Apply all migrations
supabase db reset

# Or apply specific migration
supabase db execute --file migrations/seed-single-org.sql
```

### Manual Application

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of the migration file
3. Execute the SQL

## Creating New Migrations

```bash
# Create a new migration file
supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/
# Then apply it:
supabase db reset
```

## Single-Org Setup

The `seed-single-org.sql` file creates:

- A default organization with ID `00000000-0000-0000-0000-000000000000`
- Sample locations (Main Library, Classroom A, Classroom B)
- Sample books for testing
- Sample children for testing

**Important**: After running this, you must manually add an admin user. See the README.md for instructions.
