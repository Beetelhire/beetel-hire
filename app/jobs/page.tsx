import { TopologyCanvas } from '@/components/topology-canvas';
import { createSupabaseServer } from '@/lib/supabase-server';
import { JobsFilteredList } from '@/components/jobs-filtered-list';

export const dynamic = 'force-dynamic';

export default async function JobsPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('jobs')
    .select('id, title, client_company, loc, type, experience, exp_level, fn, pay, pay_note, tags, status, posted_at, posted_platforms')
    .eq('status', 'live')
    .order('posted_at', { ascending: false });

  return (
    <main>
      <section className="jobs-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <TopologyCanvas id="topoJobs" variant="dim" density={0.55} maxDist={320} />
        <div className="container">
          <span className="t-eyebrow label reveal in"><span className="dot"></span>{data?.length || 0} live roles</span>
          <h1 className="t-display reveal in" style={{ marginBottom: 24 }}>
            Find your<br />
            next <span className="serif">chapter.</span>
          </h1>
          <p className="t-lead reveal in">Hand-picked roles from companies we know personally. No bait-and-switch postings, no ghost jobs.</p>
        </div>
      </section>

      <JobsFilteredList jobs={(data || []) as any} />
    </main>
  );
}
