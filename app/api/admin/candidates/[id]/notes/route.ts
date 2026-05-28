import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

async function requireAdmin() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('is_admin, full_name').eq('id', user.id).single();
  if (!profile?.is_admin) return null;
  return { user, profile };
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const body = await req.json();
    const text = String(body?.text || '').trim();
    if (!text) return NextResponse.json({ error: 'note text is required' }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data: cur } = await supabase
      .from('candidates')
      .select('notes, timeline')
      .eq('id', params.id).single();

    const notes = Array.isArray(cur?.notes) ? cur!.notes : [];
    const timeline = Array.isArray(cur?.timeline) ? cur!.timeline : [];
    const by = auth.profile.full_name || 'Admin';

    notes.unshift({ id: 'n_' + Date.now(), ts: Date.now(), by, text });
    timeline.unshift({ id: 't_' + Date.now(), ts: Date.now(), event: 'Note added', by });

    const { error } = await supabase.from('candidates').update({
      notes, timeline, last_touch: new Date().toISOString(),
    }).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
