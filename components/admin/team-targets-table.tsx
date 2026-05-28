'use client';

import { useState } from 'react';
import { TeamTarget } from '@/types/database';
import { pickGrad, logoLetter, pctClass } from '@/lib/helpers';

export function TeamTargetsTable({ rows: initial }: { rows: TeamTarget[] }) {
  const [rows, setRows] = useState(initial);
  const debounceRef = new Map<string, ReturnType<typeof setTimeout>>();

  function update(id: string, field: 'target' | 'achieved', value: number) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    // debounce the network call
    const k = id + ':' + field;
    if (debounceRef.get(k)) clearTimeout(debounceRef.get(k)!);
    debounceRef.set(k, setTimeout(async () => {
      try {
        await fetch(`/api/admin/team-targets/${id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ [field]: value }),
        });
      } catch {}
    }, 400));
  }

  if (!rows.length) {
    return <div className="empty"><h4>No team targets set</h4><p>Add team members in the database to begin tracking targets.</p></div>;
  }

  return (
    <div className="panel">
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>Period</th>
            <th style={{ textAlign: 'right' }}>Target</th>
            <th style={{ textAlign: 'right' }}>Achieved</th>
            <th style={{ minWidth: 200 }}>Achievement</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(t => {
            const pct = t.target > 0 ? Math.round((t.achieved / t.target) * 100) : 0;
            const cls = pctClass(pct);
            return (
              <tr key={t.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: pickGrad(t.name), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>{logoLetter(t.name)}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div className="small">{t.practice || ''}</div>
                    </div>
                  </div>
                </td>
                <td>{t.role}</td>
                <td><span className="small">{t.period || ''}</span></td>
                <td style={{ textAlign: 'right' }}>
                  <input
                    className="cell-input"
                    type="number"
                    min={0}
                    value={t.target}
                    onChange={e => update(t.id, 'target', parseInt(e.target.value, 10) || 0)}
                  />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <input
                    className="cell-input"
                    type="number"
                    min={0}
                    value={t.achieved}
                    onChange={e => update(t.id, 'achieved', parseInt(e.target.value, 10) || 0)}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className={`progress ${cls}`} style={{ flex: 1 }}><span style={{ width: `${Math.min(100, pct)}%` }} /></div>
                      <div className={`pct-label ${cls}`} style={{ minWidth: 48, textAlign: 'right' }}>{pct}%</div>
                    </div>
                    <div className="team-calc">
                      <span className="lbl">Calc</span>
                      <span>{t.achieved}</span>
                      <span className="op">/</span>
                      <span>{t.target}</span>
                      <span className="op">×</span>
                      <span className="op">100</span>
                      <span className="equals">=</span>
                      <span className={`result pct-label ${cls}`}>{pct}%</span>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
