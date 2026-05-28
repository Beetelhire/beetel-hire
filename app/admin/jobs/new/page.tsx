import Link from 'next/link';
import { JobForm } from '@/components/admin/job-form';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewJobPage() {
  return (
    <>
      <div className="view-head">
        <div>
          <Link className="btn btn-ghost btn-sm" href="/admin/jobs" style={{ marginBottom: 10, paddingLeft: 0 }}>
            <ArrowLeft size={13} /> Back to jobs
          </Link>
          <h2>New job posting</h2>
          <p>Every field renders on the live <Link href="/jobs" style={{ color: 'var(--accent)' }}>/jobs</Link> listing and the full job detail page.</p>
        </div>
      </div>
      <JobForm mode="new" />
    </>
  );
}
