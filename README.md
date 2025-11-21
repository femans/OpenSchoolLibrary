# OpenSchoolLibrary MVP 📚

A modern, multi-tenant school library management system built with SvelteKit, TypeScript, and Supabase. Designed for both SaaS multi-tenant deployments and private single-organization Docker installations.

## Features

- **📖 Book Management**: Add, edit, and organize books with ISBN lookup via OpenLibrary API
- **📚 Copy Tracking**: Manage physical book copies with barcode support and location tracking
- **✅ Checkout/Return System**: Simple book lending with no due dates or fees - stress-free borrowing
- **👦 Anonymous Reader IDs**: Privacy-first emoji-based identifiers (e.g., 🐶🌈🎨) for children
- **📱 QR Code Reading Journals**: Public reading journals accessible via QR codes - no login required
- **🌍 Internationalization**: Built-in i18n support with English and Dutch translations
- **🏢 Multi-Tenant Ready**: Support multiple organizations with full data isolation
- **🐳 Docker Deployable**: Single-org mode for private school installations
- **☁️ Vercel Compatible**: Easy SaaS deployment with adapter-vercel
- **🔐 Security First**: Row Level Security ready, service_role key isolation

## Tech Stack

- **Frontend**: SvelteKit 2, TypeScript, TailwindCSS
- **Backend**: SvelteKit API routes, Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (book covers)
- **i18n**: sveltekit-i18n (English, Dutch)
- **QR Generation**: qrcode library
- **Validation**: Zod
- **Testing**: Vitest

## Quick Start

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account (or local Supabase instance)

### 1. Clone and Install

```bash
git clone <your-repo>
cd OpenSchoolLibrary
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For single-org mode (private deployment):
SINGLE_ORG_MODE=true
SINGLE_ORG_ID=00000000-0000-0000-0000-000000000000
```

> **Note**: The app no longer requires `SUPABASE_SERVICE_ROLE_KEY`. Supabase is phasing out service_role keys in favor of proper RLS policies with authenticated users.

### 3. Setup Database

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply schema
supabase db push

# Or manually run SQL files via Supabase Dashboard:
# 1. Open SQL Editor in Supabase Dashboard
# 2. Run db/schema.sql
# 3. Run migrations/seed-single-org.sql (for single-org mode)
```

#### Option B: Manual Setup

1. Go to your Supabase Dashboard → SQL Editor
2. Run the contents of `db/schema.sql`
3. For single-org mode, run `migrations/seed-single-org.sql`

### 4. Create Admin User

1. Sign up via the login page (http://localhost:5173/login)
2. Get your user ID from Supabase Dashboard → Authentication → Users
3. Add yourself to the `admins` table:

```sql
INSERT INTO admins (org_id, user_id, email, role)
VALUES (
    '00000000-0000-0000-0000-000000000000',  -- Your org_id
    'your-user-id-from-auth-users',
    'admin@example.com',
    'superadmin'
);
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173

## Deployment

### Docker (Single-Org Mode)

For private school installations:

```bash
# Build image
docker build -t open-school-library .

# Run with docker-compose
docker-compose up -d
```

Or run manually:

```bash
docker run -d \
  -p 3000:3000 \
  -e PUBLIC_SUPABASE_URL=your-url \
  -e PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
  -e SINGLE_ORG_MODE=true \
  -e SINGLE_ORG_ID=00000000-0000-0000-0000-000000000000 \
  open-school-library
```

### Vercel (Multi-Tenant SaaS)

1. **Switch to Vercel adapter** in `svelte.config.js`:

```js
// import adapter from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-vercel';
```

2. **Push to GitHub** and connect to Vercel

3. **Configure Environment Variables** in Vercel Dashboard:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - Remove `SINGLE_ORG_MODE` and `SINGLE_ORG_ID` for multi-tenant

4. **Deploy**: Vercel will auto-deploy on push

## Single-Org vs Multi-Tenant Mode

### Single-Org Mode (Private Deployment)

For individual schools running their own instance:

```env
SINGLE_ORG_MODE=true
SINGLE_ORG_ID=00000000-0000-0000-0000-000000000000
```

- All data belongs to one organization
- Simplified setup and management
- No org switching in UI
- Use seeded org from `migrations/seed-single-org.sql`

### Multi-Tenant Mode (SaaS Deployment)

For hosting multiple schools:

```env
# Remove or set to false:
# SINGLE_ORG_MODE=false
```

**TODO before going multi-tenant:**

1. **Implement org resolution** in `src/lib/server/supabaseServer.ts`:

   ```ts
   export function getOrgId(user: User): string {
   	// Get org_id from user's JWT claims or admins table
   	return user.app_metadata.org_id;
   }
   ```

2. **Enable Row Level Security (RLS)** - See [RLS Policies](#row-level-security-rls) below

3. **Add org selection UI** for users belonging to multiple orgs

4. **Update all API endpoints** to require authentication and extract org_id from session

## Row Level Security (RLS)

The schema includes commented RLS policies. For production multi-tenant deployments:

### 1. Enable RLS on All Tables

```sql
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
```

### 2. Create Policies for Admin Access

Example for `books` table:

```sql
-- SELECT: Users can view books in their org
CREATE POLICY "Users can view books in their org" ON books
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM admins WHERE user_id = auth.uid()
        )
    );

-- INSERT: Admins can insert books in their org
CREATE POLICY "Admins can insert books in their org" ON books
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM admins WHERE user_id = auth.uid()
        )
    );

-- UPDATE/DELETE: Similar pattern
```

### 3. Public Access for Reading Journal

```sql
ALTER TABLE reading_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reading journal entries" ON reading_journal
    FOR SELECT
    USING (true);
```

### 4. Storage Policies

For book covers in Supabase Storage:

```sql
-- Public read access
CREATE POLICY "Public can view book covers" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'book-covers');

-- Admins can upload
CREATE POLICY "Admins can upload book covers" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'book-covers' AND
        auth.uid() IN (SELECT user_id FROM public.admins)
    );
```

## API Endpoints

### Books

- `GET /api/books` - List all books
- `POST /api/books` - Create book
- `DELETE /api/books/[id]` - Delete book

### Children

- `GET /api/children` - List all children
- `POST /api/children` - Create child (auto-generates emoji ID)
- `DELETE /api/children/[id]` - Delete child

### Copies

- `GET /api/copies?status=available` - List copies (optional status filter)

### Loans

- `GET /api/loans?filter=active` - List loans (all/active/returned)

### Checkout/Return

- `POST /api/checkout` - Checkout a book
- `POST /api/return` - Return a book

### Utilities

- `GET /api/isbn?isbn=9780140283334` - Lookup book by ISBN (OpenLibrary)
- `POST /api/import/csv` - Bulk import books from CSV
- `POST /api/upload/cover` - Upload book cover (TODO: implement)
- `GET /api/upload/cover?filename=cover.jpg` - Get signed upload URL

### Public

- `GET /api/reader/[emoji]` - Get child's reading journal (no auth required)

## Internationalization (i18n)

OpenSchoolLibrary includes built-in support for multiple languages:

### Supported Languages

- **English (en)** - Default
- **Dutch (nl)** - Nederlands

### Usage

Users can switch languages using the language selector in the navigation bar. The selected language is stored in browser localStorage and persists across sessions.

### Adding a New Language

1. Create translation files in `src/lib/i18n/locales/[locale]/`:
   - `common.json` - Common UI elements, navigation, actions, status messages
   - `admin.json` - Admin interface translations
   - `reader.json` - Reader journal translations

2. Add the locale to `src/lib/i18n/index.ts`:

```ts
{
  locale: 'de',
  key: 'common',
  loader: async () => (await import('./locales/de/common.json')).default
},
// ... repeat for admin.json and reader.json
```

3. All UI text uses the `$t()` function:

```svelte
<script>
	import { t } from '$lib/i18n';
</script>

<h1>{$t('admin.dashboard.title')}</h1>
```

### Translation Structure

Translation keys follow a hierarchical structure:

- `common.*` - Shared across all pages
- `admin.*` - Admin-specific content
- `reader.*` - Reader journal content

Example:

```json
{
	"admin": {
		"books": {
			"title": "Books",
			"add_book": "Add Book",
			"success_created": "Book created successfully"
		}
	}
}
```

## Development

### Run Tests

```bash
npm test
```

### Type Check

```bash
npm run check
```

### Format Code

```bash
npm run format
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
OpenSchoolLibrary/
├── db/
│   └── schema.sql                 # Multi-tenant database schema
├── migrations/
│   └── seed-single-org.sql        # Single-org seed data
├── src/
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── locales/           # Translation files (en/de/fr)
│   │   │   └── index.ts           # i18n configuration
│   │   ├── server/
│   │   │   └── supabaseServer.ts  # ⚠️ SERVER-ONLY client
│   │   ├── utils/
│   │   │   └── qr.ts              # QR code generation
│   │   ├── components/
│   │   │   └── LanguageSelector.svelte  # Language switcher
│   │   ├── emojiGenerator.ts      # Emoji ID generator
│   │   ├── supabaseClient.ts      # Public client (anon key)
│   │   └── types.ts               # TypeScript types
│   ├── routes/
│   │   ├── admin/                 # Admin pages
│   │   │   ├── books/
│   │   │   ├── children/
│   │   │   ├── copies/
│   │   │   └── loans/
│   │   ├── api/                   # API endpoints
│   │   ├── checkout/              # Checkout page
│   │   ├── return/                # Return page
│   │   ├── reader/[emoji]/        # Public reading journal
│   │   ├── login/                 # Login page
│   │   └── +layout.svelte         # Root layout
│   ├── app.css                    # Global styles
│   ├── app.html                   # HTML template
│   └── hooks.server.ts            # Server hooks (auth)
├── Dockerfile                     # Docker deployment
├── docker-compose.yml             # Docker Compose config
├── vercel.json                    # Vercel deployment
├── package.json
├── svelte.config.js
├── tailwind.config.cjs
└── tsconfig.json
```

## Security Checklist

- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- [ ] Enable RLS on all tables for multi-tenant
- [ ] Validate all user input with Zod
- [ ] Use parameterized queries (Supabase does this automatically)
- [ ] Implement proper session management
- [ ] Add rate limiting for public endpoints
- [ ] Enable HTTPS in production
- [ ] Regularly update dependencies
- [ ] Audit admin access grants
- [ ] Backup database regularly

## Production Hardening TODOs

The MVP includes TODO comments for production improvements:

- [ ] Implement proper org_id resolution from user session
- [ ] Add comprehensive RLS policies
- [ ] Add pagination for large lists
- [ ] Implement proper CSV parsing (use papaparse)
- [ ] Complete cover upload implementation
- [ ] Add input sanitization
- [ ] Add rate limiting
- [ ] Add logging and monitoring
- [ ] Add data export functionality
- [ ] Add email notifications
- [ ] Implement search functionality
- [ ] Add reports/analytics
- [ ] Add more languages to i18n (Spanish, Italian, etc.)
- [ ] Allow children to add books to their own reading journal

## Contributing

This is an MVP scaffold. Contributions welcome!

## License

MIT License - See LICENSE file

## Support

For issues and questions, open a GitHub issue.

---

**Built with ❤️ for schools and libraries**
Radically simple no-nonsense identity-free trust-less school library management system. Practical for small scale libraries which don't require personal user data because the readers are trusted to return the materials borrowed.
