import { createSupabaseServer } from '@/lib/supabase-server';
import { AnalyticsView } from '@/components/admin/analytics-view';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const supabase = createSupabaseServer();
  const [{ data: jobs }, { data: team }, { data: targets }] = await Promise.all([
    supabase.from('jobs').select('id, title, client_company, pay, posted_at, status').order('posted_at', { ascending: false }),
    supabase.from('team_targets').select('*').order('created_at'),
    supabase.from('analytics_targets').select('*'),
  ]);
  return (
    <AnalyticsView
      jobs={(jobs || []) as any}
      team={(team || []) as any}
      targets={(targets || []) as any}
    />
  );
}
