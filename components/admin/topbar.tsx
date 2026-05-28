'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Moon, Sun, Plus } from 'lucide-react';
import { useTheme } from '../providers';
import Link from 'next/link';

const TITLES: Record<string, { crumb: string; title: string }> = {
  '/admin':              { crumb: "Admin workspace · Spring '26",   title: 'Pipeline overview' },
  '/admin/jobs':         { crumb: 'Admin workspace · Jobs',          title: 'Job postings'      },
  '/admin/jobs/new':     { crumb: 'Admin workspace · Jobs',          title: 'New job'           },
  '/admin/candidates':   { crumb: 'Admin workspace · Candidates',    title: 'Candidate pool'    },
  '/admin/applications': { crumb: 'Admin workspace · Applications',  title: 'Applications'      },
  '/admin/meetings':     { crumb: 'Admin workspace · Meetings',      title: 'Discovery calls'   },
  '/admin/analytics':    { crumb: 'Admin workspace · Analytics',     title: 'Analytics'         },
  '/admin/pipeline':     { crumb: 'Admin workspace · Pipeline',      title: 'Hiring pipeline'   },
  '/admin/companies':    { crumb: 'Admin workspace · Companies',     title: 'Companies'         },
  '/admin/team':         { crumb: 'Admin workspace · Team',          title: 'Team & targets'    },
  '/admin/settings':     { crumb: 'Admin workspace · Settings',      title: 'Settings'          },
};

export function AdminTopBar() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  // Find the most specific matching path
  const matched = Object.keys(TITLES)
    .filter(k => pathname === k || (k !== '/admin' && pathname.startsWith(k)))
    .sort((a, b) => b.length - a.length)[0];
  const meta = TITLES[matched || '/admin'];

  return (
    <header className="app-topbar">
      <div>
        <div className="crumb-app">{meta.crumb}</div>
        <h2>{meta.title}</h2>
      </div>
      <div className="right">
        <div className="search-mini">
          <Search style={{ width: 14, height: 14 }} />
          <span>Search anything</span>
          <span className="kbd" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '2px 6px', background: 'var(--bg-elev-2)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--fg-subtle)' }}>⌘ K</span>
        </div>
        <button className="btn btn-icon-sq btn-secondary" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
        </button>
        <button className="btn btn-icon-sq btn-secondary" aria-label="Notifications"><Bell style={{ width: 14, height: 14 }} /></button>
        <Link className="btn btn-primary btn-sm" href="/admin/jobs/new"><Plus size={13} /> New job</Link>
      </div>
    </header>
  );
}
