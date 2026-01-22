import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/storage';

// DELETE document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserWithProfile();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check delete permission
    try {
      requirePermission(user, 'canDelete');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Delete permission required' },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get document to delete
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('s3_key')
      .eq('id', id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from S3
    const bucket = process.env.AWS_S3_BUCKET;
    if (bucket) {
      try {
        // Remove bucket name prefix if it exists (for Supabase Storage compatibility)
        let s3Key = document.s3_key;
        if (s3Key.startsWith(`${bucket}/`)) {
          s3Key = s3Key.substring(bucket.length + 1);
        }

        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucket,
          Key: s3Key,
        });
        await s3Client.send(deleteCommand);
      } catch (s3Error) {
        console.error('Error deleting from S3:', s3Error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH document (edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserWithProfile();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check edit permission
    try {
      requirePermission(user, 'canEdit');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Edit permission required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Update document
    const { data, error } = await supabase
      .from('documents')
      .update({
        title,
        description: description || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
