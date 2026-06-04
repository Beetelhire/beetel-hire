// Tells crawlers what they can / cannot index, and where the sitemap lives.
// Available at https://beetelhire.in/robots.txt

import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://beetelhire.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        // Keep admin and API endpoints out of search results.
        disallow: ['/admin', '/admin/', '/api/', '/sign-in'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
