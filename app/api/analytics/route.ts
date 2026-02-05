import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';

// Cache analytics for 60 seconds to reduce database load
export const revalidate = 60;

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

    // Fetch all counts in parallel for better performance
    const [usersCount, documentsCount, templatesCount] = await Promise.all([
      // Count users (profiles)
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      
      // Count documents
      supabase
        .from('documents')
        .select('id', { count: 'exact', head: true }),
      
      // Count email templates
      supabase
        .from('email_templates')
        .select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      users: usersCount.count || 0,
      documents: documentsCount.count || 0,
      emailTemplates: templatesCount.count || 0,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
