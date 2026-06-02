// Admin: update or delete a single monthly_performance row.

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

const NUMERIC_FIELDS = ['target_revenue','achieved_revenue','placements_made','interviews_scheduled','candidates_processed'] as const;

export async function PATCH(req: Request, { params }: { params: { id: string; recordId: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    for (const k of NUMERIC_FIELDS) {
      if (k in body) patch[k] = Number((body as any)[k]) || 0;
    }
    if ('notes'     in body) patch.notes     = body.notes ? String(body.notes).trim() : null;
    if ('completed' in body) patch.completed = body.completed === true;

    if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'nothing to update' }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('monthly_performance')
      .update(patch)
      .eq('id', params.recordId)
      .eq('team_member_id', params.id)
      .select('id, month')
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAudit({
      action: 'update',
      entityType: 'monthly_performance',
      entityId: data.id,
      entityLabel: `${data.month}`,
      changes: { after: patch },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; recordId: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const supabase = createSupabaseAdmin();
    const { data: existing } = await supabase
      .from('monthly_performance')
      .select('id, month')
      .eq('id', params.recordId)
      .eq('team_member_id', params.id)
      .single();
    const { error } = await supabase
      .from('monthly_performance')
      .delete()
      .eq('id', params.recordId)
      .eq('team_member_id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (existing) {
      await logAudit({
        action: 'delete',
        entityType: 'monthly_performance',
        entityId: existing.id,
        entityLabel: `${existing.month}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
