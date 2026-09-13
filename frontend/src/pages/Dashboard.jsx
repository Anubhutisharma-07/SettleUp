import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
];

function colorFor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Dashboard({ onNavigate, onSelectGroup }) {
  const { auth, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.createGroup(newGroupName, auth.token);
      setNewGroupName('');
      setShowCreateForm(false);
      loadGroups();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            SettleUp
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colorFor(
              auth.userId
            )}`}
          >
            {initials(auth.name)}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {auth.name}
          </h2>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Your Groups
          </h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New group
          </button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleCreateGroup}
            className="mb-6 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex gap-2 bg-white dark:bg-slate-800/50"
          >
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name — e.g. Goa Trip"
              required
              autoFocus
              className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              {creating ? '...' : 'Create'}
            </button>
          </form>
        )}

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No groups yet — create one to start splitting expenses.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800/30">
            {groups.map((group, i) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left ${
                  i !== groups.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorFor(
                    group.id
                  )}`}
                >
                  {initials(group.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                    {group.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Group #{group.id}
                  </p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-300 dark:text-slate-600 flex-shrink-0"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}