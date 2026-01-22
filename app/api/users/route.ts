import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';

// GET all users
export async function GET() {
  try {
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check manage users permission
    try {
      requirePermission(user, 'canManageUsers');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: User management permission required' },
        { status: 403 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get all users with their profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .order('id', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Note: Email is stored in auth.users, not profiles table
    const users = (profilesData || []).map((profile) => ({
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH user role
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check manage users permission
    try {
      requirePermission(user, 'canManageUsers');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: User management permission required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'UserId and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Prevent self-demotion from admin
    if (userId === user.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot change your own role from admin' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Update user role in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
