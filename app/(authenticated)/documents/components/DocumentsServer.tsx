import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import DocumentsClient from './DocumentsClient';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  s3_key: string;
  content_text: string | null;
  created_at: string;
  created_by: string;
  is_public?: boolean;
}

export default async function DocumentsServer() {
  const user = await getUserWithProfile();
  if (!user) {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  // Determine document visibility based on role
  // Admins: can see all documents
  // Editors: can only see public documents + their own private documents
  // Viewers: can only see public documents + their own private documents
  const isAdmin = user.role === 'admin';
  const isEditor = user.role === 'editor';

  // Fetch documents - include is_public field
  let query = supabase
    .from('documents')
    .select('id, title, description, s3_key, content_text, created_at, created_by, is_public')
    .order('created_at', { ascending: false })
    .limit(100);

  // Apply visibility filters
  if (isAdmin) {
    // Admins can see all documents (public and private)
    // No additional filter needed
  } else {
    // Editors and viewers can only see public documents or documents they created
    query = query.or(`is_public.eq.true,created_by.eq.${user.id}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching documents:', error);
  }

  // CRITICAL: Filter client-side because RLS policy allows all documents (USING (true))
  // This ensures private documents are properly hidden based on role
  const filteredData = (data || []).filter((doc) => {
    // Normalize is_public value (handle boolean, string, null, undefined)
    const isPublicValue = doc.is_public;
    
    // Treat null/undefined as public for backward compatibility
    const isPublic = isPublicValue === true || 
                     isPublicValue === 'true' || 
                     isPublicValue === null || 
                     isPublicValue === undefined;
    
    const isPrivate = isPublicValue === false || isPublicValue === 'false';
    
    // Always show public documents
    if (isPublic) {
      return true;
    }
    
    // For private documents, enforce strict permissions
    if (isPrivate) {
      // Admins can see all private documents
      if (isAdmin) {
        return true;
      }
      // Editors and viewers can only see their own private documents
      return doc.created_by === user.id;
    }
    
    // Unknown state - hide it for safety
    return false;
  });

  const initialDocuments: Document[] = filteredData.map((doc) => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    s3_key: doc.s3_key,
    content_text: doc.content_text,
    created_at: doc.created_at,
    created_by: doc.created_by,
    is_public: doc.is_public,
  }));

  return <DocumentsClient initialDocuments={initialDocuments} />;
}
