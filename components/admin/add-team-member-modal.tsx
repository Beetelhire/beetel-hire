'use client';

// Admin: add or edit a team member.
// Same modal handles both create and edit — pass `member` to edit, omit to create.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus, Loader2, Save } from 'lucide-react';
import { showToast } from '../toast';
import type { TeamMember } from '@/types/database';

const ROLES = [
  'Recruiter', 'Senior Recruiter', 'Lead Recruiter',
  'Manager', 'Director',
  'Admin', 'Operations', 'Other',
];

type Props = {
  open: boolean;
  onClose: () => void;
  member?: TeamMember | null;
  managers: { id: string; full_name: string }[];   // possible managers (other team_members)
};

const EMPTY = {
  full_name: '', email: '', phone: '', role: 'Recruiter',
  employee_id: '', department: '', designation: '',
  doj: '', manager_id: '', profile_photo_url: '',
  status: 'Active' as 'Active' | 'Inactive',
};

export function AddTeamMemberModal({ open, onClose, member, managers }: Props) {
  const router = useRouter();
  const [vals, setVals] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!member;

  useEffect(() => {
    if (!open) return;
    if (member) {
      setVals({
        full_name:         member.full_name || '',
        email:             member.email || '',
        phone:             member.phone || '',
        role:              member.role || 'Recruiter',
        employee_id:       member.employee_id || '',
        department:        member.department || '',
        designation:       member.designation || '',
        doj:               member.doj || '',
        manager_id:        member.manager_id || '',
        profile_photo_url: member.profile_photo_url || '',
        status:            member.status || 'Active',
      });
    } else {
      setVals(EMPTY);
    }
  }, [open, member]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape' && open) onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function setField<K extends keyof typeof EMPTY>(k: K, v: string) {
    setVals(prev => ({ ...prev, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!vals.full_name.trim()) return showToast('Name is required', 'error');
    if (!vals.email.trim())     return showToast('Email is required', 'error');
    if (!vals.role.trim())      return showToast('Role is required', 'error');

    setSaving(true);
    try {
      const body = {
        full_name:         vals.full_name.trim(),
        email:             vals.email.trim(),
        phone:             vals.phone.trim() || null,
        role:              vals.role,
        employee_id:       vals.employee_id.trim() || null,
        department:        vals.department.trim() || null,
        designation:       vals.designation.trim() || null,
        doj:               vals.doj.trim() || null,
        manager_id:        vals.manager_id || null,
        profile_photo_url: vals.profile_photo_url.trim() || null,
        status:            vals.status,
      };
      const url    = isEdit ? `/api/admin/team/${member!.id}` : '/api/admin/team';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'Could not save');

      showToast(isEdit ? 'Team member updated' : 'Team member added');
      onClose();
      router.refresh();
    } catch (err: any) {
      showToast(err?.message || 'Could not save', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Exclude the member being edited from manager dropdown (no self-referencing)
  const managerOptions = managers.filter(m => !member || m.id !== member.id);

  return (
    <>
      <div className={`modal-backdrop${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`modal job-modal${open ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <div className="title">{isEdit ? 'Edit team member' : 'Add team member'}</div>
            <div className="sub">{isEdit ? 'Update details for this team member.' : 'Add an employee. Granting admin login is separate — invite them via Supabase Auth and link the row.'}</div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body" style={{ maxHeight: 'calc(85vh - 160px)', overflowY: 'auto' }}>
            <div className="form-section-h">Identity</div>
            <div className="form-row cols2">
              <div>
                <label>Full name *</label>
                <input className="input" value={vals.full_name} onChange={e => setField('full_name', e.target.value)} required />
              </div>
              <div>
                <label>Employee ID</label>
                <input className="input" value={vals.employee_id} onChange={e => setField('employee_id', e.target.value)} placeholder="BH-001" />
              </div>
            </div>
            <div className="form-row cols2">
              <div>
                <label>Email *</label>
                <input className="input" type="email" value={vals.email} onChange={e => setField('email', e.target.value)} required />
              </div>
              <div>
                <label>Phone</label>
                <input className="input" value={vals.phone} onChange={e => setField('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="form-section-h">Role &amp; department</div>
            <div className="form-row cols2">
              <div>
                <label>Role *</label>
                <select value={vals.role} onChange={e => setField('role', e.target.value)} required>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label>Department</label>
                <input className="input" value={vals.department} onChange={e => setField('department', e.target.value)} placeholder="Engineering Search" />
              </div>
            </div>
            <div className="form-row cols2">
              <div>
                <label>Designation</label>
                <input className="input" value={vals.designation} onChange={e => setField('designation', e.target.value)} placeholder="Senior Recruiter" />
              </div>
              <div>
                <label>Date of joining</label>
                <input className="input" type="date" value={vals.doj} onChange={e => setField('doj', e.target.value)} />
              </div>
            </div>
            <div className="form-row cols2">
              <div>
                <label>Reporting manager</label>
                <select value={vals.manager_id} onChange={e => setField('manager_id', e.target.value)}>
                  <option value="">— None —</option>
                  {managerOptions.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                </select>
              </div>
              <div>
                <label>Status</label>
                <select value={vals.status} onChange={e => setField('status', e.target.value as any)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-section-h">Profile photo</div>
            <div className="form-row">
              <label>Photo URL <span className="hint" style={{ display: 'inline', margin: 0 }}>(direct link to an image)</span></label>
              <input className="input" value={vals.profile_photo_url} onChange={e => setField('profile_photo_url', e.target.value)} placeholder="https://…/photo.jpg" />
              <div className="small" style={{ marginTop: 6 }}>For uploads, you can put the file in Supabase Storage and paste the public URL here.</div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-glow" disabled={saving}>
              {saving ? <Loader2 size={14} className="spin" /> : (isEdit ? <Save size={14} /> : <UserPlus size={14} />)}
              {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Add team member')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
