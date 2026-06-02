// Admin: update or delete a single candidate ↔ job mapping.
// PATCH  — change stage / recruiter / notes
// DELETE — remove the row

import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

const ALLOWED_STAGES = new Set(['Applied','Screening','Interview','Client Review','Offer','Hired','Rejected']);

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
    const patch: Record<string, unknown> = {};

    if (typeof body.stage === 'string') {
      if (!ALLOWED_STAGES.has(body.stage)) {
        return NextResponse.json({ error: 'invalid stage' }, { status: 400 });
      }
      patch.stage = body.stage;
    }
    if ('recruiter_id' in body) patch.recruiter_id = body.recruiter_id || null;
    if (typeof body.notes === 'string') patch.notes = body.notes;
    if (typeof body.source === 'string') patch.source = body.source;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('candidate_job_mappings')
      .update(patch)
      .eq('id', params.id)
      .select('id, stage, candidate:candidates(name), job:jobs(title)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAudit({
      action: 'stage' in patch ? 'stage_change' : 'update',
      entityType: 'candidate_job_mapping',
      entityId: data.id,
      entityLabel: `${(data as any).candidate?.name || 'Candidate'} → ${(data as any).job?.title || 'Job'}`,
      changes: { after: patch },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const supabase = createSupabaseAdmin();
    const { data: existing } = await supabase
      .from('candidate_job_mappings')
      .select('id, candidate:candidates(name), job:jobs(title)')
      .eq('id', params.id)
      .single();

    const { error } = await supabase.from('candidate_job_mappings').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (existing) {
      await logAudit({
        action: 'delete',
        entityType: 'candidate_job_mapping',
        entityId: existing.id,
        entityLabel: `${(existing as any).candidate?.name || 'Candidate'} → ${(existing as any).job?.title || 'Job'}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
