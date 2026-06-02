// Admin: create a new team member.
// A team member does NOT automatically get an admin login — that has to be
// granted separately by inviting them through Supabase Auth and then linking
// auth_user_id on the team_members row.

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

export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });

  try {
    const body = await req.json();
    const full_name = String(body.full_name || '').trim();
    const email     = String(body.email     || '').trim().toLowerCase();
    const role      = String(body.role      || '').trim();
    const status    = String(body.status    || 'Active').trim();

    if (!full_name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email)     return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    if (!role)      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    if (!ALLOWED_STATUS.has(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

    const row: Record<string, unknown> = {
      full_name,
      email,
      role,
      status,
      employee_id:       body.employee_id      ? String(body.employee_id).trim()       : null,
      phone:             body.phone            ? String(body.phone).trim()             : null,
      department:        body.department       ? String(body.department).trim()        : null,
      designation:       body.designation      ? String(body.designation).trim()       : null,
      doj:               body.doj              ? String(body.doj).trim()               : null,
      manager_id:        body.manager_id       ? String(body.manager_id).trim()        : null,
      profile_photo_url: body.profile_photo_url ? String(body.profile_photo_url).trim() : null,
    };

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('team_members')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A team member with this email or employee ID already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      action: 'create',
      entityType: 'team_member',
      entityId: data.id,
      entityLabel: full_name,
      changes: { after: { full_name, email, role, status } },
    });

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
