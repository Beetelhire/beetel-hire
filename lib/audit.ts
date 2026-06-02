// Audit-log helper. Server-only.
//
// Usage from any server action / API route:
//
//   import { logAudit } from '@/lib/audit';
//   await logAudit({
//     action: 'create',
//     entityType: 'candidate',
//     entityId: candidate.id,
//     entityLabel: candidate.name,
//     changes: { after: candidate },
//   });
//
// Writes via the service-role client so it bypasses RLS — audit_logs has
// no INSERT policy for authenticated users on purpose. We never throw out
// of this helper; auditing must not break the caller's primary action.

import { createSupabaseAdmin, createSupabaseServer } from './supabase-server';

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'status_change'
  | 'stage_change'
  | 'login'
  | 'logout'
  | 'export'
  | 'connect'
  | 'disconnect';

export type AuditEntityType =
  | 'candidate'
  | 'job'
  | 'team_member'
  | 'enquiry'
  | 'application'
  | 'candidate_job_mapping'
  | 'monthly_performance'
  | 'integration'
  | 'meeting';

export type LogAuditOptions = {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  entityLabel?: string | null;
  changes?: Record<string, unknown> | null;
};

export async function logAudit(opts: LogAuditOptions): Promise<void> {
  try {
    const supaUser = createSupabaseServer();
    const { data: { user } } = await supaUser.auth.getUser();

    let userEmail: string | null = null;
    let userName: string | null = null;
    if (user) {
      userEmail = user.email ?? null;
      const { data: profile } = await supaUser
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      userName = profile?.full_name ?? null;
    }

    const supaAdmin = createSupabaseAdmin();
    await supaAdmin.from('audit_logs').insert({
      user_id: user?.id ?? null,
      user_email: userEmail,
      user_name: userName,
      action: opts.action,
      entity_type: opts.entityType,
      entity_id: opts.entityId ?? null,
      entity_label: opts.entityLabel ?? null,
      changes: opts.changes ?? null,
    });
  } catch (err) {
    // Auditing must never break the user-facing action.
    // eslint-disable-next-line no-console
    console.error('[audit] failed to write log entry:', err);
  }
}
