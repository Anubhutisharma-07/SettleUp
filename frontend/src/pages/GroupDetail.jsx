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

function initials(nameOrId) {
  if (typeof nameOrId === 'string' && nameOrId.includes(' ')) {
    return nameOrId.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }
  return `#${nameOrId}`;
}

const TAB_ICONS = {
  expenses: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 4v16" />
    </svg>
  ),
  members: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  balances: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  settlements: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
};

export default function GroupDetail({ groupId, onBack }) {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('expenses');

  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [membersData, expensesData, balancesData, settlementsData] = await Promise.all([
        api.getMembers(groupId, auth.token),
        api.getExpenses(groupId, auth.token),
        api.getBalances(groupId, auth.token),
        api.getSettlements(groupId, auth.token),
      ]);
      setMembers(membersData);
      setExpenses(expensesData);
      setBalances(balancesData);
      setSettlements(settlementsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const tabs = [
    { key: 'expenses', label: 'Expenses' },
    { key: 'members', label: 'Members' },
    { key: 'balances', label: 'Balances' },
    { key: 'settlements', label: 'Settle Up' },
  ];

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Group #{groupId}</p>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              {members.length} member{members.length !== 1 ? 's' : ''} · ₹{totalSpent.toFixed(2)} spent
            </h1>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {TAB_ICONS[tab.key]}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <>
            {activeTab === 'expenses' && (
              <ExpensesTab groupId={groupId} expenses={expenses} onAdded={loadAll} />
            )}
            {activeTab === 'members' && (
              <MembersTab groupId={groupId} members={members} onAdded={loadAll} />
            )}
            {activeTab === 'balances' && <BalancesTab balances={balances} />}
            {activeTab === 'settlements' && <SettlementsTab settlements={settlements} />}
          </>
        )}
      </div>
    </div>
  );
}

function ExpensesTab({ groupId, expenses, onAdded }) {
  const { auth } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.addExpense(groupId, parseFloat(amount), description, auth.token);
      setAmount('');
      setDescription('');
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mb-5 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-800/30"
      >
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₹0.00"
          required
          className="w-28 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was it for?"
          required
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition-colors flex-shrink-0"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{error}</p>}

      {expenses.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
          <p className="text-sm text-slate-500 dark:text-slate-400">No expenses yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800/30">
          {expenses.map((exp, i) => (
            <div
              key={exp.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i !== expenses.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorFor(
                  exp.paidBy
                )}`}
              >
                {initials(exp.paidBy)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
                  {exp.description}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Paid by user #{exp.paidBy}
                </p>
              </div>
              <span className="font-mono text-sm font-medium text-slate-900 dark:text-slate-50 flex-shrink-0">
                ₹{exp.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MembersTab({ groupId, members, onAdded }) {
  const { auth } = useAuth();
  const [userId, setUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.addMember(groupId, parseInt(userId, 10), auth.token);
      setUserId('');
      onAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 mb-5 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-white dark:bg-slate-800/30"
      >
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID to add"
          required
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 transition-colors flex-shrink-0"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{error}</p>}

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800/30">
        {members.map((m, i) => (
          <div
            key={m.id}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              i !== members.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''
            }`}
          >
            <div
              className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorFor(
                m.userId
              )}`}
            >
              {initials(m.userId)}
            </div>
            <span className="flex-1 text-sm text-slate-900 dark:text-slate-50">
              User #{m.userId}
            </span>
            {m.role === 'ADMIN' && (
              <span className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BalancesTab({ balances }) {
  if (balances.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
        <p className="text-sm text-slate-500 dark:text-slate-400">No balances yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800/30">
      {balances.map((b, i) => {
        const isPositive = b.netBalance >= 0;
        return (
          <div
            key={b.userId}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              i !== balances.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''
            }`}
          >
            <div
              className={`w-9 h-9 rounded-md flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorFor(
                b.userId
              )}`}
            >
              {initials(b.userName)}
            </div>
            <span className="flex-1 text-sm text-slate-900 dark:text-slate-50">
              {b.userName}
            </span>
            <span
              className={`font-mono text-sm font-medium ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              ₹{b.netBalance.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SettlementsTab({ settlements }) {
  if (settlements.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-emerald-300 dark:border-emerald-800 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mx-auto mb-2 text-emerald-500"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          All settled up
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Nobody owes anybody anything.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {settlements.map((s, i) => (
        <div
          key={i}
          className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3.5 bg-white dark:bg-slate-800/30"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorFor(
              s.fromUserId
            )}`}
          >
            {initials(s.fromUserName)}
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-600 flex-shrink-0">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorFor(
              s.toUserId
            )}`}
          >
            {initials(s.toUserName)}
          </div>
          <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
            <span className="font-medium text-slate-900 dark:text-slate-50">{s.fromUserName}</span>{' '}
            owes{' '}
            <span className="font-medium text-slate-900 dark:text-slate-50">{s.toUserName}</span>
          </span>
          <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            ₹{s.amount.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}