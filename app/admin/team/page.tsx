import { createSupabaseServer } from '@/lib/supabase-server';
import { TeamTargetsTable } from '@/components/admin/team-targets-table';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.from('team_targets').select('*').order('created_at', { ascending: true });

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Team &amp; Targets</h2>
          <p>Monthly placement targets per partner. Achievement % calculates automatically.</p>
        </div>
      </div>
      <TeamTargetsTable rows={(data || []) as any} />
    </>
  );
}
