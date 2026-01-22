import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase-admin';
import { validateEmail, validateRequired } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';

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

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const user = await getUserWithProfile();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check manage users permission (admin only)
    try {
      requirePermission(user, 'canManageUsers');
    } catch (error) {
      return NextResponse.json(
        { error: 'Forbidden: Admin permission required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, full_name, role } = body;

    // Validate required fields
    try {
      validateRequired({ email, password, role }, ['email', 'password', 'role']);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      throw error;
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, editor, or viewer' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Use admin client to create user
    const adminClient = createAdminClient();

    // Create user in auth.users
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: full_name || null,
      },
    });

    if (authError) {
      console.error('Error creating user:', authError);
      
      // Handle duplicate email
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create user: ' + authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create profile for the new user
    const supabase = await createServerSupabaseClient();
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: full_name || null,
        role: role,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      
      // If profile creation fails, try to delete the auth user
      await adminClient.auth.admin.deleteUser(authData.user.id);
      
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profileData.full_name,
        role: profileData.role,
      },
    });
  } catch (error) {
    console.error('Error in users API:', error);
    
    if (error instanceof Error && error.message.includes('Missing Supabase admin credentials')) {
      return NextResponse.json(
        { error: 'Server configuration error: Admin credentials not set' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
