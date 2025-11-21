-- OpenSchoolLibrary Multi-Tenant Database Schema
-- This schema supports multi-tenant architecture with org_id on all tables
-- 
-- IMPORTANT: For development/testing, RLS is DISABLED by default.
-- This allows the app to work with just the anon key (no service_role key needed).
-- For production, enable RLS and configure proper policies (see comments at end of file).
--
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (root of multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admins table (maps auth.users to organizations)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References auth.users
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- Books table (bibliographic metadata - shared across physical copies)
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL DEFAULT '{}',
    isbn TEXT,
    cover_url TEXT,
    metadata JSONB DEFAULT '{}', -- Additional fields: language, publication_year, publisher, pages, genre, reading_level, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Locations table (e.g., "Classroom A", "Library Shelf 3")
-- Use this to organize physical books within your library/school
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Copies table (physical book inventory - the actual books on your shelves)
-- Each copy represents one physical book that can be checked out
CREATE TABLE copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    barcode TEXT,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'lost', 'damaged')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Children table (students/readers with emoji IDs)
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    emoji_id TEXT NOT NULL,
    name TEXT,
    grade_or_class TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ, -- Soft delete
    UNIQUE(org_id, emoji_id) -- Emoji ID must be unique within org
);

-- Loans table (checkout/return transactions)
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    copy_id UUID NOT NULL REFERENCES copies(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    borrower_name TEXT,
    borrower_class TEXT,
    checked_out_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    returned_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reading journal table (book reviews/ratings by children)
CREATE TABLE reading_journal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    read_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_books_org_id ON books(org_id);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_deleted ON books(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_locations_org_id ON locations(org_id);
CREATE INDEX idx_locations_deleted ON locations(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_copies_org_id ON copies(org_id);
CREATE INDEX idx_copies_book_id ON copies(book_id);
CREATE INDEX idx_copies_status ON copies(status);
CREATE INDEX idx_copies_deleted ON copies(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_children_org_id ON children(org_id);
CREATE INDEX idx_children_emoji_id ON children(org_id, emoji_id);
CREATE INDEX idx_children_deleted ON children(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_loans_org_id ON loans(org_id);
CREATE INDEX idx_loans_copy_id ON loans(copy_id);
CREATE INDEX idx_loans_child_id ON loans(child_id);
CREATE INDEX idx_loans_returned ON loans(returned_at);
CREATE INDEX idx_reading_journal_org_id ON reading_journal(org_id);
CREATE INDEX idx_reading_journal_child_id ON reading_journal(child_id);
CREATE INDEX idx_admins_org_id ON admins(org_id);
CREATE INDEX idx_admins_user_id ON admins(user_id);

-- Row Level Security (RLS) Policies
-- TODO: Enable RLS on all tables and create policies based on auth.users and org membership

-- Example RLS policy for books (commented out - enable after setting up auth)
-- ALTER TABLE books ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view books in their org" ON books
--     FOR SELECT
--     USING (
--         org_id IN (
--             SELECT org_id FROM admins WHERE user_id = auth.uid()
--         )
--     );
-- 
-- CREATE POLICY "Admins can insert books in their org" ON books
--     FOR INSERT
--     WITH CHECK (
--         org_id IN (
--             SELECT org_id FROM admins WHERE user_id = auth.uid()
--         )
--     );
--
-- CREATE POLICY "Admins can update books in their org" ON books
--     FOR UPDATE
--     USING (
--         org_id IN (
--             SELECT org_id FROM admins WHERE user_id = auth.uid()
--         )
--     );
--
-- CREATE POLICY "Admins can delete books in their org" ON books
--     FOR DELETE
--     USING (
--         org_id IN (
--             SELECT org_id FROM admins WHERE user_id = auth.uid()
--         )
--     );

-- TODO: Repeat similar RLS policies for all other tables

-- Public access policy for reading_journal (by emoji_id)
-- ALTER TABLE reading_journal ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Anyone can view reading journal entries" ON reading_journal
--     FOR SELECT
--     USING (true);

-- Storage bucket for book covers (create via Supabase dashboard or SQL)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);

-- Storage policies (example - adjust as needed)
-- CREATE POLICY "Public can view book covers" ON storage.objects
--     FOR SELECT
--     USING (bucket_id = 'book-covers');
--
-- CREATE POLICY "Admins can upload book covers" ON storage.objects
--     FOR INSERT
--     WITH CHECK (
--         bucket_id = 'book-covers' AND
--         auth.uid() IN (SELECT user_id FROM admins)
--     );
