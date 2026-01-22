# Database Schema Documentation

## Overview

The application uses Supabase (PostgreSQL) as the database. All tables use UUID primary keys and include Row Level Security (RLS) policies.

## Tables

### `profiles`
User profiles linked to Supabase Auth users.

**Schema:**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  role TEXT CHECK (role IN ('admin','editor','viewer')) DEFAULT 'viewer'
);
```

**Columns:**
- `id` (UUID, PK, FK → auth.users.id)
- `full_name` (TEXT, nullable)
- `role` (TEXT, enum: 'admin', 'editor', 'viewer', default: 'viewer')

**Indexes:**
- `idx_profiles_role` on `role`

**RLS Policies:**
- Users can view all profiles
- Users can update their own profile (limited fields)

**Triggers:**
- Auto-create profile on user signup

---

### `documents`
Document metadata and references to S3 storage.

**Schema:**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  s3_key TEXT NOT NULL,
  content_text TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Columns:**
- `id` (UUID, PK, auto-generated)
- `title` (TEXT, required)
- `description` (TEXT, nullable)
- `s3_key` (TEXT, required) - S3 object key
- `content_text` (TEXT, nullable) - Full-text search content
- `created_by` (UUID, FK → profiles.id)
- `created_at` (TIMESTAMP, default: NOW())

**Indexes:**
- `documents_search_idx` - GIN index on `to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content_text,''))`
- Index on `created_by`
- Index on `created_at` DESC

**RLS Policies:**
- All users can view documents
- Admin and Editor can insert documents
- Admin can update documents
- Admin can delete documents

---

### `email_templates`
Email templates for communications.

**Schema:**
```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns:**
- `id` (UUID, PK, auto-generated)
- `name` (TEXT, required) - Template name
- `subject` (TEXT, required) - Email subject
- `body` (TEXT, required) - Email body content
- `created_by` (UUID, FK → profiles.id, CASCADE delete)
- `created_at` (TIMESTAMPTZ, default: NOW())
- `updated_at` (TIMESTAMPTZ, default: NOW(), auto-updated)

**Indexes:**
- Index on `created_by`
- Index on `created_at` DESC

**RLS Policies:**
- All authenticated users can view templates
- Admin and Editor can insert/update/delete templates

**Triggers:**
- Auto-update `updated_at` on row update

---

### `personal_notes`
User's personal notes.

**Schema:**
```sql
CREATE TABLE personal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

**Columns:**
- `id` (UUID, PK, auto-generated)
- `title` (TEXT, required)
- `content` (TEXT, required)
- `user_id` (UUID, FK → profiles.id, CASCADE delete)
- `created_at` (TIMESTAMPTZ, default: NOW())
- `updated_at` (TIMESTAMPTZ, default: NOW(), auto-updated)

**Indexes:**
- Index on `user_id`
- Index on `created_at` DESC

**RLS Policies:**
- Users can only view/insert/update/delete their own notes

**Triggers:**
- Auto-update `updated_at` on row update

---

## Relationships

```
auth.users
  └── profiles (1:1)
      ├── documents.created_by (1:many)
      ├── email_templates.created_by (1:many)
      └── personal_notes.user_id (1:many)
```

## Indexes Summary

### Performance Indexes
- `documents_search_idx` - Full-text search on documents
- `idx_profiles_role` - Role-based queries
- Foreign key indexes for join performance
- Timestamp indexes for sorting

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
1. Control read access (who can view)
2. Control write access (who can create/update/delete)
3. Enforce data isolation (users see only their data where applicable)

## Database Functions

### `handle_new_user()`
Automatically creates a profile when a new user signs up.

**Trigger:** `on_auth_user_created` on `auth.users`

### `update_email_templates_updated_at()`
Automatically updates `updated_at` timestamp.

**Trigger:** `email_templates_updated_at` on `email_templates`

### `update_personal_notes_updated_at()`
Automatically updates `updated_at` timestamp.

**Trigger:** `personal_notes_updated_at` on `personal_notes`

## Migration Strategy

### Creating New Tables
1. Create SQL schema file in `lib/`
2. Run in Supabase SQL Editor
3. Update this documentation
4. Test RLS policies

### Modifying Existing Tables
1. Create migration SQL file
2. Test on development database
3. Document changes
4. Apply to production

## Backup & Recovery

### Supabase Backups
- Automatic daily backups (Supabase Pro)
- Point-in-time recovery available
- Manual backup via Supabase Dashboard

### Recommended Practices
- Test restore procedures regularly
- Keep schema changes documented
- Version control SQL migrations
- Test migrations on staging first

## Performance Considerations

### Query Optimization
- Use indexes for frequently queried fields
- Limit result sets with pagination
- Use full-text search for document search
- Avoid N+1 queries (use joins)

### Index Maintenance
- Monitor index usage
- Remove unused indexes
- Add indexes for slow queries
- Consider partial indexes for filtered queries

## Security Considerations

### SQL Injection Prevention
- Always use Supabase client (parameterized queries)
- Never concatenate user input into SQL
- Validate all inputs before database operations

### Data Privacy
- RLS ensures users only see their data
- Sensitive data (passwords) stored in auth.users (not profiles)
- Audit logs available in Supabase Dashboard
