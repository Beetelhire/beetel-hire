'use client';

import { useEffect, useRef } from 'react';

const POOL: [number, number][] = [
  [120,160], [280,110], [430,210], [600,140], [770,230], [930,165],
  [1080,250], [1280,180], [180,360], [380,450], [580,370], [820,450],
  [1080,400], [1320,470], [120,590], [340,640], [560,590], [780,640],
  [1020,580], [1280,650], [80,290], [950,580], [240,540], [690,300],
  [1180,320], [500,650], [400,330], [880,320], [220,450], [710,540]
];

type Props = {
  variant?: string;        // 'dim' | 'full dim' | undefined
  density?: number;        // 0..1
  signals?: number;        // unused (kept for parity)
  maxDist?: number;        // edge threshold
  id?: string;
};

export function TopologyCanvas({ variant = '', density = 1, maxDist = 280, id }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const seed = (id || '').length || 7;
    const rand = (i: number) => ((Math.sin(seed * 13.37 + i * 2.71) + 1) / 2);

    const nodes = POOL.slice(0, Math.round(POOL.length * density)).map((p, i) => {
      const jx = (rand(i) - 0.5) * 14;
      const jy = (rand(i + 100) - 0.5) * 14;
      return [p[0] + jx, p[1] + jy] as [number, number];
    });

    const edges: { i: number; j: number; d: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) edges.push({ i, j, d });
      }
    }

    const lines = edges.map(e => {
      const a = nodes[e.i], b = nodes[e.j];
      return `<line class="topo-line" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
    }).join('');

    const signalLines = edges.map((e, k) => {
      const a = nodes[e.i], b = nodes[e.j];
      const len = Math.ceil(e.d);
      const dash = `5 ${len}`;
      const offset = len + 5;
      const delay = ((k * 0.31) % 4).toFixed(2);
      const dur = (2.8 + (k % 7) * 0.35).toFixed(2);
      return `<line class="signal-line" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke-dasharray="${dash}" style="--len:${offset}px;animation-delay:${delay}s;animation-duration:${dur}s"/>`;
    }).join('');

    const dots = nodes.map((n, i) => {
      const isActive = i % 4 === 0;
      return `
        ${isActive ? `<circle class="topo-node-halo" cx="${n[0].toFixed(1)}" cy="${n[1].toFixed(1)}" r="${(6 + (i % 3)).toFixed(0)}" style="animation-delay:${((i % 5) * 0.3).toFixed(2)}s"/>` : ''}
        <circle class="topo-node" cx="${n[0].toFixed(1)}" cy="${n[1].toFixed(1)}" r="${isActive ? 2.6 : 1.8}" style="animation-delay:${((i % 6) * 0.25).toFixed(2)}s"/>`;
    }).join('');

    ref.current.innerHTML = `
      <svg viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" class="topo-svg">
        <g>${lines}</g>
        <g>${signalLines}</g>
        <g>${dots}</g>
      </svg>`;
  }, [density, maxDist, id]);

  return <div className={`topology-canvas ${variant}`.trim()} aria-hidden="true" ref={ref} />;
}
