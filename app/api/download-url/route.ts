import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get document from documents table
    const { data: document, error } = await supabase
      .from('documents')
      .select('s3_key, title')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      return NextResponse.json(
        { error: 'S3 bucket not configured' },
        { status: 500 }
      );
    }

    // Remove bucket name prefix if it exists (for Supabase Storage compatibility)
    // Some keys might be stored as "documents/uploads/..." but should be "uploads/..."
    let s3Key = document.s3_key;
    if (s3Key.startsWith(`${bucket}/`)) {
      s3Key = s3Key.substring(bucket.length + 1);
    }

    // Extract original filename from s3_key
    // Format: uploads/user-id/timestamp-filename.ext
    const keyParts = s3Key.split('/');
    const filenameWithTimestamp = keyParts[keyParts.length - 1];
    // Remove timestamp prefix (format: timestamp-filename.ext)
    const timestampMatch = filenameWithTimestamp.match(/^\d+-(.+)$/);
    const originalFilename = timestampMatch 
      ? timestampMatch[1] 
      : filenameWithTimestamp;

    // Use original filename with extension, fallback to title if extraction fails
    const downloadFilename = originalFilename || document.title || 'document';

    // Generate signed GET URL (valid for 1 hour)
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${downloadFilename}"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      url: signedUrl,
      filename: downloadFilename,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
