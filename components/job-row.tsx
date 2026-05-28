import Link from 'next/link';
import { ArrowRight, BarChart3, Briefcase, Clock } from 'lucide-react';
import { Job } from '@/types/database';
import { functionIcon } from '@/lib/format';
import * as LucideIcons from 'lucide-react';

export function JobRow({ job }: { job: Pick<Job, 'id'|'title'|'client_company'|'loc'|'type'|'experience'|'exp_level'|'fn'|'pay'|'pay_note'|'tags'> }) {
  const iconName = functionIcon(job.fn);
  const Icon = (LucideIcons as any)[
    iconName.split('-').map(s => s[0].toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.Briefcase;
  return (
    <Link className="job-row" href={`/jobs/${job.id}`}>
      <div className="job-logo job-logo-brand"><Icon size={18} /></div>
      <div className="col-title">
        <div className="job-title">{job.title}</div>
        <div className="job-company">Beetel Hire · {job.loc}</div>
      </div>
      <div className="job-meta col-meta">
        <span><Briefcase size={13} /> {job.type}</span>
        <span><Clock size={13} /> {job.experience || job.exp_level || ''}</span>
        {(job.tags || []).slice(0, 2).map(t => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
      <div className="job-pay col-pay">{job.pay}<div className="sub">{job.pay_note || ''}</div></div>
      <div className="job-action col-action"><ArrowRight size={14} /></div>
    </Link>
  );
}
