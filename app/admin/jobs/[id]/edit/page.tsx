import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { JobForm } from '@/components/admin/job-form';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditJobPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();
  const { data: j } = await supabase.from('jobs').select('*').eq('id', params.id).single();
  if (!j) notFound();

  return (
    <>
      <div className="view-head">
        <div>
          <Link className="btn btn-ghost btn-sm" href={`/admin/jobs/${j.id}`} style={{ marginBottom: 10, paddingLeft: 0 }}>
            <ArrowLeft size={13} /> Back to job
          </Link>
          <h2>Edit role</h2>
          <p>Changes go live immediately on the public site.</p>
        </div>
      </div>
      <JobForm mode="edit" initial={j as any} />
    </>
  );
}
