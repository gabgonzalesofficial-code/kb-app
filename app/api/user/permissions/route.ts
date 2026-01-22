import { NextResponse } from 'next/server';
import { getUserWithProfile } from '@/lib/auth';
import { getUserPermissions } from '@/lib/permissions';

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
