# New Features: Email Templates & Personal Notes

## SQL Setup

Run these SQL scripts in your Supabase SQL Editor:

### 1. Email Templates Table
Run: `lib/email-templates-schema.sql`

This creates:
- `email_templates` table with name, subject, body
- RLS policies (admin/editor can create/edit/delete, all can view)
- Auto-update timestamp trigger

### 2. Personal Notes Table
Run: `lib/personal-notes-schema.sql`

This creates:
- `personal_notes` table with title, content
- RLS policies (users can only access their own notes)
- Auto-update timestamp trigger

## Features

### Email Templates
- **Location:** `/email-templates`
- **Access:** Admin and Editor roles only
- **Features:**
  - Create new email templates
  - Edit existing templates
  - Delete templates
  - View all templates
  - Templates include: name, subject, body

### Personal Notes
- **Location:** `/notes`
- **Access:** All authenticated users
- **Features:**
  - Create personal notes
  - Edit your own notes
  - Delete your own notes
  - View only your notes
  - Notes include: title, content

## Navigation

Both features are now in the sidebar:
- 📧 Email Templates (admin/editor only)
- 📝 Personal Notes (all users)

## API Routes

### Email Templates
- `GET /api/email-templates` - List all templates
- `POST /api/email-templates` - Create template
- `PATCH /api/email-templates/[id]` - Update template
- `DELETE /api/email-templates/[id]` - Delete template

### Personal Notes
- `GET /api/notes` - List user's notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

## Security

- Email Templates: Protected by `canUpload` permission (admin/editor)
- Personal Notes: Protected by user_id (users can only access their own)
