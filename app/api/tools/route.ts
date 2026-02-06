import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

// GET all tools
export async function GET() {
  try {
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // First, fetch tools
    const { data: tools, error } = await supabase
      .from('tools')
      .select('id, name, url, description, created_by, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tools' },
        { status: 500 }
      );
    }

    // Then fetch creator profiles for all tools
    const creatorIds = [...new Set((tools || []).map(tool => tool.created_by))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', creatorIds);

    // Create a map of creator ID to profile
    const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

    // Attach creator info to each tool
    const toolsWithCreators = (tools || []).map(tool => ({
      ...tool,
      profiles: profilesMap.get(tool.created_by) || null,
    }));

    if (error) {
      console.error('Error fetching tools:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tools' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tools: toolsWithCreators });
  } catch (error) {
    console.error('Error in tools API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new tool
export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission (admin and editor can create tools)
    try {
      requirePermission(user, 'canEditEmailTemplates'); // Reusing this permission for editors/admins
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Editor role required to create tools' },
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    const { name, url, description } = requestBody;

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

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('tools')
      .insert({
        name,
        url,
        description: description || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tool:', error);
      return NextResponse.json(
        { error: 'Failed to create tool' },
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
