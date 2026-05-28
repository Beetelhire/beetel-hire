// Server-side Supabase clients.
// Two flavors:
//   - createSupabaseServer(): uses the user's auth cookie.
//   - createSupabaseAdmin():  uses the SERVICE_ROLE key. Full DB access — only in server code.

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createSupabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In server components (during render) writing cookies is a no-op.
          // In route handlers / server actions, cookieStore.set is callable.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            /* read-only context (rendering a server component) — ignore */
          }
        },
      },
    }
  );
}

// Use for privileged inserts (anonymous candidate apply / book-a-call) or admin-only writes from API routes.
export function createSupabaseAdmin() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
