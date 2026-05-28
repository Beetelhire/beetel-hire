// Misc helpers used by admin pages

const BRAND_GRADS = [
  'linear-gradient(135deg,#3E42FB,#5A2EFF)',
  'linear-gradient(135deg,#6BD4FF,#3E42FB)',
  'linear-gradient(135deg,#ffc850,#ff8a5c)',
  'linear-gradient(135deg,#5A2EFF,#6BD4FF)',
  'linear-gradient(135deg,#4ade80,#6BD4FF)',
  'linear-gradient(135deg,#ff6b6b,#5A2EFF)',
  'linear-gradient(135deg,#3E42FB,#4ade80)',
  'linear-gradient(135deg,#5A2EFF,#ffc850)',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function pickGrad(seed: string): string {
  return BRAND_GRADS[hashStr(seed) % BRAND_GRADS.length];
}

export function logoLetter(name?: string | null): string {
  return (name || '?').trim().charAt(0).toUpperCase();
}

export function pctClass(p: number): 'good' | 'warn' | 'danger' {
  return p >= 80 ? 'good' : p >= 50 ? 'warn' : 'danger';
}
