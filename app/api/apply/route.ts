import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const job_id  = String(form.get('job_id')  || '');
    const name    = String(form.get('name')    || '').trim();
    const email   = String(form.get('email')   || '').trim().toLowerCase();
    const phone   = String(form.get('phone')   || '').trim();
    const location = String(form.get('location') || '').trim();
    const experienceYrsRaw = form.get('experience_yrs');
    const focus   = String(form.get('focus')   || '').trim();
    const skillsRaw = String(form.get('skills') || '').trim();
    const message = String(form.get('message') || '').trim();
    const resume  = form.get('resume') as File | null;

    if (!job_id || !name || !email) {
      return NextResponse.json({ error: 'name, email, and job_id are required' }, { status: 400 });
    }
    if (!resume || !(resume instanceof File) || resume.size === 0) {
      return NextResponse.json({ error: 'resume file is required' }, { status: 400 });
    }
    if (resume.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'resume file must be under 10 MB' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // 1. Verify the job exists + is live
    const { data: job, error: jobErr } = await supabase
      .from('jobs').select('id, status').eq('id', job_id).single();
    if (jobErr || !job) return NextResponse.json({ error: 'role not found' }, { status: 404 });
    if (job.status !== 'live') return NextResponse.json({ error: 'role is no longer accepting applications' }, { status: 400 });

    // 2. Upload the resume to Storage
    const ext = resume.name.split('.').pop() || 'pdf';
    const storagePath = `${job_id}/${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${ext}`;
    const arrayBuffer = await resume.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from('resumes')
      .upload(storagePath, arrayBuffer, {
        contentType: resume.type || 'application/octet-stream',
        upsert: false,
      });
    if (uploadErr) {
      console.error('Resume upload error:', uploadErr);
      return NextResponse.json({ error: 'could not upload resume — try again' }, { status: 500 });
    }
    const resume_url = `resumes/${storagePath}`;

    // 3. Upsert candidate by email
    const skills = skillsRaw.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
    const experience_yrs = experienceYrsRaw ? parseInt(String(experienceYrsRaw), 10) || null : null;
    const experience = experience_yrs != null ? `${experience_yrs} yrs` : null;
    const timelineEntry = { id: 't_' + Date.now(), ts: Date.now(), event: 'Applied', by: 'Candidate' };
    const noteEntry = message ? [{ id: 'n_' + Date.now(), ts: Date.now(), by: name, text: message }] : [];

    // First check whether this candidate already exists
    const { data: existing } = await supabase
      .from('candidates')
      .select('id, notes, timeline')
      .eq('email', email)
      .maybeSingle();

    let candidate_id: string;
    if (existing) {
      const mergedNotes = [...(noteEntry || []), ...((existing.notes as any[]) || [])];
      const mergedTimeline = [timelineEntry, ...((existing.timeline as any[]) || [])];
      const { data: updated, error: updErr } = await supabase
        .from('candidates')
        .update({
          name, phone: phone || null,
          location: location || null,
          experience, experience_yrs,
          skills: skills.length ? skills : undefined,
          focus: focus || null,
          resume_url,
          notes: mergedNotes,
          timeline: mergedTimeline,
          last_touch: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id').single();
      if (updErr) {
        console.error('candidate update error:', updErr);
        return NextResponse.json({ error: 'could not save your details' }, { status: 500 });
      }
      candidate_id = updated.id;
    } else {
      const { data: created, error: insErr } = await supabase
        .from('candidates')
        .insert({
          name, email, phone: phone || null,
          location: location || null,
          experience, experience_yrs,
          skills,
          focus: focus || null,
          source: 'Inbound',
          pool_status: 'Active',
          hire_status: 'Selected',
          freshness: 'Active',
          resume_url,
          notes: noteEntry,
          timeline: [timelineEntry],
        })
        .select('id').single();
      if (insErr) {
        console.error('candidate insert error:', insErr);
        return NextResponse.json({ error: 'could not save your application' }, { status: 500 });
      }
      candidate_id = created.id;
    }

    // 4. Create application (or no-op if it already exists due to unique constraint)
    const { error: appErr } = await supabase
      .from('applications')
      .insert({
        candidate_id, job_id, applied_at: new Date().toISOString(), status: 'Selected',
      });
    if (appErr && appErr.code !== '23505') { // 23505 = unique violation (already applied)
      console.error('application insert error:', appErr);
      return NextResponse.json({ error: 'could not record application' }, { status: 500 });
    }

    // 5. Bump the job's applicants_count
    const { data: jobAfter } = await supabase
      .from('jobs').select('applicants_count').eq('id', job_id).single();
    if (jobAfter) {
      await supabase.from('jobs').update({ applicants_count: (jobAfter.applicants_count || 0) + 1 }).eq('id', job_id);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('apply route error:', e);
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
