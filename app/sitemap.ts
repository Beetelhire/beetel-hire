// Dynamic sitemap for Google + Bing + other crawlers.
// Includes static marketing pages and every live job.
// Available at https://beetelhire.in/sitemap.xml

import type { MetadataRoute } from 'next';
import { createSupabaseServer } from '@/lib/supabase-server';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://beetelhire.in';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static marketing pages
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,            lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/about`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/industries`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/jobs`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/contact`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/sign-in`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ];

  // Live jobs — each one gets its own crawlable URL
  let jobUrls: MetadataRoute.Sitemap = [];
  try {
    const supabase = createSupabaseServer();
    const { data } = await supabase
      .from('jobs')
      .select('id, posted_at, updated_at')
      .eq('status', 'live');
    jobUrls = (data || []).map((j: any) => ({
      url: `${BASE}/jobs/${j.id}`,
      lastModified: j.updated_at ? new Date(j.updated_at) : new Date(j.posted_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch {
    /* if Supabase is unreachable at build time, fall back to just static URLs */
  }

  return [...staticUrls, ...jobUrls];
}
