import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { ApplyForm } from '@/components/apply-form';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ApplyPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();
  const { data: j } = await supabase
    .from('jobs')
    .select('id, title, client_company, loc, type, experience, fn, pay, status')
    .eq('id', params.id)
    .eq('status', 'live')
    .single();

  if (!j) notFound();

  return (
    <main>
      <section style={{ padding: '150px 0 60px', borderBottom: '1px solid var(--border)' }}>
        <div className="container-narrow">
          <div className="crumb">
            <Link href="/jobs">Jobs</Link>
            <ChevronRight size={13} />
            <Link href={`/jobs/${j.id}`}>{j.title}</Link>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--fg)' }}>Apply</span>
          </div>
          <h1 className="t-h1" style={{ margin: '24px 0 16px' }}>
            Apply for <span className="serif">{j.title}</span>
          </h1>
          <p className="t-lead" style={{ marginBottom: 0 }}>
            Beetel Hire · {j.loc} · {j.type} · {j.experience}
          </p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container-narrow">
          <ApplyForm jobId={j.id} jobTitle={j.title} />
        </div>
      </section>
    </main>
  );
}
