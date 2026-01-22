import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

// PATCH update email template
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

    // Check permission (admin and editor can update templates)
    try {
      requirePermission(user, 'canUpload');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Editor role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, subject, body: templateBody } = body;

    if (!name || !subject || !templateBody) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('email_templates')
      .update({
        name,
        subject,
        body: templateBody,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email template:', error);
      return NextResponse.json(
        { error: 'Failed to update email template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ template: data });
  } catch (error) {
    console.error('Error in email templates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE email template
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

    // Check permission (admin and editor can delete templates)
    try {
      requirePermission(user, 'canUpload');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Editor role required' },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting email template:', error);
      return NextResponse.json(
        { error: 'Failed to delete email template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in email templates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
