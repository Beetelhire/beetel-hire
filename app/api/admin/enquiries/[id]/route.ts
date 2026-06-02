// Admin actions on a single contact_enquiries row.
// PATCH  — change status, edit notes
// DELETE — remove the row

import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';
import { logAudit } from '@/lib/audit';

export const runtime = 'nodejs';

const ALLOWED_STATUSES = new Set(['New', 'Contacted', 'Closed']);

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

    if (typeof body.status === 'string') {
      if (!ALLOWED_STATUSES.has(body.status)) {
        return NextResponse.json({ error: 'invalid status' }, { status: 400 });
      }
      patch.status = body.status;
    }
    if (typeof body.notes === 'string') {
      patch.notes = body.notes;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('contact_enquiries')
      .update(patch)
      .eq('id', params.id)
      .select('id, full_name, status')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logAudit({
      action: typeof body.status === 'string' ? 'status_change' : 'update',
      entityType: 'enquiry',
      entityId: data.id,
      entityLabel: data.full_name,
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
      .from('contact_enquiries')
      .select('id, full_name')
      .eq('id', params.id)
      .single();

    const { error } = await supabase.from('contact_enquiries').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (existing) {
      await logAudit({
        action: 'delete',
        entityType: 'enquiry',
        entityId: existing.id,
        entityLabel: existing.full_name,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
