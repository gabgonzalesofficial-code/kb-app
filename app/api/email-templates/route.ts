import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

// GET all email templates
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

    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('id, name, subject, body, created_by, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching email templates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch email templates' },
        { status: 500 }
      );
    }

    return NextResponse.json({ templates: templates || [] });
  } catch (error) {
    console.error('Error in email templates API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new email template
export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission (admin and editor can create templates)
    try {
      requirePermission(user, 'canEditEmailTemplates');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Editor role required to create email templates' },
        { status: 403 }
      );
    }

    const requestBody = await request.json();
    const { name, subject, body } = requestBody;

    if (!name || !subject || !body) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name,
        subject,
        body,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating email template:', error);
      return NextResponse.json(
        { error: 'Failed to create email template' },
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
