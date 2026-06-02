// Shared TypeScript types that mirror the Supabase schema.
// Keep these in sync with /sql or your Supabase Studio table definitions.

export type Theme = 'light' | 'dark';

export type ClientContact = {
  name: string;
  email: string;
  phone: string;
};

export type JobStatus = 'live' | 'review' | 'pending' | 'rejected';
export type JobType = 'On-site' | 'Hybrid' | 'Remote';
export type PostedPlatform = 'website' | 'linkedin' | 'instagram';

export type Job = {
  id: string;
  title: string;
  client_company: string;
  client_contact: ClientContact;
  loc: string;
  type: JobType;
  experience: string | null;
  exp_level: string | null;
  fn: string | null;
  pay: string | null;
  pay_note: string | null;
  tags: string[];
  skills: string[];
  status: JobStatus;
  posted_platforms: PostedPlatform[];
  posted_at: string;
  about: string | null;
  quote: string | null;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  company_desc: string | null;
  dept: string | null;
  reports_to: string | null;
  team_size: string | null;
  stack: string | null;
  on_call: string | null;
  partner_name: string | null;
  partner_role: string | null;
  applicants_count: number;
  created_at: string;
  updated_at: string;
};

export type PoolStatus = 'Active' | 'Inactive' | 'On Hold';
export type HireStatus = 'Onboarded' | 'Selected' | 'Dropped';

export type CandidateNote = { id: string; ts: number; by: string; text: string };
export type CandidateTimelineEvent = { id: string; ts: number; event: string; by: string };

export type CandidateSource =
  | 'Inbound'
  | 'Referral'
  | 'LinkedIn'
  | 'Naukri'
  | 'Indeed'
  | 'Website'
  | 'Walk-in'
  | 'Internal Database'
  | 'Other';

export const CANDIDATE_SOURCES: CandidateSource[] = [
  'Inbound',
  'Referral',
  'LinkedIn',
  'Naukri',
  'Indeed',
  'Website',
  'Walk-in',
  'Internal Database',
  'Other',
];

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  experience: string | null;
  experience_yrs: number | null;
  skills: string[];
  location: string | null;
  focus: string | null;
  source: string | null;
  current_company: string | null;
  current_designation: string | null;
  linkedin_url: string | null;
  recruiter_id: string | null;
  added_by: string | null;
  pool_status: PoolStatus;
  hire_status: HireStatus;
  freshness: string | null;
  availability: string | null;
  resume_url: string | null;
  notes: CandidateNote[];
  timeline: CandidateTimelineEvent[];
  last_touch: string;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  candidate_id: string;
  job_id: string;
  status: HireStatus;
  applied_at: string;
  created_at: string;
};

export type TeamTarget = {
  id: string;
  name: string;
  role: string | null;
  practice: string | null;
  period: string | null;
  target: number;
  achieved: number;
  created_at: string;
  updated_at: string;
};

export type AnalyticsTarget = {
  window_days: 15 | 30 | 45 | 60;
  target: number;
  achieved: number;
  updated_at: string;
};

export type SocialIntegration = {
  platform: 'linkedin' | 'instagram';
  connected: boolean;
  handle: string | null;
  encrypted_token: string | null;
  connected_at: string | null;
  updated_at: string;
};

export type Meeting = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  hiring_for: string | null;
  urgency: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  is_admin: boolean;
  created_at: string;
};

// ── Phase 1: new tables ─────────────────────────────────────

export type TeamMemberStatus = 'Active' | 'Inactive';

export type TeamMember = {
  id: string;
  auth_user_id: string | null;
  employee_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;                      // 'recruiter' | 'manager' | 'admin' | 'ops' | etc.
  department: string | null;
  designation: string | null;
  doj: string | null;                // ISO date
  manager_id: string | null;
  profile_photo_url: string | null;
  status: TeamMemberStatus;
  created_at: string;
  updated_at: string;
};

export type MonthlyPerformance = {
  id: string;
  team_member_id: string;
  month: string;                     // ISO date, first of month
  target_revenue: number;
  achieved_revenue: number;
  placements_made: number;
  interviews_scheduled: number;
  candidates_processed: number;
  notes: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactEnquiryStatus = 'New' | 'Contacted' | 'Closed';

export type ContactEnquiry = {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: ContactEnquiryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PipelineStage =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Client Review'
  | 'Offer'
  | 'Hired'
  | 'Rejected';

export const PIPELINE_STAGES: PipelineStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Client Review',
  'Offer',
  'Hired',
  'Rejected',
];

export type CandidateJobMapping = {
  id: string;
  candidate_id: string;
  job_id: string;
  stage: PipelineStage;
  recruiter_id: string | null;
  source: string | null;
  notes: string | null;
  added_at: string;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
};
