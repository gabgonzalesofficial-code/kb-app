# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Git
- Supabase account
- AWS account (for S3) or use Supabase Storage

### Initial Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd kb-app
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Set up environment variables**
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

4. **Set up database**
   - Go to Supabase Dashboard → SQL Editor
   - Run `lib/profiles-schema-updated.sql`
   - Run `lib/schema.sql` (if creating documents table)
   - Run `lib/email-templates-schema.sql`
   - Run `lib/personal-notes-schema.sql`

5. **Create test user**
   - Go to Supabase Dashboard → Authentication → Users
   - Create a user
   - Run `lib/create-profile-by-email.sql` to set admin role

6. **Start development server**
```bash
npm run dev
# or
bun dev
```

Visit `http://localhost:3000`

## Development Workflow

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Use Prettier (recommended)
- **Linting**: ESLint with Next.js config
- **Naming**: 
  - Components: PascalCase (`MyComponent.tsx`)
  - Files: camelCase for utilities (`utils.ts`)
  - Constants: UPPER_SNAKE_CASE

### File Organization

```
app/
├── (authenticated)/     # Protected routes
│   └── [feature]/
│       ├── page.tsx     # Route page
│       └── components/  # Feature components
├── api/                 # API routes
├── components/          # Shared components
└── hooks/               # Custom hooks

lib/
├── auth.ts              # Auth utilities
├── permissions.ts       # RBAC logic
├── utils.ts             # General utilities
└── [feature].ts        # Feature-specific utilities
```

### Component Development

1. **Start with Server Components**
   - Use Server Components by default
   - Only add `'use client'` when needed

2. **Add Interactivity**
   - Use Client Components for forms, modals, search
   - Keep Server Components for data fetching

3. **Error Handling**
   - Wrap async operations in try-catch
   - Show user-friendly error messages
   - Log errors for debugging

4. **Loading States**
   - Always show loading indicators
   - Use skeleton loaders for better UX

### API Route Development

1. **Structure**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check permissions (if needed)
    requirePermission(user, 'canRead');

    // 3. Process request
    // ...

    // 4. Return response
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

2. **Error Handling**
   - Use custom error classes from `lib/errors.ts`
   - Return appropriate HTTP status codes
   - Include helpful error messages

3. **Validation**
   - Validate all inputs
   - Use `lib/validation.ts` utilities
   - Return 400 for validation errors

### Testing

#### Manual Testing Checklist
- [ ] Authentication flow
- [ ] Permission checks
- [ ] File upload/download
- [ ] Search functionality
- [ ] CRUD operations
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design

#### Testing Tools
- Browser DevTools
- Supabase Dashboard (database inspection)
- Network tab (API calls)
- React DevTools (component inspection)

### Debugging

#### Common Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run build`
   - Verify environment variables
   - Check imports and exports

2. **Runtime Errors**
   - Check browser console
   - Check server logs
   - Verify API responses

3. **Database Errors**
   - Check Supabase Dashboard logs
   - Verify RLS policies
   - Check table schemas

4. **Authentication Issues**
   - Verify session cookies
   - Check middleware configuration
   - Verify Supabase credentials

### Performance Optimization

1. **Frontend**
   - Use Server Components where possible
   - Implement code splitting
   - Optimize images
   - Debounce search inputs

2. **Backend**
   - Add database indexes
   - Optimize queries
   - Cache frequently accessed data
   - Use pagination for large datasets

3. **Bundle Size**
   - Analyze bundle: `npm run build`
   - Remove unused dependencies
   - Use dynamic imports for heavy components

### Git Workflow

1. **Branch Naming**
   - `feature/feature-name`
   - `fix/bug-description`
   - `refactor/component-name`

2. **Commit Messages**
   ```
   type(scope): description

   [optional body]

   [optional footer]
   ```

   Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`

3. **Pull Requests**
   - Clear description
   - Link related issues
   - Request review
   - Ensure CI passes

## Best Practices

### Security
- Never commit `.env` files
- Validate all user inputs
- Use parameterized queries (Supabase client)
- Implement rate limiting (production)
- Keep dependencies updated

### Code Quality
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Follow DRY principle
- Use TypeScript types strictly

### Performance
- Minimize re-renders
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Optimize images
- Use CDN for static assets

### Accessibility
- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Maintain color contrast
- Test with screen readers

### Error Handling
- Always handle errors gracefully
- Show user-friendly messages
- Log errors for debugging
- Implement retry logic where appropriate

## Environment Variables

### Development
- Use `.env.local` for local overrides
- Never commit `.env` files
- Use `.env.example` as template

### Production
- Set in Vercel dashboard
- Use different values for staging/production
- Rotate secrets regularly

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Performance optimized
- [ ] Security reviewed

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
