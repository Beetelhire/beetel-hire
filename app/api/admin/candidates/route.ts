// Admin: manually create a candidate.
// Accepts multipart/form-data so an optional resume file can be uploaded
// to the `resumes` bucket. Returns the new candidate's id and applied job
// mappings if any jobs were selected.

import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

const ALLOWED_SOURCES = new Set([
  'Inbound','Referral','LinkedIn','Naukri','Indeed','Website','Walk-in','Internal Database','Other',
]);

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
    const form = await req.formData();

    const name                = String(form.get('name')                || '').trim();
    const email               = String(form.get('email')               || '').trim().toLowerCase();
    const phone               = String(form.get('phone')               || '').trim();
    const location            = String(form.get('location')            || '').trim();
    const current_company     = String(form.get('current_company')     || '').trim();
    const current_designation = String(form.get('current_designation') || '').trim();
    const experienceYrsRaw    = form.get('experience_yrs');
    const skillsRaw           = String(form.get('skills')              || '').trim();
    const linkedin_url        = String(form.get('linkedin_url')        || '').trim();
    const source              = String(form.get('source')              || '').trim();
    const recruiter_id        = String(form.get('recruiter_id')        || '').trim();
    const notesRaw            = String(form.get('notes')               || '').trim();
    const jobIdsRaw           = String(form.get('job_ids')             || '').trim();
    const resume              = form.get('resume') as File | null;

    if (!name) return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!source) return NextResponse.json({ error: 'Source is required' }, { status: 400 });
    if (!ALLOWED_SOURCES.has(source)) return NextResponse.json({ error: 'Invalid source' }, { status: 400 });

    const experience_yrs = experienceYrsRaw && String(experienceYrsRaw).trim() !== ''
      ? Math.max(0, parseInt(String(experienceYrsRaw), 10)) || null
      : null;
    const experience = experience_yrs != null ? `${experience_yrs} yrs` : null;
    const skills = skillsRaw.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const jobIds = jobIdsRaw ? jobIdsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const supabase = createSupabaseAdmin();

    // Reject duplicate email
    const { data: existing } = await supabase.from('candidates').select('id').eq('email', email).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'A candidate with this email already exists' }, { status: 409 });
    }

    // Optional resume upload
    let resume_url: string | null = null;
    if (resume && resume instanceof File && resume.size > 0) {
      if (resume.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Resume must be under 10 MB' }, { status: 400 });
      }
      const ext = (resume.name.split('.').pop() || 'pdf').toLowerCase();
      const storagePath = `manual/${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;
      const arrayBuffer = await resume.arrayBuffer();
      const { error: uploadErr } = await supabase.storage
        .from('resumes')
        .upload(storagePath, arrayBuffer, {
          contentType: resume.type || 'application/octet-stream',
          upsert: false,
        });
      if (uploadErr) {
        console.error('Resume upload error:', uploadErr);
        return NextResponse.json({ error: 'Could not upload resume' }, { status: 500 });
      }
      resume_url = `resumes/${storagePath}`;
    }

    const nowIso = new Date().toISOString();
    const timeline = [{
      id: 't_' + Date.now(),
      ts: Date.now(),
      event: 'Added manually',
      by: auth.profile.full_name || 'Admin',
    }];
    const notes = notesRaw ? [{
      id: 'n_' + Date.now(),
      ts: Date.now(),
      by: auth.profile.full_name || 'Admin',
      text: notesRaw,
    }] : [];

    const { data: created, error: insErr } = await supabase
      .from('candidates')
      .insert({
        name,
        email,
        phone: phone || null,
        location: location || null,
        current_company: current_company || null,
        current_designation: current_designation || null,
        experience,
        experience_yrs,
        skills,
        focus: null,
        source,
        pool_status: 'Active',
        hire_status: 'Selected',
        freshness: 'Active',
        linkedin_url: linkedin_url || null,
        recruiter_id: recruiter_id || null,
        added_by: auth.user.id,
        resume_url,
        notes,
        timeline,
        last_touch: nowIso,
      })
      .select('id')
      .single();

    if (insErr) {
      console.error('candidate insert error:', insErr);
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // Optional: create candidate_job_mappings for selected jobs
    let mappingsCreated = 0;
    if (jobIds.length > 0) {
      const rows = jobIds.map(job_id => ({
        candidate_id: created.id,
        job_id,
        stage: 'Applied',
        recruiter_id: recruiter_id || null,
        source,
      }));
      const { error: mapErr, count } = await supabase
        .from('candidate_job_mappings')
        .insert(rows, { count: 'exact' });
      if (mapErr) {
        console.error('mapping insert error:', mapErr);
        // Non-fatal — candidate is created; mappings can be added later
      } else {
        mappingsCreated = count || rows.length;
      }
    }

    await logAudit({
      action: 'create',
      entityType: 'candidate',
      entityId: created.id,
      entityLabel: name,
      changes: { after: { name, email, source, jobs: jobIds.length } },
    });

    return NextResponse.json({ ok: true, id: created.id, mappingsCreated });
  } catch (e: any) {
    console.error('add candidate error:', e);
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
