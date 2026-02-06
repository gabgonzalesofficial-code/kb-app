import { createServerSupabaseClient } from './supabase-server';

export interface DocumentMetadata {
  title: string;
  description?: string;
  s3Key: string;
  contentText?: string;
  createdBy: string; // References profiles.id
  isPublic?: boolean; // Whether the document is public or private
}

/**
 * Save document metadata to Supabase documents table
 */
export async function saveDocumentMetadata(
  metadata: DocumentMetadata
): Promise<{ id: string } | null> {
  const supabase = await createServerSupabaseClient();

  // Create new document
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: metadata.title,
      description: metadata.description || null,
      s3_key: metadata.s3Key,
      content_text: metadata.contentText || null,
      created_by: metadata.createdBy,
      is_public: metadata.isPublic !== undefined ? metadata.isPublic : true, // Default to public if not specified
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving document metadata:', error);
    return null;
  }

  return { id: data.id };
}
