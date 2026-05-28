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

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const body = await req.json();
    const supabase = createSupabaseAdmin();

    // If hire_status is changing, append a timeline entry
    if (body.hire_status) {
      const { data: cur } = await supabase.from('candidates').select('timeline, hire_status').eq('id', params.id).single();
      if (cur && cur.hire_status !== body.hire_status) {
        const timeline = Array.isArray(cur.timeline) ? cur.timeline : [];
        timeline.unshift({
          id: 't_' + Date.now(),
          ts: Date.now(),
          event: `Status changed to ${body.hire_status}`,
          by: auth.profile.full_name || 'Admin',
        });
        body.timeline = timeline;
        body.last_touch = new Date().toISOString();
      }
    }

    const { error } = await supabase.from('candidates').update(body).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also sync the latest application's status to match
    if (body.hire_status) {
      await supabase.from('applications').update({ status: body.hire_status }).eq('candidate_id', params.id);
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
