import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import DocumentsClient from './DocumentsClient';

export interface Document {
  id: string;
  title: string;
  description: string | null;
  s3_key: string;
  content_text: string | null;
  created_at: string;
  created_by: string;
}

export default async function DocumentsServer() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createServerSupabaseClient();

  // Fetch initial documents server-side
  const { data, error } = await supabase
    .from('documents')
    .select('id, title, description, s3_key, content_text, created_at, created_by')
    .order('created_at', { ascending: false })
    .limit(100);

  const initialDocuments: Document[] = (data || []).map((doc) => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    s3_key: doc.s3_key,
    content_text: doc.content_text,
    created_at: doc.created_at,
    created_by: doc.created_by,
  }));

  return <DocumentsClient initialDocuments={initialDocuments} />;
}
