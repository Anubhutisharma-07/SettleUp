import { useEffect, useRef, useState } from 'react';
import { useReducedMotion, useInView } from '../components/motion';
import { DEMO } from '../data/demo';
import { IconArrowRight } from '../components/Icons';

/* ================================================================== */
/*  Settlement Engine — the algorithm as a visual pipeline:            */
/*  Raw expenses → Net positions → Settlement → Settled ₹0.            */
/*  Predetermined demo numbers; nothing is computed at runtime.        */
/* ================================================================== */

const ENGINE_STAGES = ['Raw expenses', 'Net positions', 'Settlement', 'Settled'];
const PEOPLE_LIST = [DEMO.people.maya, DEMO.people.rahul, DEMO.people.priya];

function MiniAvatar({ person, size = 'w-6 h-6 text-[8px]' }) {
  return (
    <span
      className={`${size} rounded-full bg-gradient-to-br ${person.grad} text-white font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shrink-0`}
    >
      {person.initials}
    </span>
  );
}

export function AlgorithmShowcase() {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [cardRef, inView] = useInView({ threshold: 0.35 });
  const autoRan = useRef(false);

  /* Auto-run once when the section scrolls into view. */
  useEffect(() => {
    if (!inView || autoRan.current) return undefined;
    autoRan.current = true;
    if (reduced) {
      setStage(ENGINE_STAGES.length - 1);
      return undefined;
    }
    let s = 0;
    setStage(0);
    const iv = setInterval(() => {
      s += 1;
      setStage(s);
      if (s >= ENGINE_STAGES.length - 1) clearInterval(iv);
    }, 950);
    return () => clearInterval(iv);
  }, [inView, reduced]);

  const run = () => {
    if (reduced) {
      setStage((s) => (s + 1) % ENGINE_STAGES.length);
      return;
    }
    let s = 0;
    setStage(0);
    const iv = setInterval(() => {
      s += 1;
      setStage(s);
      if (s >= ENGINE_STAGES.length - 1) clearInterval(iv);
    }, 950);
  };

  return (
    <div ref={cardRef} className="card rounded-3xl p-6 sm:p-8 shadow-card-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
        </div>
        <button onClick={run} className="btn-secondary !py-1.5 !px-3.5 text-xs active:translate-y-0">
          ▶ Replay the engine
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {ENGINE_STAGES.map((label, i) => (
          <span
            key={label}
            className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full transition-colors duration-500 ${
              i <= stage ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="min-h-[230px]">
        {stage === 0 && (
          <div className="animate-fade-in space-y-2">
            {DEMO.expenses.map((e) => (
              <div
                key={e.key}
                className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 px-4 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <MiniAvatar person={DEMO.people[e.payer]} />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {e.label} <span className="text-xs text-slate-400 dark:text-slate-500">· {DEMO.people[e.payer].name} paid</span>
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-600 dark:text-slate-300">{e.amountLabel}</span>
              </div>
            ))}
            <p className="pt-1 text-xs text-slate-400 dark:text-slate-500">
              3 expenses · {DEMO.totalLabel} shared
            </p>
          </div>
        )}

        {stage === 1 && (
          <div className="animate-fade-in space-y-2">
            {PEOPLE_LIST.map((p) => {
              const net = DEMO.nets[p.name.toLowerCase()];
              return (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <MiniAvatar person={p} />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.name}</span>
                  </div>
                  <span
                    className={`font-mono text-sm font-bold ${
                      net.sign > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500 dark:text-rose-400'
                    }`}
                  >
                    {net.label}
                  </span>
                </div>
              );
            })}
            <p className="pt-1 text-xs text-slate-400 dark:text-slate-500">
              The books always sum to zero — debts cancel where they can.
            </p>
          </div>
        )}

        {stage === 2 && (
          <div className="animate-fade-in space-y-3">
            {/* Flow rows: debtor ───── amount ─────→ Rahul */}
            {DEMO.payments.map((pay, i) => {
              const from = DEMO.people[pay.from];
              const to = DEMO.people[pay.to];
              return (
                <div key={pay.from} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="flex items-center gap-2 w-20 shrink-0">
                    <MiniAvatar person={from} />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{from.name}</span>
                  </div>
                  <div className="relative flex-1 h-[2px] rounded-full bg-slate-200 dark:bg-slate-700">
                    <span className="flow-line is-visible absolute inset-0" />
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-md bg-brand-500 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 shadow-sm">
                      {pay.amountLabel}
                    </span>
                    <span className="absolute right-0 -top-[3px] w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-brand-500" />
                  </div>
                  <div className="flex items-center gap-2 w-20 shrink-0 justify-end">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{to.name}</span>
                    <MiniAvatar person={to} />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Every debtor matched with the creditor they owe — nothing redundant.
            </p>
          </div>
        )}

        {stage >= 3 && (
          <div className="animate-fade-in space-y-3">
            <div className="settled-pop rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 px-6 py-6 text-center shadow-glow">
              <p className="text-[11px] font-extrabold tracking-widest text-white uppercase flex items-center justify-center gap-1.5">
                Settled
              </p>
              <p className="mt-1 font-mono text-4xl font-extrabold text-white leading-none">₹0</p>
              <p className="text-[11px] text-white/80 mt-1.5">3 expenses → 2 payments → 0 debts</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 font-mono font-bold text-slate-500">3 IOUs</span>
              <IconArrowRight size={12} className="text-brand-500" />
              <span className="rounded-full bg-brand-500 px-2.5 py-0.5 font-mono font-bold text-white">2 payments</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
