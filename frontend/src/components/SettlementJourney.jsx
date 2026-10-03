import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './motion';
import { DEMO } from '../data/demo';
import { IconCheck, IconReceipt, IconHotel, IconCab } from './Icons';

/* Scroll story — four acts, unlocked progressively as the visitor scrolls.
   The panel is predetermined demo data; scroll merely reveals the stages. */

const PEOPLE_LIST = [DEMO.people.maya, DEMO.people.rahul, DEMO.people.priya];
const EXPENSE_ICONS = { Dinner: IconReceipt, Hotel: IconHotel, Cab: IconCab };

const STAGES = [
  { key: 'messy', rail: 'Money gets complicated when people get involved.', sub: 'Three friends. Three bills. No idea who owes what.' },
  { key: 'organized', rail: 'SettleUp makes the mess understandable.', sub: 'Every bill becomes a balance — netted to the rupee.' },
  { key: 'optimize', rail: 'Then it finds the simplest way to settle.', sub: 'Unnecessary transaction paths dissolve into two payments.' },
  { key: 'zero', rail: "Everyone's square.", sub: 'Nothing left to remember, nothing left to chase.' },
];

/* Node positions in percent, shared by SVG edges and avatar overlays. */
const NODES = {
  Maya: { x: 30, y: 26 },
  Rahul: { x: 74, y: 62 },
  Priya: { x: 24, y: 80 },
};

function AvatarNode({ person, x, y, children, dim }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-opacity duration-500"
      style={{ left: `${x}%`, top: `${y}%`, opacity: dim ? 0.35 : 1 }}
    >
      <span
        className={`w-11 h-11 rounded-full bg-gradient-to-br ${person.grad} text-white text-[11px] font-bold flex items-center justify-center shadow-card-md ring-2 ring-white dark:ring-slate-950`}
      >
        {person.initials}
      </span>
      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{person.name}</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The living network panel (shared by desktop + mobile renderers)    */
/* ------------------------------------------------------------------ */
function SystemPanel({ stage, compact = false }) {
  const organized = stage >= 1; // balances appear
  const optimizing = stage === 2; // brief "optimizing…" moment
  const optimized = stage >= 3; // payments formed
  const settled = stage >= 4; // ₹0

  return (
    <div className="relative rounded-3xl overflow-hidden card shadow-card-lg">
      <div className="relative h-[340px] sm:h-[400px]">
        {/* edges */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[
            ['Maya', 'Rahul'],
            ['Maya', 'Priya'],
            ['Priya', 'Rahul'],
          ].map(([a, b]) => (
            <line
              key={`${a}-${b}`}
              x1={NODES[a].x}
              y1={NODES[a].y}
              x2={NODES[b].x}
              y2={NODES[b].y}
              stroke="currentColor"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className="text-slate-200 dark:text-slate-700 transition-opacity duration-700"
              style={{ opacity: optimized ? 0.18 : 1 }}
            />
          ))}
          {optimized && (
            <>
              <line
                x1={NODES.Maya.x}
                y1={NODES.Maya.y}
                x2={NODES.Rahul.x}
                y2={NODES.Rahul.y}
                stroke="#0FA966"
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                opacity="0.85"
                className="edge-flow"
              />
              <line
                x1={NODES.Priya.x}
                y1={NODES.Priya.y}
                x2={NODES.Rahul.x}
                y2={NODES.Rahul.y}
                stroke="#0FA966"
                strokeWidth="1.8"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                opacity="0.85"
                className="edge-flow"
                style={{ animationDelay: '-0.55s' }}
              />
            </>
          )}
          {settled && (
            <>
              <circle r="2.4" fill="#0FA966">
                <animateMotion dur="1.6s" repeatCount="indefinite" path={`M${NODES.Maya.x},${NODES.Maya.y} L${NODES.Rahul.x},${NODES.Rahul.y}`} />
              </circle>
              <circle r="2.4" fill="#0FA966" opacity="0.85">
                <animateMotion dur="1.9s" begin="0.5s" repeatCount="indefinite" path={`M${NODES.Priya.x},${NODES.Priya.y} L${NODES.Rahul.x},${NODES.Rahul.y}`} />
              </circle>
            </>
          )}
        </svg>

        {/* floating expense cards — stage 0 only */}
        {!organized && (
          <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-2">
            {DEMO.expenses.map((e, i) => {
              const Icon = EXPENSE_ICONS[e.label];
              return (
                <div
                  key={e.key}
                  className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 shadow-card-md px-3 py-1.5 animate-fade-up"
                  style={{ animationDelay: `${i * 0.14}s` }}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                    <Icon size={11} />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">{e.label}</span>
                  <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">{e.amountLabel}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* "optimizing…" status */}
        {optimizing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs font-bold tracking-[0.25em] text-brand-600 dark:text-brand-400 uppercase animate-fade-in">
              Optimizing…
            </p>
          </div>
        )}

        {/* payment amount chips */}
        {optimized && (
          <>
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-brand-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 shadow-sm animate-fade-in"
              style={{ left: '56%', top: '40%' }}
            >
              ₹900
            </span>
            <span
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md bg-brand-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 shadow-sm animate-fade-in"
              style={{ left: '44%', top: '74%' }}
            >
              ₹1,200
            </span>
          </>
        )}

        {/* people nodes with balance chips */}
        {PEOPLE_LIST.map((p) => {
          const net = DEMO.nets[p.name.toLowerCase()];
          const dim = optimizing;
          return (
            <AvatarNode key={p.name} person={p} x={NODES[p.name].x} y={NODES[p.name].y} dim={dim}>
              {organized && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md animate-fade-in ${
                    net.sign > 0
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40'
                      : 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
                  }`}
                >
                  {net.label}
                </span>
              )}
            </AvatarNode>
          );
        })}

        {/* final settled badge */}
        {settled && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 settled-pop z-10"
            style={{ left: '50%', top: '46%' }}
          >
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 px-5 py-3 text-center shadow-glow">
              <p className="text-[10px] font-extrabold tracking-widest text-white uppercase flex items-center gap-1.5 justify-center">
                <IconCheck size={11} strokeWidth={3} /> All settled
              </p>
              <p className="font-mono text-2xl font-extrabold text-white leading-tight">₹0</p>
            </div>
          </div>
        )}
      </div>

      {/* status line + stage dots */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800/80">
        <p className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          {stage === 0 && '3 shared expenses'}
          {stage === 1 && <span className="text-brand-600 dark:text-brand-400">Calculating balances…</span>}
          {stage === 2 && <span className="text-brand-600 dark:text-brand-400">Optimizing transactions…</span>}
          {stage === 3 && <span className="text-brand-600 dark:text-brand-400">2 minimal payments</span>}
          {stage >= 4 && <span className="text-brand-600 dark:text-brand-400">Settled — ₹0 outstanding</span>}
        </p>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === Math.min(stage, 4) ? 'w-5 bg-brand-500' : i < stage ? 'w-1.5 bg-brand-300' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop: tall scroll wrapper + sticky panel (scroll-driven)        */
/* ------------------------------------------------------------------ */
function DesktopJourney() {
  const wrapRef = useRef(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const node = wrapRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(Math.max(-rect.top / total, 0), 0.999);
      /* Five panel states, evenly banded — no dead scroll at the tail. */
      setStage(Math.min(Math.floor(p * 5), 4));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const si = Math.min(stage, 3); // rail index (4 acts)
  const s = STAGES[si];

  return (
    <div ref={wrapRef} className="relative hidden md:block" style={{ height: '300vh' }}>
      <div className="sticky top-0 min-h-screen flex items-center py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_1.15fr] gap-10 items-center w-full">
          {/* Left rail — the story */}
          <div>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {STAGES.map((st, i) => (
                <span
                  key={st.key}
                  className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-1 rounded-full transition-colors duration-500 ${
                    i <= si ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {i < si ? <IconCheck size={9} strokeWidth={3} /> : <span className="font-mono">{i + 1}</span>}
                  {st.key}
                </span>
              ))}
            </div>
            <p className="text-xs font-bold tracking-[0.2em] text-brand-600 dark:text-brand-400 uppercase">
              Act {String(si + 1).padStart(2, '0')} / 04
          </p>
            <h3 key={s.key} className="mt-3 text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white animate-fade-up">
              {s.rail}
            </h3>
            <p key={`${s.key}-sub`} className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-md animate-fade-up">
              {s.sub}
            </p>
            <div className="mt-8 h-1 w-full max-w-md rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300"
                style={{ width: `${((si + 1) / STAGES.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Right — the living system */}
          <SystemPanel stage={stage} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile: simplified stacked flow (no scroll-jacking)                */
/* ------------------------------------------------------------------ */
function MobileJourney() {
  return (
    <div className="md:hidden px-4 py-10">
      <SystemPanel stage={4} compact />
      <div className="mt-6 space-y-3">
        {STAGES.map((s, i) => (
          <div key={s.key} className="flex items-start gap-3">
            <span className="w-7 h-7 shrink-0 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 font-mono text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{s.rail}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export default function SettlementJourney() {
  const reduced = useReducedMotion();
  return (
    <section aria-label="SettleUp system demonstration">
      {reduced ? (
        /* Reduced motion: show the settled end-state statically. */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <SystemPanel stage={4} compact />
        </div>
      ) : (
        <>
          <DesktopJourney />
          <MobileJourney />
        </>
      )}
    </section>
  );
}
