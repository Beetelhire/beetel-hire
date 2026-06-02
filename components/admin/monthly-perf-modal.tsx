'use client';

// Modal for adding / editing a monthly_performance row.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, Loader2 } from 'lucide-react';
import { showToast } from '../toast';
import type { MonthlyPerformance } from '@/types/database';

type Props = {
  open: boolean;
  onClose: () => void;
  teamMemberId: string;
  record?: MonthlyPerformance | null;       // omit to add a new month
  presetMonth?: string;                     // YYYY-MM-DD (first of month) when adding
};

const EMPTY = {
  month: '',
  target_revenue: '',
  achieved_revenue: '',
  placements_made: '',
  interviews_scheduled: '',
  candidates_processed: '',
  notes: '',
  completed: false,
};

function toMonthInput(iso: string): string {
  // 'YYYY-MM-DD' → 'YYYY-MM' (for <input type="month">)
  return iso ? iso.slice(0, 7) : '';
}

export function MonthlyPerfModal({ open, onClose, teamMemberId, record, presetMonth }: Props) {
  const router = useRouter();
  const [vals, setVals] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!record;

  useEffect(() => {
    if (!open) return;
    if (record) {
      setVals({
        month: toMonthInput(record.month),
        target_revenue:       String(record.target_revenue       || ''),
        achieved_revenue:     String(record.achieved_revenue     || ''),
        placements_made:      String(record.placements_made      || ''),
        interviews_scheduled: String(record.interviews_scheduled || ''),
        candidates_processed: String(record.candidates_processed || ''),
        notes:                record.notes || '',
        completed:            record.completed,
      });
    } else {
      const m = presetMonth ? toMonthInput(presetMonth) : (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      })();
      setVals({ ...EMPTY, month: m });
    }
  }, [open, record, presetMonth]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && open) onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function setField<K extends keyof typeof EMPTY>(k: K, v: any) {
    setVals(prev => ({ ...prev, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vals.month) return showToast('Pick a month', 'error');

    setSaving(true);
    try {
      const body = {
        month: vals.month,
        target_revenue: Number(vals.target_revenue) || 0,
        achieved_revenue: Number(vals.achieved_revenue) || 0,
        placements_made: Number(vals.placements_made) || 0,
        interviews_scheduled: Number(vals.interviews_scheduled) || 0,
        candidates_processed: Number(vals.candidates_processed) || 0,
        notes: vals.notes.trim() || null,
        completed: vals.completed,
      };

      let res: Response;
      if (isEdit && record) {
        res = await fetch(`/api/admin/team/${teamMemberId}/performance/${record.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/admin/team/${teamMemberId}/performance`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Could not save');
      showToast(isEdit ? 'Record updated' : 'Record saved');
      onClose();
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Could not save', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={`modal-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`modal${open ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="title">{isEdit ? 'Edit monthly record' : 'Add monthly record'}</div>
            <div className="sub">Track target vs achieved revenue, placements, and activity for one month.</div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row">
              <label>Month *</label>
              <input
                type="month"
                className="input"
                value={vals.month}
                onChange={e => setField('month', e.target.value)}
                required
                disabled={isEdit}      /* can't change which month an edit is for */
              />
            </div>

            <div className="form-row cols2">
              <div>
                <label>Target revenue (₹)</label>
                <input className="input" type="number" min={0} value={vals.target_revenue} onChange={e => setField('target_revenue', e.target.value)} placeholder="500000" />
              </div>
              <div>
                <label>Achieved revenue (₹)</label>
                <input className="input" type="number" min={0} value={vals.achieved_revenue} onChange={e => setField('achieved_revenue', e.target.value)} placeholder="350000" />
              </div>
            </div>

            <div className="form-row cols2">
              <div>
                <label>Placements made</label>
                <input className="input" type="number" min={0} value={vals.placements_made} onChange={e => setField('placements_made', e.target.value)} placeholder="2" />
              </div>
              <div>
                <label>Interviews scheduled</label>
                <input className="input" type="number" min={0} value={vals.interviews_scheduled} onChange={e => setField('interviews_scheduled', e.target.value)} placeholder="12" />
              </div>
            </div>

            <div className="form-row">
              <label>Candidates processed</label>
              <input className="input" type="number" min={0} value={vals.candidates_processed} onChange={e => setField('candidates_processed', e.target.value)} placeholder="40" />
            </div>

            <div className="form-row">
              <label>Notes</label>
              <textarea rows={3} value={vals.notes} onChange={e => setField('notes', e.target.value)} placeholder="Highlights, blockers, observations…" />
            </div>

            <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="checkbox"
                id="perf-completed"
                checked={vals.completed}
                onChange={e => setField('completed', e.target.checked)}
              />
              <label htmlFor="perf-completed" style={{ margin: 0 }}>Mark month as complete (locks data from edits in dashboards)</label>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-glow" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Add record')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
