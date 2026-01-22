# KB App - Knowledge Base Application

A production-ready Next.js App Router application with Supabase authentication, document management, and AWS S3 file storage.

## Features

- 🔐 **Authentication** - Email/password login with role-based access control
- 📄 **Document Management** - Upload, search, edit, and delete documents
- 🔍 **Full-Text Search** - Postgres full-text search with relevance ranking
- 👥 **User Management** - Admin panel for managing user roles
- 📤 **File Upload** - Secure file uploads with signed URLs
- 🎨 **Modern UI** - Tailwind CSS with dark mode support
- 🔒 **RBAC** - Role-based access control (Admin, Editor, Viewer)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** Bun/Node.js
- **Database:** Supabase (PostgreSQL)
- **Storage:** AWS S3 / Supabase Storage
- **Styling:** Tailwind CSS v4
- **Authentication:** Supabase Auth
- **TypeScript:** Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- AWS S3 or Supabase Storage bucket

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/kb-app.git
cd kb-app
```

2. **Install dependencies:**
```bash
npm install
# or
bun install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your_bucket_name
AWS_S3_ENDPOINT=your_s3_endpoint
```

4. **Set up database:**
   - Run SQL scripts in Supabase SQL Editor:
     - `lib/profiles-schema-updated.sql` - Creates profiles table
     - `lib/schema.sql` - Creates documents table (if needed)

5. **Run development server:**
```bash
npm run dev
# or
bun dev
```

6. **Create a test user:**
   - Go to Supabase Dashboard → Authentication → Users
   - Create a user
   - Run `lib/create-profile-by-email.sql` to set admin role

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## Project Structure

```
kb-app/
├── app/
│   ├── (authenticated)/    # Protected routes
│   │   ├── documents/      # Document list & search
│   │   ├── email-templates/ # Email templates management
│   │   ├── notes/          # Personal notes
│   │   ├── upload/         # File upload
│   │   └── users/          # User management
│   ├── api/                # API routes
│   ├── components/         # Shared React components
│   ├── hooks/              # Custom React hooks
│   └── login/              # Login page
├── lib/
│   ├── auth.ts             # Authentication helpers
│   ├── permissions.ts     # RBAC helpers
│   ├── storage.ts          # S3 client
│   ├── upload.ts           # Upload helpers
│   ├── utils.ts            # Utility functions
│   ├── errors.ts           # Error handling
│   ├── validation.ts       # Input validation
│   └── api-client.ts       # API client wrapper
├── docs/                   # Documentation
└── middleware.ts           # Route protection
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Components](./docs/COMPONENTS.md)** - Component documentation
- **[Database](./docs/DATABASE.md)** - Database schema and relationships
- **[Development](./docs/DEVELOPMENT.md)** - Development guide and best practices
- **[Deployment](./docs/DEPLOYMENT.md)** - Deployment instructions
- **[New Features](./docs/NEW_FEATURES.md)** - Feature documentation

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
