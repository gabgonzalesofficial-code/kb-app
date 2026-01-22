import { NextRequest, NextResponse } from 'next/server';
import { saveDocumentMetadata } from '@/lib/upload';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check upload permission
    try {
      requirePermission(user, 'canUpload');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Upload permission required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, s3Key, contentText } = body;

    if (!title || !s3Key) {
      return NextResponse.json(
        { error: 'Missing required fields: title and s3Key are required' },
        { status: 400 }
      );
    }

    const result = await saveDocumentMetadata({
      title,
      description,
      s3Key,
      contentText: contentText || null,
      createdBy: user.id,
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to save document metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error('Error saving document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
