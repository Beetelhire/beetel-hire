// Public Contact Us form submissions land here.
// Writes to public.contact_enquiries via the service-role admin client
// (the table also has an anon insert policy as a belt-and-braces fallback).

import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

type Body = {
  full_name?: string;
  company_name?: string | null;
  email?: string;
  phone?: string | null;
  subject?: string | null;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const full_name = (body.full_name || '').trim();
    const email     = (body.email     || '').trim();
    const message   = (body.message   || '').trim();

    if (!full_name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    if (!email || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from('contact_enquiries')
      .insert({
        full_name,
        company_name: body.company_name ? String(body.company_name).trim() : null,
        email,
        phone:        body.phone        ? String(body.phone).trim()        : null,
        subject:      body.subject      ? String(body.subject).trim()      : null,
        message,
        status: 'New',
      })
      .select('id')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
