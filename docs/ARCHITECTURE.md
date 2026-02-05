# Architecture Documentation

## Overview

Knowledge Repository is a full-stack Next.js application built with TypeScript, Supabase, and AWS S3. It follows modern web development best practices with a focus on security, performance, and maintainability.

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Forms**: Native HTML forms with controlled components

### Backend
- **Runtime**: Node.js 18+ / Bun
- **API**: Next.js API Routes (Server Actions)
- **Database**: Supabase (PostgreSQL)
- **Storage**: AWS S3 / Supabase Storage
- **Authentication**: Supabase Auth

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Database**: Supabase Cloud
- **File Storage**: AWS S3 or Supabase Storage

## Architecture Patterns

### 1. Server Components & Client Components
- **Server Components**: Used for data fetching and initial rendering
- **Client Components**: Used for interactive UI (forms, modals, search)
- Clear separation using `'use client'` directive

### 2. Route Groups
- `(authenticated)` - Protected routes requiring authentication
- Public routes (login) outside route groups

### 3. API Routes Structure
```
app/api/
├── documents/        # Document CRUD operations
├── email-templates/  # Email template management
├── notes/            # Personal notes management
├── users/            # User management
├── search/           # Full-text search
├── upload-url/       # Generate signed upload URLs
└── download-url/     # Generate signed download URLs
```

### 4. Component Organization
```
app/components/       # Shared components (Header, Sidebar, etc.)
app/(authenticated)/
  └── [feature]/
      └── components/ # Feature-specific components
```

### 5. Library Organization
```
lib/
├── auth.ts           # Authentication helpers
├── permissions.ts    # RBAC logic
├── storage.ts        # S3 client configuration
├── upload.ts         # Upload utilities
├── utils.ts          # General utilities
├── errors.ts         # Error handling
├── validation.ts     # Input validation
└── api-client.ts     # API client wrapper
```

## Data Flow

### Authentication Flow
1. User submits login form
2. `LoginForm` calls Supabase auth
3. Session stored in cookies via `@supabase/ssr`
4. Middleware validates session on each request
5. Server components fetch user profile

### File Upload Flow
1. User selects file in `UploadForm`
2. Client requests signed URL from `/api/upload-url`
3. Server validates permissions and generates signed PUT URL
4. Client uploads directly to S3
5. Client saves metadata to `/api/documents`
6. Server stores document record in Supabase

### Document Download Flow
1. User clicks download in `DocumentList`
2. Client requests signed URL from `/api/download-url`
3. Server validates permissions and generates signed GET URL
4. Client opens/downloads file from S3

## Security Architecture

### Authentication
- Session-based auth via Supabase
- JWT tokens stored in HTTP-only cookies
- Middleware validates every request

### Authorization
- Role-Based Access Control (RBAC)
- Three roles: Admin, Editor, Viewer
- Permission checks at API level
- UI components hide unauthorized actions

### Data Security
- Row Level Security (RLS) in Supabase
- Signed URLs for S3 access (time-limited)
- Input validation and sanitization
- SQL injection prevention via Supabase client

### File Security
- File type validation
- File size limits (50MB)
- Secure direct uploads (no server proxy)
- Signed URLs expire after 1 hour

## Performance Optimizations

### Frontend
- Server Components for initial render
- Client Components only when needed
- Debounced search inputs
- Lazy loading for modals
- Memoization with useCallback

### Backend
- Database indexes on frequently queried fields
- Full-text search with GIN indexes
- Efficient queries with Supabase client
- Cached user permissions

### Caching Strategy
- Static assets cached by CDN (Vercel)
- API responses not cached (dynamic data)
- Browser caching for static resources

## Error Handling

### Client-Side
- Try-catch blocks in async functions
- User-friendly error messages
- Loading states for async operations
- Form validation feedback

### Server-Side
- Custom error classes (`AppError`, `ValidationError`, etc.)
- Consistent error responses
- Error logging for debugging
- Graceful degradation

## Database Schema

### Core Tables
- `profiles` - User profiles with roles
- `documents` - Document metadata
- `email_templates` - Email templates
- `personal_notes` - User notes

### Relationships
- `documents.created_by` → `profiles.id`
- `email_templates.created_by` → `profiles.id`
- `personal_notes.user_id` → `profiles.id`

### Indexes
- GIN index on `documents` for full-text search
- Indexes on foreign keys
- Indexes on frequently queried fields

## Deployment Architecture

### Production Environment
- **Frontend**: Vercel Edge Network
- **API**: Vercel Serverless Functions
- **Database**: Supabase Cloud
- **Storage**: AWS S3 or Supabase Storage

### Environment Variables
- Public vars: `NEXT_PUBLIC_*` (exposed to client)
- Private vars: Server-only (API keys, secrets)

## Scalability Considerations

### Current Limitations
- Single database instance
- No horizontal scaling for API routes
- File storage on single S3 bucket

### Future Improvements
- Database read replicas
- CDN for file downloads
- Redis for caching
- Queue system for background jobs

## Monitoring & Logging

### Current Setup
- Console logging for errors
- Vercel analytics (optional)
- Supabase dashboard for database metrics

### Recommended Additions
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics
- Database query monitoring
