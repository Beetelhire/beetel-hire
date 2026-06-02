// Admin: update or delete a team_member.

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

const ALLOWED_STATUS = new Set(['Active', 'Inactive']);
const EDITABLE_FIELDS = [
  'full_name','email','phone','role','department','designation','doj',
  'manager_id','profile_photo_url','status','employee_id',
] as const;

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    for (const k of EDITABLE_FIELDS) {
      if (k in body) {
        if (k === 'status' && body.status && !ALLOWED_STATUS.has(String(body.status))) {
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }
        const v = (body as any)[k];
        patch[k] = typeof v === 'string' ? v.trim() || null : v;
      }
    }
    if (typeof patch.email === 'string') patch.email = (patch.email as string).toLowerCase();
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('team_members')
      .update(patch)
      .eq('id', params.id)
      .select('id, full_name')
      .single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Email or employee ID already in use' }, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'update',
      entityType: 'team_member',
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
    const { data: existing } = await supabase.from('team_members').select('id, full_name').eq('id', params.id).single();
    const { error } = await supabase.from('team_members').delete().eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (existing) {
      await logAudit({
        action: 'delete',
        entityType: 'team_member',
        entityId: existing.id,
        entityLabel: existing.full_name,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
