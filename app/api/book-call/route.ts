import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, role, hiring_for, urgency, message } = body || {};
    if (!name || !email || !company) {
      return NextResponse.json({ error: 'name, email, and company are required' }, { status: 400 });
    }
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from('meetings').insert({
      name, email, company,
      role: role || null,
      hiring_for: hiring_for || null,
      urgency: urgency || null,
      message: message || null,
      status: 'new',
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
