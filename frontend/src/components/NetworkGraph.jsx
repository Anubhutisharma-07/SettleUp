import { useMemo } from 'react';

/**
 * NetworkGraph — the user's personal settlement network.
 *
 * Renders real suggested payments as a small interactive graph:
 *   - "You" in the center (green ring)
 *   - counterparties arranged around you
 *   - animated edges for money that moves, dimmed edges otherwise
 *
 * Clicking an edge/node opens the group the payment belongs to.
 * Pure SVG + absolutely-positioned nodes; no dependencies.
 */
export default function NetworkGraph({ flows, onOpenGroup, size = 260 }) {
  const nodes = useMemo(() => {
    const others = [];
    const seen = new Set();
    flows.forEach((f) => {
      if (!seen.has(f.name)) {
        seen.add(f.name);
        others.push(f.name);
      }
    });
    const list = ['You', ...others.slice(0, 5)];
    const cx = 50;
    const cy = 50;
    const r = 38;
    return list.map((name, i) => {
      if (i === 0) return { name, x: cx, y: cy, isMe: true };
      const angle = -Math.PI / 2 + (i / (list.length - 1)) * 2 * Math.PI;
      return { name, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
  }, [flows]);

  const edges = useMemo(() => {
    return flows
      .slice(0, 6)
      .map((f, i) => {
        const from = f.direction === 'out' ? 'You' : f.name;
        const to = f.direction === 'out' ? f.name : 'You';
        const a = nodes.find((n) => n.name === from);
        const b = nodes.find((n) => n.name === to);
        if (!a || !b) return null;
        return {
          id: `${f.direction}-${f.name}-${f.group}-${i}`,
          x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          amount: f.amount, direction: f.direction, group: f.group,
        };
      })
      .filter(Boolean);
  }, [flows, nodes]);

  if (flows.length === 0) return null;

  return (
    <div className="relative w-full" style={{ maxWidth: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-auto" aria-hidden="true">
        {edges.map((e) => (
          <g key={e.id}>
            <line
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#0FA966"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="edge-flow"
              opacity="0.85"
            />
            <line
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="transparent"
              strokeWidth="8"
              style={{ cursor: 'pointer' }}
              onClick={() => onOpenGroup?.(e.group)}
            />
          </g>
        ))}
      </svg>
      {nodes.map((n) => (
        <span
          key={n.name}
          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-slate-950 shadow-card-md ${
            n.isMe ? 'w-12 h-12 text-[10px] bg-gradient-to-br from-brand-400 to-brand-600 text-white' : 'w-9 h-9 text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
          title={n.isMe ? 'You' : n.name}
        >
          {n.isMe ? 'YOU' : n.name.slice(0, 2).toUpperCase()}
        </span>
      ))}
      {/* clickable amount chips along edges */}
      {edges.map((e) => (
        <button
          key={`chip-${e.id}`}
          onClick={() => onOpenGroup?.(e.group)}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-white dark:bg-slate-900 border border-brand-200/70 dark:border-brand-800/60 shadow-card px-1.5 py-0.5 text-[9px] font-mono font-bold text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40 transition-colors"
          style={{ left: `${(e.x1 + e.x2) / 2}%`, top: `${(e.y1 + e.y2) / 2}%` }}
          title={`Open ${e.group}`}
        >
          {e.direction === 'out' ? '−' : '+'}
          {`₹${e.amount.toLocaleString('en-IN')}`}
        </button>
      ))}
    </div>
  );
}
