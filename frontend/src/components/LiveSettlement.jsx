import { useEffect, useState } from 'react';
import { useReducedMotion } from './motion';
import { DEMO } from '../data/demo';
import { IconCheck, IconRotate, IconReceipt, IconHotel, IconCab } from './Icons';

/* Hero demo — one clear story at a time:
   EXPENSES → BALANCES → SETTLEMENT → ₹0.
   Predetermined states, smooth crossfades, nothing competing for attention. */

const EXPENSE_ICONS = { Dinner: IconReceipt, Hotel: IconHotel, Cab: IconCab };

const PHASES = ['expenses', 'balances', 'settle', 'zero'];
const CAPTIONS = {
  expenses: 'Shared expenses',
  balances: 'Net balances',
  settle: 'Optimized settlement',
  zero: "Everyone's square",
};
const PHASE_MS = 2600;

/* Subtle relationship line with a quiet arrowhead toward the creditor. */
function Connector({ dir = 'right' }) {
  return (
    <div aria-hidden="true" className="relative flex-1 min-w-[16px] h-px mx-1.5 sm:mx-2.5 rounded-full bg-slate-200 dark:bg-slate-700">
      <span
        className={`absolute top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent ${
          dir === 'right'
            ? '-right-px border-l-[6px] border-l-slate-300 dark:border-l-slate-500'
            : '-left-px border-r-[6px] border-r-slate-300 dark:border-r-slate-500'
        }`}
      />
    </div>
  );
}

function PersonNode({ person, net, delay = 0 }) {
  return (
    <div className="flex flex-col items-center gap-1.5 animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <span
        className={`w-12 h-12 rounded-full bg-gradient-to-br ${person.grad} text-white text-xs font-bold flex items-center justify-center shadow-card-md ring-2 ring-white dark:ring-slate-900`}
      >
        {person.initials}
      </span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{person.name}</span>
      <span
        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
          net.sign > 0
            ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/40'
            : 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
        }`}
      >
        {net.label}
      </span>
    </div>
  );
}

/* Maya ──── ₹900 ────→ Rahul — the only visible transaction paths. */
function PaymentRow({ pay, delay = 0 }) {
  const from = DEMO.people[pay.from];
  const to = DEMO.people[pay.to];
  return (
    <div className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-2.5 w-24 sm:w-28 shrink-0">
        <span
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${from.grad} text-white text-[10px] font-bold flex items-center justify-center shadow-card-sm ring-2 ring-white dark:ring-slate-900`}
        >
          {from.initials}
        </span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{from.name}</span>
      </div>
      <div className="relative flex-1 h-[2px] rounded-full bg-slate-200 dark:bg-slate-700">
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-brand-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 shadow-sm">
          {pay.amountLabel}
        </span>
        <span className="absolute -right-px top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[7px] border-l-brand-500" />
      </div>
      <div className="flex items-center gap-2.5 w-24 sm:w-28 shrink-0 justify-end">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{to.name}</span>
        <span
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${to.grad} text-white text-[10px] font-bold flex items-center justify-center shadow-card-sm ring-2 ring-white dark:ring-slate-900`}
        >
          {to.initials}
        </span>
      </div>
    </div>
  );
}

export default function LiveSettlement() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0); // bump to replay entrance animations

  useEffect(() => {
    if (reduced) return undefined;
    const timer = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), PHASE_MS);
    return () => clearInterval(timer);
  }, [reduced]);

  const shown = reduced ? 3 : phase;
  const key = PHASES[shown];

  const replay = () => {
    setPhase(0);
    setCycle((c) => c + 1);
  };

  return (
    <div className="card rounded-3xl overflow-hidden shadow-card-lg">
      {/* Minimal header: label + quiet progress + replay */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
          </span>
          <p className="text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            Live demo · {DEMO.group}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" aria-hidden="true">
            {PHASES.map((p, i) => (
              <span
                key={p}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === shown ? 'w-4 bg-brand-500' : i < shown ? 'w-1.5 bg-brand-300' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={replay}
            aria-label="Replay the settlement demo"
            className="rounded-lg p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <IconRotate size={13} />
          </button>
        </div>
      </div>

      {/* The story — one state at a time */}
      <div className="px-6 sm:px-8 py-8 min-h-[280px] flex flex-col justify-center">
        <div key={`${key}-${cycle}`} className="animate-fade-in">
          <p className="text-[10px] font-bold tracking-[0.22em] text-slate-400 dark:text-slate-500 uppercase mb-6">
            {CAPTIONS[key]}
          </p>

          {key === 'expenses' && (
            <div className="grid grid-cols-3 gap-3">
              {DEMO.expenses.map((e, i) => {
                const Icon = EXPENSE_ICONS[e.label];
                return (
                  <div
                    key={e.key}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-800/60 py-5 animate-fade-up transition-transform duration-200 hover:-translate-y-0.5"
                    style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                  >
                    <span className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center shadow-sm">
                      <Icon size={16} />
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{e.label}</span>
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{e.amountLabel}</span>
                  </div>
                );
              })}
            </div>
          )}

          {key === 'balances' && (
            <div className="flex items-center justify-between">
              <PersonNode person={DEMO.people.maya} net={DEMO.nets.maya} delay={0.1} />
              <Connector dir="right" />
              <PersonNode person={DEMO.people.rahul} net={DEMO.nets.rahul} delay={0.2} />
              <Connector dir="left" />
              <PersonNode person={DEMO.people.priya} net={DEMO.nets.priya} delay={0.3} />
            </div>
          )}

          {key === 'settle' && (
            <div className="space-y-6">
              {DEMO.payments.map((pay, i) => (
                <PaymentRow key={pay.from} pay={pay} delay={0.1 + i * 0.15} />
              ))}
            </div>
          )}

          {key === 'zero' && (
            <div className="settled-pop flex flex-col items-center text-center py-3">
              <span className="w-11 h-11 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <IconCheck size={20} strokeWidth={3} />
              </span>
              <p className="mt-3 text-[11px] font-extrabold tracking-[0.25em] text-slate-500 dark:text-slate-400 uppercase">
                All settled
              </p>
              <p className="mt-1 font-mono text-5xl font-extrabold text-slate-900 dark:text-white leading-none">₹0</p>
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Nothing left to remember.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
