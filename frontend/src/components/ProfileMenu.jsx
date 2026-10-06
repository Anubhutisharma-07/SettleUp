import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import Avatar from './Avatar';
import ErrorAlert from './ErrorAlert';
import { IconChevronRight, IconLogout } from './Icons';

/* Header profile dropdown: shows the signed-in user (loaded from
   /api/users/me) with their email and a sign-out action. */
export default function ProfileMenu({ onAfterLogout }) {
  const { auth, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null); // { id, name, email, createdAt }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const rootRef = useRef(null);
  const inFlightRef = useRef(false);

  /* Load the profile the first time the menu opens. */
  const loadProfile = () => {
    if (profile || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    api
      .getMe(auth.token)
      .then(setProfile)
      .catch((err) => setError(err.message || 'Could not load your profile.'))
      .finally(() => {
        inFlightRef.current = false;
        setLoading(false);
      });
  };

  /* Close on outside click or Escape. */
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadProfile();
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    if (onAfterLogout) onAfterLogout();
  };

  const name = (profile && profile.name) || auth.name || 'You';
  const email = (profile && profile.email) || auth.email || '';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Your profile"
        className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Avatar id={auth.userId} name={name} size="sm" />
        <span className="hidden sm:block max-w-[10rem] truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
          {name}
        </span>
        <IconChevronRight
          size={14}
          className={`hidden sm:block text-slate-400 transition-transform duration-200 ${open ? '-rotate-90' : 'rotate-90'}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card-lg overflow-hidden animate-scale-in z-50"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar id={auth.userId} name={name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                {loading && !email ? 'Loading profile…' : email}
              </p>
            </div>
          </div>
          {error && (
            <div className="px-3 pb-3">
              <ErrorAlert>{error}</ErrorAlert>
            </div>
          )}
          <div className="border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <IconLogout size={15} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
