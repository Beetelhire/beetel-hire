// Formatting helpers (currency, dates, etc.)

export function rupeeFmt(n: number): string {
  n = Number(n) || 0;
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2).replace(/\.0+$/, '') + ' Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2).replace(/\.0+$/, '') + ' L';
  return '₹' + n.toLocaleString('en-IN');
}

// "₹50–75 LPA" → median in absolute rupees
export function midPayAbs(payStr: string | null | undefined): number {
  if (!payStr) return 0;
  const nums = (payStr.match(/[\d.]+/g) || []).map(parseFloat).filter(n => !isNaN(n));
  if (!nums.length) return 0;
  const median = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  if (/Cr/i.test(payStr)) return median * 1e7;
  if (/LPA|L/i.test(payStr)) return median * 1e5;
  return median;
}

export const FEE_RATE = 0.20;
export function jobExpectedFee(payStr: string | null | undefined): number {
  return midPayAbs(payStr) * FEE_RATE;
}

export function fmtRelative(ts: string | number | Date): string {
  const t = typeof ts === 'string' ? new Date(ts).getTime() : (ts instanceof Date ? ts.getTime() : ts);
  const d = Math.max(0, Date.now() - t);
  const days = Math.floor(d / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return days + ' days ago';
  if (days < 30) {
    const w = Math.floor(days / 7);
    return w + ' week' + (w > 1 ? 's' : '') + ' ago';
  }
  const m = Math.floor(days / 30);
  return m + ' month' + (m > 1 ? 's' : '') + ' ago';
}

export function logoLetter(name?: string | null): string {
  return (name || '?').trim().charAt(0).toUpperCase();
}

export function functionIcon(fn?: string | null): string {
  const map: Record<string, string> = {
    Engineering: 'code-2',
    Product: 'layers',
    Design: 'palette',
    Operations: 'settings-2',
    Marketing: 'megaphone',
    Sales: 'trending-up',
    Finance: 'banknote',
  };
  return map[fn || ''] || 'briefcase';
}
