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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });
  try {
    const body = await req.json();
    const allowed: any = {};
    if ('target' in body) allowed.target = Number(body.target) || 0;
    if ('achieved' in body) allowed.achieved = Number(body.achieved) || 0;
    if ('period' in body) allowed.period = body.period;
    if ('role' in body) allowed.role = body.role;
    if ('practice' in body) allowed.practice = body.practice;
    if ('name' in body) allowed.name = body.name;
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from('team_targets').update(allowed).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
