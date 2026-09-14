import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import ErrorAlert from '../components/ErrorAlert';
import { IconSpinner, IconCheckCircle, IconReceipt, IconScale, IconSparkles } from '../components/Icons';

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

export default function Login({ onNavigate }) {
  const [isSignup, setIsSignup] = useState(false);
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
      {/* Left brand panel - Splitwise-style */}
      <div className="hidden lg:flex w-[46%] relative overflow-hidden bg-brand-500 flex-col justify-between p-12">
        {/* Decorative blob circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-10 w-64 h-64 rounded-full bg-white/10" />

        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 7V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-2" />
              <path d="M9 12h11" />
              <path d="M16 8.5L19.5 12 16 15.5" />
            </svg>
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
          <div className="lg:hidden">
            <Logo size="sm" to="/login" />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm animate-fade-up">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome to SettleUp
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {isSignup ? 'Create an account to start splitting.' : 'Sign in to split expenses with friends.'}
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
