import { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import LiveSettlement from '../components/LiveSettlement';
import SettlementJourney from '../components/SettlementJourney';
import { useTilt } from '../components/motion';
import {
  IconArrowRight,
  IconMenu,
  IconX,
  IconSparkles,
  IconCheckCircle,
  IconScale,
  IconCode,
  IconLock,
  IconActivity,
  IconUsers,
  IconWallet,
} from '../components/Icons';
import { AlgorithmShowcase } from './LandingSections';
import { DEMO } from '../data/demo';
import AmbientBackground from '../components/AmbientBackground';

const NAV_LINKS = [
  { label: 'Live demo', href: '#system' },
  { label: 'The engine', href: '#engine' },
  { label: 'Features', href: '#features' },
];

function LandingNavbar({ onNavigate }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (href) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-md shadow-card border-b border-slate-200/60 dark:border-slate-800/70'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="SettleUp home">
          <Logo />
        </button>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="relative px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group/nav"
            >
              {l.label}
              <span className="absolute left-3.5 right-3.5 -bottom-0.5 h-0.5 rounded-full bg-brand-500 scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
          >
            Sign In
          </button>
          <button onClick={() => onNavigate('signup')} className="btn-primary !py-2 hover:-translate-y-px transition-transform">
            Get Started
          </button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/70 dark:border-slate-800/70 px-4 pt-3 pb-5 space-y-1 animate-fade-in">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
            >
              {l.label}
            </button>
          ))}
          <div className="pt-2 grid grid-cols-2 gap-2">
            <button onClick={() => onNavigate('login')} className="btn-secondary">
              Sign In
            </button>
            <button onClick={() => onNavigate('signup')} className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature grid — six restrained, interactive cards.                  */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    icon: IconScale,
    title: 'Smart splitting',
    text: 'Split expenses fairly without doing the math yourself.',
  },
  {
    icon: IconWallet,
    title: 'Group balances',
    text: 'See exactly who owes whom, at a glance.',
  },
  {
    icon: IconCode,
    title: 'Optimized settlement',
    text: 'The settlement engine reduces unnecessary transactions.',
  },
  {
    icon: IconLock,
    title: 'Secure authentication',
    text: 'JWT-based authentication keeps accounts protected.',
  },
  {
    icon: IconActivity,
    title: 'Real-time group data',
    text: 'Groups, expenses, balances, and settlements stay connected to the backend.',
  },
  {
    icon: IconUsers,
    title: 'Built for groups',
    text: 'Trips, roommates, events, teams, and everyday shared expenses.',
  },
];

function FeatureCard({ feature, delay }) {
  const tiltRef = useTilt(4);
  const Icon = feature.icon;
  return (
    <div
      ref={tiltRef}
      className="tilt-soft card rounded-2xl p-6 animate-fade-up hover:shadow-card-md hover:border-brand-300/70 dark:hover:border-brand-700/60 transition-colors"
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
        <Icon size={18} />
      </span>
      <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{feature.title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product preview — a framed representation of the real app          */
/*  (fictional data, exactly matching what the app shows).             */
/* ------------------------------------------------------------------ */
function ProductPreview({ onNavigate }) {
  return (
    <div className="relative max-w-3xl mx-auto">
      {/* glow behind the frame */}
      <div className="absolute -inset-6 bg-gradient-to-br from-brand-400/20 via-transparent to-brand-600/20 blur-2xl rounded-[2.5rem] pointer-events-none" />
      <div className="relative card rounded-3xl shadow-card-lg overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
          <span className="ml-3 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            The app — Goa Trip
          </span>
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-6 p-6 sm:p-8">
          {/* left: group summary */}
          <div>
            <p className="text-[10px] font-bold tracking-widest text-brand-600 dark:text-brand-400 uppercase">Goa Trip</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">3 members · {DEMO.totalLabel} expenses</p>

            <div className="mt-4 flex -space-x-2">
              {[DEMO.people.maya, DEMO.people.rahul, DEMO.people.priya].map((p) => (
                <span
                  key={p.name}
                  className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.grad} text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900`}
                >
                  {p.initials}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2 text-xs">
              {DEMO.expenses.map((e) => (
                <div key={e.key} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/70 px-3 py-1.5">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{e.label}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{e.amountLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* right: the user's position + settle action */}
          <div className="flex flex-col items-start sm:items-end sm:w-52 justify-center gap-3">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">You owe Rahul</p>
            <p className="font-mono text-4xl font-extrabold text-rose-500 dark:text-rose-400 leading-none">₹900</p>
            <button onClick={() => onNavigate('signup')} className="btn-primary w-full sm:w-auto">
              Settle Up <IconArrowRight size={14} />
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">One payment. Done.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing({ onNavigate }) {
  /* Root uses overflow-x: clip (not hidden) — `hidden` makes this div a scroll
     container, which silently breaks position:sticky for the pinned
     scroll-journey below and leaves a large blank band before the engine. */
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 [overflow-x:clip]">
      <LandingNavbar onNavigate={onNavigate} />

      {/* ============================ HERO ============================ */}
      <section className="relative pt-28 sm:pt-32 pb-4 sm:pb-6">
        <AmbientBackground variant="hero" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-10 items-center lg:min-h-[540px]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 dark:border-brand-800/60 bg-white/70 dark:bg-slate-900/70 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-brand-700 dark:text-brand-300 shadow-sm">
              <IconSparkles size={13} /> THE SIMPLEST WAY TO SETTLE UP
            </span>
            <h1 className="mt-5 text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.02]">
              Shared expenses,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 dark:from-brand-400 dark:to-emerald-400">
                finally settled.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Track who paid. See who owes. Settle up with fewer payments.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('signup')}
                className="btn-primary !px-7 !py-3.5 !text-base hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 transition-all duration-200"
              >
                Get Started <IconArrowRight size={17} />
              </button>
              <button
                onClick={() => {
                  const el = document.querySelector('#system');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary !px-7 !py-3.5 !text-base hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                See how it works
              </button>
            </div>
          </div>

          {/* Live demo — one calm story at a time */}
          <div className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <LiveSettlement />
          </div>
        </div>
      </section>

      {/* ==================== THE SYSTEM (scroll journey) ==================== */}
      <section id="system" className="relative">
        <AmbientBackground variant="journey" />
        <SettlementJourney />
      </section>

      {/* ==================== THE ENGINE (interactive algorithm) ==================== */}
      <section id="engine" className="relative overflow-hidden py-16 sm:py-24 bg-slate-50/70 dark:bg-slate-900/40">
        <AmbientBackground variant="engine" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-brand-600 dark:text-brand-400 uppercase flex items-center gap-2">
                <IconSparkles size={13} /> THE SETTLEMENT ENGINE
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
                Fewer payments, computed.
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                Expenses become balances. Balances become net positions. The engine matches debtors with creditors and
                reduces everything to the fewest payments needed to reach zero.
              </p>
              <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed">
                The same engine powers every group in the app — no spreadsheets, no mental math.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-brand-200/70 dark:border-brand-800/60 bg-brand-50/60 dark:bg-brand-900/20 px-5 py-3.5">
                <IconCheckCircle size={18} className="text-brand-600 dark:text-brand-400 shrink-0" />
                <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">One payment. Done.</p>
              </div>
            </div>
            <AlgorithmShowcase />
          </div>
        </div>
      </section>

      {/* ======================= SHORT STATEMENTS ======================= */}
      <section className="py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8 sm:grid-cols-3 text-center sm:text-left">
          <div className="animate-fade-up">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Less calculating.</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">SettleUp handles the math.</p>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Fewer payments.</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              The settlement engine simplifies what everyone owes.
            </p>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">More clarity.</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              See the entire group&apos;s financial picture at a glance.
            </p>
          </div>
        </div>
      </section>

      {/* ========================== FEATURE GRID ========================== */}
      <section id="features" className="relative overflow-hidden py-16 sm:py-20 bg-slate-50/70 dark:bg-slate-900/40">
        <AmbientBackground variant="features" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-10">
            <p className="text-xs font-bold tracking-[0.2em] text-brand-600 dark:text-brand-400 uppercase flex items-center gap-2">
              <IconSparkles size={13} /> FEATURES
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">Everything you need to settle up.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={0.05 + i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ======================= PRODUCT PREVIEW ======================= */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-600 dark:text-brand-400 uppercase flex items-center justify-center gap-2">
            <IconSparkles size={13} /> INSIDE THE APP
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            A clear picture the moment you open it.
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Your groups, your balances, and the exact payment that clears them — no tables, no spreadsheets.
          </p>
        </div>
        <div className="px-4 sm:px-6">
          <ProductPreview onNavigate={onNavigate} />
        </div>
      </section>

      {/* ========================== FINAL CTA ========================== */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-500" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">Ready to settle up?</h2>
          <p className="mt-4 text-white/85 text-lg">Start splitting expenses without the spreadsheet headache.</p>
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-700 text-base font-semibold px-8 py-3.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-brand-600"
            >
              Get Started <IconArrowRight size={17} />
            </button>
          </div>
          <p className="mt-4 text-sm text-white/70">Money sorted. Friendship intact.</p>
        </div>
      </section>

      {/* =========================== FOOTER =========================== */}
      <footer className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Built as a portfolio project — Spring Boot + React.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
