import { createServerSupabaseClient } from './supabase-server';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get the current user's session
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Get the current user with profile and role
 * Optimized to use a single Supabase client instance
 */
export async function getUserWithProfile(): Promise<UserProfile | null> {
  const supabase = await createServerSupabaseClient();
  
  // Get user and profile in parallel where possible
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  // Fetch user profile from profiles table (only the fields we need)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle(); // Use maybeSingle instead of single to avoid errors if profile doesn't exist

  if (profileError || !profile) {
    // If profiles table doesn't exist or profile not found, return basic user info
    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'viewer',
    };
  }

  return {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name,
    role: profile?.role || 'viewer',
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
}
