'use client';

import { useMemo, useState, useEffect } from 'react';
import { Job } from '@/types/database';
import { JobRow } from './job-row';
import { Search, X, MapPin, Clock, Briefcase, Calendar, SlidersHorizontal, ChevronsUpDown, ChevronDown } from 'lucide-react';

type J = Pick<Job, 'id'|'title'|'client_company'|'loc'|'type'|'experience'|'exp_level'|'fn'|'pay'|'pay_note'|'tags'|'status'|'posted_at'|'posted_platforms'>;

const POSTED_OPTIONS = [
  { value: 'today',  label: 'Today',         minDays: 0,  maxDays: 1 },
  { value: '1d',     label: '1 day ago',     minDays: 1,  maxDays: 2 },
  { value: '2d',     label: '2 days ago',    minDays: 2,  maxDays: 3 },
  { value: '3d',     label: '3 days ago',    minDays: 3,  maxDays: 4 },
  { value: 'week',   label: 'This week',     minDays: 4,  maxDays: 8 },
  { value: 'month',  label: 'This month',    minDays: 8,  maxDays: 31 },
  { value: 'older',  label: 'Older',         minDays: 31, maxDays: Infinity },
] as const;

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'pay',    label: 'Highest pay' },
] as const;

function ageDays(ts: string) { return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000); }
function matchesPosted(j: J, v: string) {
  const o = POSTED_OPTIONS.find(o => o.value === v);
  if (!o) return true;
  const a = ageDays(j.posted_at);
  return a >= o.minDays && a < o.maxDays;
}
function extractPay(p: string | null) {
  if (!p) return 0;
  const m = p.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function uniqLocs(jobs: J[]): string[] {
  const s = new Set<string>();
  jobs.forEach(j => (j.loc || '').split(/\s*[\/·,]\s*/).forEach(p => {
    const c = p.trim().replace(/\s*\(.*\)$/, '');
    if (c) s.add(c);
  }));
  return [...s].sort();
}

export function JobsFilteredList({ jobs: allJobs }: { jobs: J[] }) {
  const [search, setSearch]         = useState('');
  const [loc, setLoc]               = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [type, setType]             = useState<string | null>(null);
  const [posted, setPosted]         = useState<string | null>(null);
  const [sort, setSort]             = useState<'newest'|'oldest'|'pay'>('newest');
  const [openPopover, setOpenPopover] = useState<string | null>(null);
  const [sideOpen, setSideOpen] = useState(false);

  // close popover on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.filter-chip, .chip-popover')) setOpenPopover(null);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const locOptions  = useMemo(() => uniqLocs(allJobs), [allJobs]);
  const expOptions  = useMemo(() => [...new Set(allJobs.map(j => j.experience).filter(Boolean))] as string[], [allJobs]);
  const typeOptions = useMemo(() => ['On-site','Hybrid','Remote'].filter(v => allJobs.some(j => j.type === v)), [allJobs]);
  const postedOpts  = useMemo(() => POSTED_OPTIONS.filter(o => allJobs.some(j => matchesPosted(j, o.value))), [allJobs]);

  function match(j: J, ignore?: Partial<Record<'search'|'loc'|'experience'|'type'|'posted', true>>) {
    if (!ignore?.search && search) {
      const q = search.toLowerCase();
      const hay = `${j.title} ${j.client_company} ${j.loc} ${(j.tags||[]).join(' ')} ${j.experience||''} ${j.type||''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (!ignore?.loc && loc && !(j.loc || '').toLowerCase().includes(loc.toLowerCase())) return false;
    if (!ignore?.experience && experience && j.experience !== experience) return false;
    if (!ignore?.type && type && j.type !== type) return false;
    if (!ignore?.posted && posted && !matchesPosted(j, posted)) return false;
    return true;
  }

  const filtered = useMemo(() => {
    let arr = allJobs.filter(j => match(j));
    if (sort === 'newest') arr.sort((a,b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
    else if (sort === 'oldest') arr.sort((a,b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime());
    else arr.sort((a,b) => extractPay(b.pay) - extractPay(a.pay));
    return arr;
  }, [allJobs, search, loc, experience, type, posted, sort]);

  function countFor(filterKey: 'loc'|'experience'|'type'|'posted', value: string) {
    return allJobs.filter(j => {
      if (!match(j, { [filterKey]: true })) return false;
      if (filterKey === 'loc') return (j.loc || '').toLowerCase().includes(value.toLowerCase());
      if (filterKey === 'experience') return j.experience === value;
      if (filterKey === 'type') return j.type === value;
      if (filterKey === 'posted') return matchesPosted(j, value);
      return false;
    }).length;
  }

  const sortLabel = SORT_OPTIONS.find(o => o.key === sort)?.label || 'Newest';
  const activeFilters = [
    search ? { k: 'search', label: `"${search}"` } : null,
    loc ? { k: 'loc', label: loc } : null,
    experience ? { k: 'experience', label: experience } : null,
    type ? { k: 'type', label: type } : null,
    posted ? { k: 'posted', label: POSTED_OPTIONS.find(o => o.value === posted)?.label || posted } : null,
  ].filter(Boolean) as { k: string; label: string }[];

  function clearOne(k: string) {
    if (k === 'search') setSearch('');
    if (k === 'loc') setLoc(null);
    if (k === 'experience') setExperience(null);
    if (k === 'type') setType(null);
    if (k === 'posted') setPosted(null);
  }
  function clearAll() {
    setSearch(''); setLoc(null); setExperience(null); setType(null); setPosted(null);
  }

  function chipPopover(key: 'loc'|'experience'|'type'|'posted', label: string, icon: React.ReactNode, options: any[], currentValue: string | null, setValue: (v: string | null) => void) {
    return (
      <div className="filter-chip-wrap">
        <button
          className={`filter-chip${currentValue ? ' active' : ''}`}
          onClick={(e) => { e.stopPropagation(); setOpenPopover(openPopover === key ? null : key); }}
        >
          {icon}
          <span className="chip-label">{currentValue ? (key === 'posted' ? options.find((o:any) => o.value === currentValue)?.label : currentValue) : label}</span>
          <span className="count">{options.length}</span>
        </button>
        <div className={`chip-popover${openPopover === key ? ' open' : ''}`}>
          <button className={!currentValue ? 'active' : ''} onClick={() => { setValue(null); setOpenPopover(null); }}>All <span className="ct">{allJobs.filter(j => match(j, { [key]: true })).length}</span></button>
          {options.map((o: any) => {
            const v = typeof o === 'string' ? o : o.value;
            const lab = typeof o === 'string' ? o : o.label;
            return (
              <button key={v} className={currentValue === v ? 'active' : ''} onClick={() => { setValue(v); setOpenPopover(null); }}>
                {lab} <span className="ct">{countFor(key, v)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Filter bar */}
      <div className="filter-bar reveal in">
        <div className="search">
          <Search size={16} style={{ color: 'var(--fg-subtle)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search roles, companies, or skills…"
            autoComplete="off"
          />
          {search && <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search"><X size={13} /></button>}
        </div>

        {chipPopover('loc',        'Location',   <MapPin size={13} />,  locOptions,  loc,        setLoc as any)}
        {chipPopover('experience', 'Experience', <Clock size={13} />,   expOptions,  experience, setExperience as any)}
        {chipPopover('type',       'Type',       <Briefcase size={13} />, typeOptions, type,     setType as any)}
        {chipPopover('posted',     'Posted',     <Calendar size={13} />, postedOpts,  posted,    setPosted as any)}

        <button className="filter-chip" id="filtersMobileToggle" style={{ color: 'var(--fg)' }} onClick={() => setSideOpen(true)}>
          <SlidersHorizontal size={14} /> All filters
        </button>
      </div>

      <div className="jobs-pagewrap" style={{ marginBottom: 120 }}>
        {/* Sidebar (also opens as drawer on mobile) */}
        <aside className={`jobs-side${sideOpen ? ' open' : ''}`}>
          <div className="jobs-side-head">
            <h5>Filters</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {activeFilters.length > 0 && <button className="jobs-side-clear" onClick={clearAll}>Clear all</button>}
              <button className="jobs-side-close" onClick={() => setSideOpen(false)} aria-label="Close filters"><X size={14} /></button>
            </div>
          </div>
          <SideGroup title="Location"   options={locOptions}                          value={loc}        setValue={setLoc}        countFor={(v) => countFor('loc', v)} />
          <SideGroup title="Experience" options={expOptions}                          value={experience} setValue={setExperience} countFor={(v) => countFor('experience', v)} />
          <SideGroup title="Type"       options={typeOptions}                         value={type}       setValue={setType}       countFor={(v) => countFor('type', v)} />
          <SideGroup title="Posted"     options={postedOpts.map(o => ({ value: o.value, label: o.label }))} value={posted}     setValue={setPosted}     countFor={(v) => countFor('posted', v)} />
        </aside>

        {/* Result column */}
        <div>
          <div className="jobs-result-bar">
            <div className="t-small">Showing <span id="jobsCount" style={{ color: 'var(--fg)', fontWeight: 500 }}>{filtered.length}</span> roles</div>
            <div className="active-filters">
              {activeFilters.map(f => (
                <button key={f.k} className="active-filter" onClick={() => clearOne(f.k)}>
                  {f.label} <X size={12} />
                </button>
              ))}
              {activeFilters.length > 1 && (
                <button className="active-filter-clear-all" onClick={clearAll}>Clear all</button>
              )}
            </div>
            <div className="t-small jobs-sort-wrap">
              Sort by
              <button className="btn btn-sm btn-secondary" onClick={() => {
                const i = SORT_OPTIONS.findIndex(o => o.key === sort);
                setSort(SORT_OPTIONS[(i + 1) % SORT_OPTIONS.length].key);
              }}>
                <span className="sort-label">{sortLabel}</span>
                <ChevronsUpDown size={12} />
              </button>
            </div>
          </div>

          <div className="jobs-list">
            {filtered.map(j => <JobRow key={j.id} job={j as any} />)}
          </div>

          {filtered.length === 0 && (
            <div className="empty" style={{ marginTop: 24 }}>
              <h4>No roles match these filters</h4>
              <p>Try clearing a filter, broadening your search, or check back later.</p>
              <button className="btn btn-secondary btn-sm" onClick={clearAll}><X size={13} /> Clear filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SideGroup({ title, options, value, setValue, countFor }: {
  title: string; options: any[]; value: string | null; setValue: (v: string | null) => void;
  countFor: (v: string) => number;
}) {
  return (
    <div className="group">
      <h6>{title}</h6>
      <div>
        {options.map((o: any) => {
          const v = typeof o === 'string' ? o : o.value;
          const lab = typeof o === 'string' ? o : o.label;
          return (
            <div key={v} className={`opt${value === v ? ' active' : ''}`} onClick={() => setValue(value === v ? null : v)}>
              {lab} <span className="ct">{countFor(v)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
