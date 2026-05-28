// Connect / disconnect a social media integration (LinkedIn, Instagram).
// Tokens are encrypted at rest using INTEGRATION_TOKEN_ENCRYPTION_KEY.

import { NextResponse } from 'next/server';
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server';
import crypto from 'node:crypto';

export const runtime = 'nodejs';

async function requireAdmin() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return null;
  return user;
}

function encryptToken(plaintext: string): string {
  const keyHex = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY;
  if (!keyHex) return plaintext;  // dev fallback — not safe for prod
  let key: Buffer;
  try {
    if (keyHex.length === 64) {
      key = Buffer.from(keyHex, 'hex');
    } else {
      // hash to 32 bytes
      key = crypto.createHash('sha256').update(keyHex).digest();
    }
  } catch {
    return plaintext;
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

const ALLOWED = ['linkedin', 'instagram'] as const;

export async function POST(req: Request, { params }: { params: { platform: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });
  if (!ALLOWED.includes(params.platform as any)) return NextResponse.json({ error: 'invalid platform' }, { status: 400 });

  try {
    const body = await req.json();
    const handle = String(body?.handle || '').trim();
    const token  = String(body?.token  || '').trim();
    if (!handle || !token) return NextResponse.json({ error: 'handle and token are required' }, { status: 400 });

    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from('social_integrations')
      .update({
        connected: true,
        handle,
        encrypted_token: encryptToken(token),
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('platform', params.platform);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { platform: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'not authorized' }, { status: 401 });
  if (!ALLOWED.includes(params.platform as any)) return NextResponse.json({ error: 'invalid platform' }, { status: 400 });

  try {
    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from('social_integrations')
      .update({
        connected: false,
        handle: null,
        encrypted_token: null,
        connected_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('platform', params.platform);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'unknown' }, { status: 500 });
  }
}
