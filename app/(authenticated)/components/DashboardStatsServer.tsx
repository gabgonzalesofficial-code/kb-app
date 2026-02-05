import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserWithProfile } from '@/lib/auth';
import DashboardStatsClient from './DashboardStatsClient';

interface DashboardStats {
  users: number;
  documents: number;
  emailTemplates: number;
}

export default async function DashboardStatsServer() {
  // Fetch stats server-side for better performance
  const user = await getUserWithProfile();
  if (!user) {
    return null;
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

  const stats: DashboardStats = {
    users: usersCount.count || 0,
    documents: documentsCount.count || 0,
    emailTemplates: templatesCount.count || 0,
  };

  return <DashboardStatsClient stats={stats} />;
}
