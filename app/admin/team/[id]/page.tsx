import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase-server';
import { TeamMemberProfile } from '@/components/admin/team-member-profile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TeamMemberDetailPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();

  const { data: member } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', params.id)
    .single();
  if (!member) notFound();

  const [recordsRes, mappingsRes, candsRes, allMembersRes] = await Promise.all([
    supabase.from('monthly_performance').select('*').eq('team_member_id', params.id).order('month'),
    supabase.from('candidate_job_mappings').select('job:jobs(id, status)').eq('recruiter_id', params.id),
    supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('recruiter_id', params.id),
    supabase.from('team_members').select('id, full_name'),
  ]);

  const records = recordsRes.data || [];
  const mappings = (mappingsRes.data || []) as any[];
  const allMembers = (allMembersRes.data || []) as any[];

  const activeJobIds = new Set<string>();
  mappings.forEach((m: any) => {
    if (m.job?.id && m.job?.status === 'live') activeJobIds.add(m.job.id);
  });

  const managerName = member.manager_id
    ? (allMembers.find((m: any) => m.id === member.manager_id)?.full_name || null)
    : null;

  // For "Edit" modal: list of potential managers (excluding self)
  const managers = allMembers.filter((m: any) => m.id !== member.id);

  return (
    <TeamMemberProfile
      member={member as any}
      records={records as any}
      managerName={managerName}
      managers={managers}
      activeJobs={activeJobIds.size}
      candidatesManaged={candsRes.count || 0}
    />
  );
}
