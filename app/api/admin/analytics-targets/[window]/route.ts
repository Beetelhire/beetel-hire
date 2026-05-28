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

export async function PATCH(req: Request, { params }: { params: { window: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });
  const win = parseInt(params.window, 10);
  if (![15, 30, 45, 60].includes(win)) return NextResponse.json({ error: 'invalid window' }, { status: 400 });

  try {
    const body = await req.json();
    const patch: any = { updated_at: new Date().toISOString() };
    if ('target' in body) patch.target = Number(body.target) || 0;
    if ('achieved' in body) patch.achieved = Number(body.achieved) || 0;

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from('analytics_targets').update(patch).eq('window_days', win);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
