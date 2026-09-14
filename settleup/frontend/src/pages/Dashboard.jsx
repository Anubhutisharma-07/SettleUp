import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import ErrorAlert from '../components/ErrorAlert';
import {
  IconPlus,
  IconChevronRight,
  IconSearch,
  IconLogout,
  IconUsers,
  IconWallet,
  IconSpinner,
  IconAlert,
  IconSparkles,
} from '../components/Icons';

function formatGroupDate(iso) {
  if (!iso) return 'Tap to open';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Tap to open';
  return `Created ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

export default function Dashboard({ onNavigate, onSelectGroup }) {
  const { auth, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getGroups(auth.token);
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewGroupName('');
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.createGroup(newGroupName, auth.token);
      setNewGroupName('');
      setShowCreateModal(false);
      loadGroups();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  const filtered = groups.filter((g) => g.name && g.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Logo />
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <Avatar id={auth.userId} name={auth.name} size="sm" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[10rem] truncate">
                {auth.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Sign out"
            >
              <IconLogout size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-up">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-500 p-6 sm:p-8 shadow-card-lg">
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-1/3 w-48 h-48 rounded-full bg-white/10" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-brand-100 text-sm font-medium flex items-center gap-1.5">
                <IconSparkles size={14} /> Welcome back
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{auth.name}</h1>
              <p className="mt-1.5 text-white/85 text-sm">
                {groups.length > 0
                  ? `You're part of ${groups.length} group${groups.length !== 1 ? 's' : ''} — pick one to settle up.`
                  : 'Create your first group and start splitting expenses fairly.'}
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur text-white shrink-0">
              <IconWallet size={30} />
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your Groups</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading ? 'Loading your groups…' : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {groups.length > 3 && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <IconSearch size={15} />
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search groups"
                    className="input !pl-9 sm:w-52"
                  />
                </div>
              )}
              <button onClick={openCreateModal} className="btn-primary shrink-0">
                <IconPlus size={16} /> New group
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <ErrorAlert>{error}</ErrorAlert>
              <button onClick={loadGroups} className="btn-secondary !py-2">
                Retry
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="card p-5 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && groups.length === 0 && (
            <div className="card border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none rounded-3xl py-16 px-6 text-center animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <IconUsers size={30} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No groups yet</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Groups keep shared expenses tidy — create one for a trip, flat, or dinner crew and add friends to it.
              </p>
              <button onClick={openCreateModal} className="btn-primary mt-6">
                <IconPlus size={16} /> Create your first group
              </button>
            </div>
          )}

          {/* Group cards */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className="group card p-5 flex items-center gap-4 text-left transition-all duration-200
                    hover:border-brand-400/70 dark:hover:border-brand-500/60 hover:shadow-card-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
                >
                  <Avatar id={group.id} name={group.name} size="lg" className="!rounded-2xl" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{group.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatGroupDate(group.createdAt)}</p>
                  </div>
                  <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <IconChevronRight size={16} />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No search match */}
          {!loading && !error && groups.length > 0 && filtered.length === 0 && (
            <div className="card py-12 text-center rounded-2xl">
              <IconAlert size={22} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No groups match “{query}”.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Create group modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a new group"
        subtitle="Name it after the trip, flat, or occasion."
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label htmlFor="groupName" className="label">
              Group name
            </label>
            <input
              id="groupName"
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Goa Trip 2026"
              required
              autoFocus
              className="input"
            />
          </div>
          {createError && <ErrorAlert>{createError}</ErrorAlert>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="btn-primary min-w-[7rem]">
              {creating ? (
                <>
                  <IconSpinner size={16} /> Creating…
                </>
              ) : (
                <>
                  <IconPlus size={16} /> Create
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
