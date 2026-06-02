// Admin: create or upsert a monthly performance record for a team member.
// POST with { month: 'YYYY-MM-DD', target_revenue, achieved_revenue,
//             placements_made, interviews_scheduled, candidates_processed,
//             notes, completed }
// Upserts on (team_member_id, month).

import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

async function requireAdmin() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return null;
  return user;
}

function normalizeMonth(input: string): string | null {
  // Accept YYYY-MM or YYYY-MM-DD; always return first-of-month
  const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(input.trim());
  if (!m) return null;
  return `${m[1]}-${m[2]}-01`;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const body = await req.json();
    const monthIso = normalizeMonth(String(body.month || ''));
    if (!monthIso) return NextResponse.json({ error: 'Month is required (YYYY-MM)' }, { status: 400 });

    const row = {
      team_member_id:        params.id,
      month:                 monthIso,
      target_revenue:        Number(body.target_revenue)       || 0,
      achieved_revenue:      Number(body.achieved_revenue)     || 0,
      placements_made:       Number(body.placements_made)      || 0,
      interviews_scheduled:  Number(body.interviews_scheduled) || 0,
      candidates_processed:  Number(body.candidates_processed) || 0,
      notes:                 body.notes ? String(body.notes).trim() : null,
      completed:             body.completed === true,
    };

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('monthly_performance')
      .upsert(row, { onConflict: 'team_member_id,month' })
      .select('id, month, team_member:team_members(full_name)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAudit({
      action: 'update',
      entityType: 'monthly_performance',
      entityId: data.id,
      entityLabel: `${(data as any).team_member?.full_name || 'Member'} — ${monthIso}`,
      changes: { after: row },
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
