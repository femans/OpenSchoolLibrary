-- Seed script for single-org mode
-- Creates a default organization and admin user for private Docker deployments

-- Insert default organization
INSERT INTO organizations (id, name, settings)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'My School Library',
    '{"single_org_mode": true}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- TODO: After creating your first admin user via Supabase Auth, add them to the admins table:
-- 1. Sign up a user via the login page or Supabase dashboard
-- 2. Copy their user_id from auth.users
-- 3. Run this query with their actual user_id and email:
--
-- INSERT INTO admins (org_id, user_id, email, role)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     'YOUR-USER-ID-HERE',
--     'admin@example.com',
--     'superadmin'
-- );

-- Sample data (optional - for testing)

-- Sample locations
INSERT INTO locations (org_id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000000', 'Main Library', 'Primary library location'),
    ('00000000-0000-0000-0000-000000000000', 'Classroom A', 'Classroom A book corner'),
    ('00000000-0000-0000-0000-000000000000', 'Classroom B', 'Classroom B reading area')
ON CONFLICT DO NOTHING;

-- Sample books
INSERT INTO books (org_id, title, authors, isbn) VALUES
    ('00000000-0000-0000-0000-000000000000', 'The Very Hungry Caterpillar', ARRAY['Eric Carle'], '9780399226908'),
    ('00000000-0000-0000-0000-000000000000', 'Where the Wild Things Are', ARRAY['Maurice Sendak'], '9780060254926'),
    ('00000000-0000-0000-0000-000000000000', 'Charlotte''s Web', ARRAY['E.B. White'], '9780064400558')
ON CONFLICT DO NOTHING;

-- Sample children (for testing)
INSERT INTO children (org_id, emoji_id, name, grade_or_class) VALUES
    ('00000000-0000-0000-0000-000000000000', '🐶🌈🎨', 'Test Student 1', 'Grade 3'),
    ('00000000-0000-0000-0000-000000000000', '😀🎯🚀', 'Test Student 2', 'Grade 4')
ON CONFLICT (org_id, emoji_id) DO NOTHING;
