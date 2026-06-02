// Universal export utilities — CSV, Excel (.xlsx), PDF, Word (.docx).
// Heavy libraries are lazy-loaded via dynamic import() so they only ship
// when the user actually clicks Export.
//
// Usage:
//   const cols: ExportColumn[] = [
//     { key: 'name',  label: 'Candidate' },
//     { key: 'email', label: 'Email' },
//     { key: 'created_at', label: 'Added', format: (v) => new Date(v).toLocaleDateString('en-IN') },
//   ];
//   await exportXlsx({ filename: 'candidates', sheet: 'Pool', columns: cols, rows });
//
// All four functions trigger a browser download — no server call.

export type ExportColumn<Row = any> = {
  key: string;
  label: string;
  format?: (value: any, row: Row) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: number;        // PDF column width hint
};

export type ExportArgs<Row = any> = {
  filename: string;       // without extension
  columns: ExportColumn<Row>[];
  rows: Row[];
  title?: string;         // shown in PDF / DOCX header
  sheet?: string;         // Excel sheet name (default = "Sheet1")
};

// ── helpers ───────────────────────────────────────────────────

function safeCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try { return JSON.stringify(v); } catch { return ''; }
}

function rowToValues<Row>(row: Row, cols: ExportColumn<Row>[]): (string | number)[] {
  return cols.map(c => {
    const raw = (row as any)[c.key];
    if (c.format) return c.format(raw, row);
    return safeCell(raw);
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── CSV ───────────────────────────────────────────────────────

export async function exportCsv<Row>({ filename, columns, rows }: ExportArgs<Row>): Promise<void> {
  const escape = (s: string) => {
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.map(c => escape(c.label)).join(',');
  const body = rows.map(r => rowToValues(r, columns).map(v => escape(String(v))).join(',')).join('\n');
  const text = header + '\n' + body;
  // BOM so Excel opens UTF-8 correctly
  downloadBlob(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`);
}

// ── XLSX (Excel) ──────────────────────────────────────────────

export async function exportXlsx<Row>({ filename, columns, rows, sheet }: ExportArgs<Row>): Promise<void> {
  const XLSX = await import('xlsx');
  const header = columns.map(c => c.label);
  const body = rows.map(r => rowToValues(r, columns));
  const aoa = [header, ...body];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Naive auto-width based on longest cell per column
  ws['!cols'] = columns.map((_, i) => {
    const maxLen = aoa.reduce((m, row) => Math.max(m, String(row[i] ?? '').length), 0);
    return { wch: Math.min(60, Math.max(10, maxLen + 2)) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheet || 'Sheet1');
  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  downloadBlob(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filename}.xlsx`);
}

// ── PDF ───────────────────────────────────────────────────────

export async function exportPdf<Row>({ filename, columns, rows, title }: ExportArgs<Row>): Promise<void> {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable: any = (autoTableMod as any).default || autoTableMod;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  if (title) {
    doc.setFontSize(14);
    doc.text(title, 40, 36);
  }
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString('en-IN')} · ${rows.length} row${rows.length === 1 ? '' : 's'}`, 40, title ? 52 : 36);

  autoTable(doc, {
    startY: title ? 64 : 48,
    head: [columns.map(c => c.label)],
    body: rows.map(r => rowToValues(r, columns).map(v => String(v))),
    styles: { fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [62, 66, 251], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    columnStyles: Object.fromEntries(columns.map((c, i) => [i, {
      halign: c.align || 'left',
      cellWidth: c.width || 'auto',
    }])),
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}.pdf`);
}

// ── DOCX (Word) ───────────────────────────────────────────────

export async function exportDocx<Row>({ filename, columns, rows, title }: ExportArgs<Row>): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle } = await import('docx');

  const headerRow = new TableRow({
    tableHeader: true,
    children: columns.map(c => new TableCell({
      shading: { fill: '3E42FB' },
      children: [new Paragraph({
        children: [new TextRun({ text: c.label, bold: true, color: 'FFFFFF', size: 18 })],
      })],
    })),
  });

  const bodyRows = rows.map(r => new TableRow({
    children: columns.map(c => {
      const v = c.format ? c.format((r as any)[c.key], r) : safeCell((r as any)[c.key]);
      return new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: String(v), size: 18 })],
          alignment: c.align === 'right' ? AlignmentType.RIGHT : c.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
        })],
      });
    }),
  }));

  const table = new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: 'D8DAE6' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D8DAE6' },
      left:   { style: BorderStyle.SINGLE, size: 4, color: 'D8DAE6' },
      right:  { style: BorderStyle.SINGLE, size: 4, color: 'D8DAE6' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'EBEDF5' },
      insideVertical:   { style: BorderStyle.SINGLE, size: 2, color: 'EBEDF5' },
    },
  });

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children: [
        ...(title ? [new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: title, bold: true })],
        })] : []),
        new Paragraph({
          children: [new TextRun({
            text: `Generated ${new Date().toLocaleString('en-IN')} · ${rows.length} row${rows.length === 1 ? '' : 's'}`,
            italics: true,
            color: '7A7E96',
            size: 16,
          })],
          spacing: { after: 200 },
        }),
        table,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}

// ── Convenience: dispatch by format ───────────────────────────

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'docx';

export async function exportData<Row>(format: ExportFormat, args: ExportArgs<Row>): Promise<void> {
  switch (format) {
    case 'csv':  return exportCsv(args);
    case 'xlsx': return exportXlsx(args);
    case 'pdf':  return exportPdf(args);
    case 'docx': return exportDocx(args);
  }
}
