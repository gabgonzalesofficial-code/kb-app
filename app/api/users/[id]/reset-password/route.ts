import { NextRequest, NextResponse } from 'next/server';
import { getUserWithProfile } from '@/lib/auth';
import { requirePermission } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase-admin';
import { ValidationError } from '@/lib/errors';

// POST reset user password (admin only)
export async function POST(
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
    const { newPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Use admin client to update user password
    const adminClient = createAdminClient();

    const { data, error } = await adminClient.auth.admin.updateUserById(id, {
      password: newPassword,
    });

    if (error) {
      console.error('Error resetting password:', error);
      return NextResponse.json(
        { error: 'Failed to reset password: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Error in reset password API:', error);

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
