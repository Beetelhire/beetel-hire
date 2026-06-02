// Admin: create a candidate ↔ job pipeline mapping.
// Used when adding a candidate to a job from either the candidate drawer or the job page.

import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

const ALLOWED_STAGES = new Set(['Applied','Screening','Interview','Client Review','Offer','Hired','Rejected']);

async function requireAdmin() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('is_admin, full_name').eq('id', user.id).single();
  if (!profile?.is_admin) return null;
  return { user, profile };
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const body = await req.json();
    const candidate_id = String(body.candidate_id || '').trim();
    const job_id       = String(body.job_id       || '').trim();
    const stage        = String(body.stage        || 'Applied').trim();
    const recruiter_id = body.recruiter_id ? String(body.recruiter_id).trim() : null;
    const source       = body.source ? String(body.source).trim() : null;
    const notes        = body.notes  ? String(body.notes).trim()  : null;

    if (!candidate_id) return NextResponse.json({ error: 'candidate_id required' }, { status: 400 });
    if (!job_id) return NextResponse.json({ error: 'job_id required' }, { status: 400 });
    if (!ALLOWED_STAGES.has(stage)) return NextResponse.json({ error: 'invalid stage' }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('candidate_job_mappings')
      .insert({ candidate_id, job_id, stage, recruiter_id, source, notes })
      .select('id, candidate:candidates(name), job:jobs(title)')
      .single();

    if (error) {
      // 23505 = unique violation (candidate already on this job)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This candidate is already on this job' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'create',
      entityType: 'candidate_job_mapping',
      entityId: data.id,
      entityLabel: `${(data as any).candidate?.name || 'Candidate'} → ${(data as any).job?.title || 'Job'}`,
      changes: { after: { stage, recruiter_id, source } },
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
