'use client';

// Drop-in export button. Renders a "Export" button that opens a small menu
// with CSV / Excel / PDF / Word options. Pass it the columns + rows (which
// can be the filtered list — the parent decides what to export).

import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileText, FileType2, ChevronDown, Loader2 } from 'lucide-react';
import { exportData, type ExportArgs, type ExportFormat } from '@/lib/export';
import { showToast } from '../toast';

type Props<Row> = Omit<ExportArgs<Row>, 'rows'> & {
  rows: Row[];
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
};

const FORMATS: { key: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { key: 'csv',  label: 'CSV',   icon: <FileText size={13} /> },
  { key: 'xlsx', label: 'Excel', icon: <FileSpreadsheet size={13} /> },
  { key: 'pdf',  label: 'PDF',   icon: <FileType2 size={13} /> },
  { key: 'docx', label: 'Word',  icon: <FileText size={13} /> },
];

export function ExportMenu<Row>({ rows, size = 'sm', align = 'right', ...args }: Props<Row>) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function run(format: ExportFormat) {
    if (!rows.length) {
      showToast('Nothing to export', 'error');
      return;
    }
    setBusy(format);
    setOpen(false);
    try {
      await exportData(format, { ...args, rows });
      showToast(`${rows.length} row${rows.length === 1 ? '' : 's'} exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      console.error('export failed:', err);
      showToast('Export failed', 'error');
    } finally {
      setBusy(null);
    }
  }

  const btnClass = `btn btn-secondary ${size === 'sm' ? 'btn-sm' : ''}`;
  const menuPos = align === 'right' ? { right: 0 } : { left: 0 };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className={btnClass}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={!!busy}
      >
        {busy ? <Loader2 size={13} className="spin" /> : <Download size={13} />}
        Export
        <ChevronDown size={12} style={{ marginLeft: 2, opacity: 0.6, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            ...menuPos,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: '0 8px 24px color-mix(in srgb, var(--fg) 12%, transparent)',
            padding: 4,
            minWidth: 160,
            zIndex: 50,
          }}
        >
          {FORMATS.map(f => (
            <button
              key={f.key}
              role="menuitem"
              onClick={() => run(f.key)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--fg)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
