// Generates a short-lived signed URL so admin can download a candidate's CV
// from the private `resumes` storage bucket.

import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

async function requireAdmin() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return null;
  return user;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  const supabase = createSupabaseAdmin();
  const { data: c } = await supabase.from('candidates').select('resume_url').eq('id', params.id).single();
  if (!c?.resume_url) return NextResponse.json({ error: 'no resume on file' }, { status: 404 });

  // resume_url format: "resumes/<path>"
  const [bucket, ...rest] = c.resume_url.split('/');
  const path = rest.join('/');
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
  if (error || !data) return NextResponse.json({ error: 'could not sign URL' }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
