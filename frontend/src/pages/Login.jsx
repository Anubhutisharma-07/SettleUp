import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import ErrorAlert from '../components/ErrorAlert';
import BrandMark from '../components/BrandMark';
import { DEMO } from '../data/demo';
import { IconArrowRight } from '../components/Icons';
import {
  IconSpinner,
  IconCheckCircle,
  IconReceipt,
  IconScale,
  IconSparkles,
  IconArrowLeft,
} from '../components/Icons';

const FEATURES = [
  {
    icon: <IconReceipt size={18} />,
    title: 'Track shared expenses',
    text: 'Log every bill in seconds and keep the whole group on the same page.',
  },
  {
    icon: <IconScale size={18} />,
    title: 'Balances done fairly',
    text: 'See exactly who owes what — no messy mental math or spreadsheets.',
  },
  {
    icon: <IconCheckCircle size={18} />,
    title: 'Settle up in one tap',
    text: 'Get the shortest path to zero debt so everyone pays less, less often.',
  },
];

export default function Login({ onNavigate, mode = 'login' }) {
  const [isSignup, setIsSignup] = useState(mode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isSignup ? await api.signup(name, email, password) : await api.login(email, password);
      login(result);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Left brand panel — the settlement network */}
      <div className="hidden lg:flex w-[46%] relative overflow-hidden bg-brand-500 flex-col justify-between p-12">
        {/* Subtle network backdrop: nodes + converging paths (one ambient animation) */}
        <svg className="absolute inset-0 w-full h-full text-white/25" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="0.3" fill="none">
            <path d="M-5 25 L30 40 L62 18 L105 32" />
            <path d="M-5 78 L38 62 L70 84 L105 66" />
            <path d="M30 40 L38 62" />
            <path d="M62 18 L70 84" />
            <path d="M30 40 L70 84" />
          </g>
          <g fill="currentColor">
            <circle cx="30" cy="40" r="1.4" className="node-breathe" />
            <circle cx="62" cy="18" r="1.1" className="node-breathe" style={{ animationDelay: '-2s' }} />
            <circle cx="38" cy="62" r="1.2" className="node-breathe" style={{ animationDelay: '-4s' }} />
            <circle cx="70" cy="84" r="1.4" className="node-breathe" style={{ animationDelay: '-1s' }} />
          </g>
          <circle r="0.9" fill="#FFFFFF" opacity="0.9">
            <animateMotion dur="7s" repeatCount="indefinite" path="M-5 25 L30 40 L62 18 L105 32" />
          </circle>
          <circle r="0.9" fill="#FFFFFF" opacity="0.7">
            <animateMotion dur="9s" begin="2.5s" repeatCount="indefinite" path="M-5 78 L38 62 L70 84 L105 66" />
          </circle>
        </svg>

        <div className="flex items-center gap-2.5 relative">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <BrandMark size={22} animated={false} className="text-white" />
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Less stress when
            <br />
            sharing expenses
            <br />
            with friends.
          </h1>

          {/* A quiet echo of the settlement story (fictional demo data) */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur px-4 py-3">
            <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${DEMO.people.maya.grad}`} />
            <IconArrowRight size={13} className="text-white/70" />
            <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${DEMO.people.rahul.grad}`} />
            <span className="text-sm font-mono font-bold text-white ml-1">₹900</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 text-white px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
              Settled
            </span>
          </div>

          <ul className="mt-10 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-white/80 mt-0.5 max-w-xs">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-white/70 text-sm flex items-center gap-1.5">
          <IconSparkles size={14} /> Bill splitting, stress-free since day one.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('landing')}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <IconArrowLeft size={16} /> Back
            </button>
            <div className="lg:hidden">
              <Logo size="sm" />
            </div>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm animate-fade-up">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isSignup ? 'Create your SettleUp account.' : 'Welcome back.'}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {isSignup ? 'Track who paid. See who owes. Settle up.' : "Let's settle what matters."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isSignup && (
                <div className="animate-fade-in">
                  <label htmlFor="name" className="label">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Aarav Sharma"
                    className="input"
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="input"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
              </div>

              {error && <ErrorAlert>{error}</ErrorAlert>}

              <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-base">
                {loading ? (
                  <>
                    <IconSpinner size={18} /> Please wait…
                  </>
                ) : isSignup ? (
                  'Create account'
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                or
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <button onClick={() => setIsSignup(!isSignup)} className="btn-secondary w-full mt-6">
              {isSignup ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
