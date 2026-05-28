import { createSupabaseServer } from '@/lib/supabase-server';
import { SettingsView } from '@/components/admin/settings-view';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createSupabaseServer();
  const { data: integrations } = await supabase.from('social_integrations').select('*');

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Settings</h2>
          <p>Workspace preferences, integrations, and admin controls.</p>
        </div>
      </div>
      <SettingsView integrations={(integrations || []) as any} />
    </>
  );
}
