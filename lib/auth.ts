// Auth helpers — checks whether the current user is an admin.

import { createSupabaseServer } from './supabase-server';

export async function getCurrentUser() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) return null;
  return profile;
}
