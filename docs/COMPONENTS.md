# Component Documentation

## Component Structure

### Layout Components

#### `Header`
**Location:** `app/components/Header.tsx`
**Type:** Server Component

Displays the application header with user information and logout button.

**Props:** None (fetches user data server-side)

**Features:**
- Shows user's full name or email
- Displays user role
- Logout button

---

#### `Sidebar`
**Location:** `app/components/Sidebar.tsx`
**Type:** Client Component

Navigation sidebar with role-based menu items.

**Features:**
- Dynamic navigation based on permissions
- Role-based visibility
- Active route highlighting (can be added)

**Navigation Items:**
- Dashboard (all users)
- Upload (admin, editor)
- Documents (all users)
- Email Templates (admin, editor)
- Personal Notes (all users)
- Users (admin only)
- Settings (all users)

---

### Form Components

#### `LoginForm`
**Location:** `app/login/LoginForm.tsx`
**Type:** Client Component

Email/password login form.

**Features:**
- Email and password validation
- Error handling
- Redirect after successful login
- Loading states

---

#### `UploadForm`
**Location:** `app/(authenticated)/upload/UploadForm.tsx`
**Type:** Client Component

File upload form with progress tracking.

**Features:**
- File selection with validation
- Upload progress indicator
- Direct S3 upload via signed URL
- Metadata saving
- Success/error states

**File Limits:**
- Max size: 50MB
- Allowed types: PDF, Word, Excel, Images, ZIP

---

### List Components

#### `DocumentList`
**Location:** `app/(authenticated)/documents/components/DocumentList.tsx`
**Type:** Client Component

Displays list of documents with actions.

**Props:**
```typescript
interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onUpdate?: () => void;
}
```

**Features:**
- Document cards with metadata
- Download action
- Edit action (admin, editor)
- Delete action (admin)
- Permission-based UI

---

#### `EmailTemplatesList`
**Location:** `app/(authenticated)/email-templates/EmailTemplatesList.tsx`
**Type:** Client Component

Email templates management interface.

**Features:**
- List all templates
- Create new template
- Edit existing template
- Delete template
- Search functionality
- Inline form editing

---

#### `NotesList`
**Location:** `app/(authenticated)/notes/NotesList.tsx`
**Type:** Client Component

Personal notes management interface.

**Features:**
- List user's notes
- Create new note
- Edit note
- Delete note
- Search functionality
- Inline form editing

---

### Utility Components

#### `SearchInput`
**Location:** `app/(authenticated)/documents/components/SearchInput.tsx`
**Type:** Client Component

Reusable search input with debouncing.

**Props:**
```typescript
interface SearchInputProps {
  onSearch: (query: string) => void;
  debounceMs?: number; // Default: 300
  placeholder?: string; // Default: "Search..."
}
```

**Features:**
- Debounced input
- Search icon
- Customizable placeholder

---

#### `PermissionGate`
**Location:** `app/components/PermissionGate.tsx`
**Type:** Client Component

Conditionally renders children based on user permissions.

**Props:**
```typescript
interface PermissionGateProps {
  permission: keyof Permission;
  children: ReactNode;
  fallback?: ReactNode;
}
```

**Usage:**
```tsx
<PermissionGate permission="canUpload" fallback={<div>No access</div>}>
  <UploadButton />
</PermissionGate>
```

---

#### `RoleGate`
**Location:** `app/components/RoleGate.tsx`
**Type:** Client Component

Conditionally renders children based on user roles.

**Props:**
```typescript
interface RoleGateProps {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}
```

**Usage:**
```tsx
<RoleGate allowedRoles={['admin']} fallback={null}>
  <AdminPanel />
</RoleGate>
```

---

## Custom Hooks

### `usePermissions`
**Location:** `app/hooks/usePermissions.ts`

Fetches and provides user permissions.

**Returns:**
```typescript
{
  permissions: Permission | null;
  loading: boolean;
  role: string | null;
}
```

**Usage:**
```tsx
const { permissions, loading } = usePermissions();
if (permissions?.canUpload) {
  // Show upload button
}
```

---

### `useDebounce`
**Location:** `app/hooks/useDebounce.ts`

Debounces a value.

**Usage:**
```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);
```

---

### `useApi`
**Location:** `app/hooks/useApi.ts`

API call hook with loading and error states.

**Usage:**
```tsx
const { execute, loading, error, data } = useApi({
  onSuccess: (data) => console.log('Success', data),
  onError: (error) => console.error('Error', error)
});

// Later...
await execute('/api/documents');
```

---

## Component Best Practices

### 1. Server vs Client Components
- Use Server Components by default
- Add `'use client'` only when needed (interactivity, hooks, browser APIs)

### 2. Props Interface
- Always define TypeScript interfaces for props
- Use descriptive prop names
- Document complex props

### 3. Error Handling
- Wrap async operations in try-catch
- Show user-friendly error messages
- Log errors for debugging

### 4. Loading States
- Always show loading indicators for async operations
- Use skeleton loaders for better UX
- Disable forms during submission

### 5. Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain color contrast ratios

### 6. Performance
- Use `useCallback` for event handlers passed as props
- Use `useMemo` for expensive computations
- Lazy load heavy components
- Debounce search inputs

### 7. Styling
- Use Tailwind utility classes
- Create reusable component classes if needed
- Support dark mode
- Maintain consistent spacing

---

## Component Patterns

### Form Pattern
```tsx
'use client';

export default function MyForm() {
  const [formData, setFormData] = useState({ field: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // API call
      await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      // Success handling
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### List Pattern
```tsx
'use client';

export default function MyList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data.items);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <SearchInput onSearch={setSearchQuery} />
      {filteredItems.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
```
