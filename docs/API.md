# API Documentation

## Base URL
All API routes are prefixed with `/api`

## Authentication
Most endpoints require authentication via session cookie. Include credentials in requests:
```typescript
fetch('/api/endpoint', {
  credentials: 'include'
})
```

## Error Responses
All errors follow this format:
```json
{
  "error": "Error message here"
}
```

## Endpoints

### Documents

#### GET `/api/documents`
Get all documents (paginated)

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "s3_key": "string",
      "created_at": "ISO date",
      "created_by": "uuid"
    }
  ]
}
```

#### POST `/api/documents`
Create a new document

**Request:**
```json
{
  "title": "string",
  "description": "string",
  "s3Key": "string",
  "contentText": "string"
}
```

**Permissions:** Admin, Editor

#### PATCH `/api/documents/[id]`
Update document metadata

**Request:**
```json
{
  "title": "string",
  "description": "string"
}
```

**Permissions:** Admin, Editor

#### DELETE `/api/documents/[id]`
Delete a document

**Permissions:** Admin

---

### Search

#### GET `/api/search?q=query`
Search documents using full-text search

**Query Parameters:**
- `q` (string): Search query

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "s3_key": "string",
      "relevance": 0.5
    }
  ]
}
```

---

### Upload

#### POST `/api/upload-url`
Generate signed URL for file upload

**Request:**
```json
{
  "filename": "string",
  "mimeType": "string",
  "fileSize": 0
}
```

**Response:**
```json
{
  "signedUrl": "https://...",
  "key": "uploads/user-id/timestamp-filename.ext",
  "bucket": "bucket-name"
}
```

**Permissions:** Admin, Editor

**File Size Limit:** 50MB

**Allowed Types:**
- Images: jpeg, png, gif, webp
- Documents: pdf, doc, docx, txt, csv
- Spreadsheets: xls, xlsx
- Archives: zip

---

### Download

#### GET `/api/download-url?id=document-id`
Generate signed URL for file download

**Query Parameters:**
- `id` (uuid): Document ID

**Response:**
```json
{
  "url": "https://...",
  "filename": "original-filename.pdf"
}
```

**URL Expires:** 1 hour

---

### Email Templates

#### GET `/api/email-templates`
Get all email templates

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "string",
      "subject": "string",
      "body": "string",
      "created_by": "uuid",
      "created_at": "ISO date",
      "updated_at": "ISO date"
    }
  ]
}
```

#### POST `/api/email-templates`
Create email template

**Request:**
```json
{
  "name": "string",
  "subject": "string",
  "body": "string"
}
```

**Permissions:** Admin, Editor

#### PATCH `/api/email-templates/[id]`
Update email template

**Request:**
```json
{
  "name": "string",
  "subject": "string",
  "body": "string"
}
```

**Permissions:** Admin, Editor

#### DELETE `/api/email-templates/[id]`
Delete email template

**Permissions:** Admin, Editor

---

### Personal Notes

#### GET `/api/notes`
Get user's personal notes

**Response:**
```json
{
  "notes": [
    {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "user_id": "uuid",
      "created_at": "ISO date",
      "updated_at": "ISO date"
    }
  ]
}
```

#### POST `/api/notes`
Create personal note

**Request:**
```json
{
  "title": "string",
  "content": "string"
}
```

#### PATCH `/api/notes/[id]`
Update personal note

**Request:**
```json
{
  "title": "string",
  "content": "string"
}
```

**Note:** Users can only update their own notes

#### DELETE `/api/notes/[id]`
Delete personal note

**Note:** Users can only delete their own notes

---

### Users

#### GET `/api/users`
Get all users (with profiles)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "full_name": "string",
      "role": "admin" | "editor" | "viewer"
    }
  ]
}
```

**Permissions:** Admin

#### PATCH `/api/users`
Update user role

**Request:**
```json
{
  "userId": "uuid",
  "role": "admin" | "editor" | "viewer"
}
```

**Permissions:** Admin

---

### User Permissions

#### GET `/api/user/permissions`
Get current user's permissions

**Response:**
```json
{
  "role": "admin" | "editor" | "viewer",
  "permissions": {
    "canUpload": true,
    "canEdit": true,
    "canDelete": true,
    "canManageUsers": true,
    "canRead": true
  }
}
```

---

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently not implemented. Recommended for production:
- 100 requests per minute per user
- 10 uploads per minute per user
