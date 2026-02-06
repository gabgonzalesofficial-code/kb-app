import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

// PATCH update tool
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

    // Check permission (admin and editor can update tools)
    try {
      requirePermission(user, 'canEditEmailTemplates');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Editor role required to edit tools' },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Fetch tool to check if user is the creator
    const { data: tool, error: fetchError } = await supabase
      .from('tools')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Editors can only edit tools they created
    // Admins can edit any tool
    if (user.role === 'editor' && tool.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only edit tools you created' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, url, description } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('tools')
      .update({
        name,
        url,
        description: description || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tool:', error);
      return NextResponse.json(
        { error: 'Failed to update tool' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tool: data });
  } catch (error) {
    console.error('Error in tools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE tool
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

    // Check permission (admin and editor can delete tools)
    try {
      requirePermission(user, 'canEditEmailTemplates');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Editor role required to delete tools' },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Fetch tool to check if user is the creator
    const { data: tool, error: fetchError } = await supabase
      .from('tools')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    // Editors can only delete tools they created
    // Admins can delete any tool
    if (user.role === 'editor' && tool.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete tools you created' },
        { status: 403 }
      );
    }

    const { error } = await supabase.from('tools').delete().eq('id', id);

    if (error) {
      console.error('Error deleting tool:', error);
      return NextResponse.json(
        { error: 'Failed to delete tool' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
