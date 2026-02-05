import { NextResponse } from 'next/server';
import { getUserWithProfile } from '@/lib/auth';
import { getUserPermissions } from '@/lib/permissions';

// Cache permissions for 60 seconds to reduce database queries
export const revalidate = 60;

export async function GET() {
  try {
    const user = await getUserWithProfile();
    const permissions = getUserPermissions(user);

    return NextResponse.json({
      permissions,
      role: user?.role || null,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
