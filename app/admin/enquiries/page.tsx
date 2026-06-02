// Admin → Contact Enquiries.
// Server-rendered list of contact_enquiries with client-side filter/search/status updates.

import { createSupabaseServer } from '@/lib/supabase-server';
import { EnquiriesView } from '@/components/admin/enquiries-view';
import type { ContactEnquiry } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EnquiriesPage() {
  const supabase = createSupabaseServer();
  const { data } = await supabase
    .from('contact_enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  const rows = (data || []) as ContactEnquiry[];

  return (
    <>
      <div className="view-head">
        <div>
          <h2>Contact Enquiries</h2>
          <p>
            Inquiries submitted via the <em>Contact Us</em> page on the marketing site.
            Triage by status — anything still <strong style={{ color: 'var(--fg)' }}>New</strong> needs a reply.
          </p>
        </div>
      </div>

      <EnquiriesView initial={rows} />
    </>
  );
}
