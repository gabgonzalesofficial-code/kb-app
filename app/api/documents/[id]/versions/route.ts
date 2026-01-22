import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get all versions for this document, ordered by version number descending
    const { data: versions, error } = await supabase
      .from('document_versions')
      .select('id, version_number, filename, mime_type, file_size, s3_key, s3_bucket, uploaded_by, created_at')
      .eq('document_id', id)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching document versions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch document versions' },
        { status: 500 }
      );
    }

    // Also get current document version
    const { data: currentDoc, error: docError } = await supabase
      .from('documents')
      .select('id, version_number, filename, mime_type, file_size, s3_key, s3_bucket, uploaded_by, created_at, updated_at')
      .eq('id', id)
      .single();

    if (docError) {
      console.error('Error fetching current document:', docError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Combine current version with historical versions
    const allVersions = [
      {
        id: currentDoc.id,
        version_number: currentDoc.version_number || 1,
        filename: currentDoc.filename,
        mime_type: currentDoc.mime_type,
        file_size: currentDoc.file_size,
        s3_key: currentDoc.s3_key,
        s3_bucket: currentDoc.s3_bucket,
        uploaded_by: currentDoc.uploaded_by,
        created_at: currentDoc.updated_at || currentDoc.created_at,
        is_current: true,
      },
      ...(versions || []).map((v) => ({
        ...v,
        is_current: false,
      })),
    ].sort((a, b) => b.version_number - a.version_number);

    return NextResponse.json({ versions: allVersions });
  } catch (error) {
    console.error('Error in versions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
