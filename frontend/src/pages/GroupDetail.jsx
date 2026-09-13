import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Avatar from '../components/Avatar';
import ErrorAlert from '../components/ErrorAlert';
import { formatMoney, initialsOf } from '../utils/format';
import {
  IconPlus,
  IconArrowLeft,
  IconArrowRight,
  IconUsers,
  IconReceipt,
  IconScale,
  IconCheckCircle,
  IconSpinner,
  IconClock,
  IconHandshake,
  IconAlert,
} from '../components/Icons';

const TAB_ICONS = {
  expenses: <IconReceipt size={15} />,
  members: <IconUsers size={15} />,
  balances: <IconScale size={15} />,
  settlements: <IconHandshake size={15} />,
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function GroupDetail({ groupId, group, onBack }) {
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

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const unpaidCount = settlements.filter((s) => Number(s.amount) > 0.005).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="rounded-xl p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Back to groups"
            >
              <IconArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 dark:text-white truncate leading-tight">
                {group?.name || `Group #${groupId}`}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {members.length} member{members.length !== 1 ? 's' : ''} · {formatMoney(totalSpent)} spent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 animate-fade-up">
        {error && (
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <ErrorAlert>{error}</ErrorAlert>
            <button onClick={loadAll} className="btn-secondary !py-2">
              Retry
            </button>
          </div>
        )}

        {/* Stat cards */}
        <section className="grid grid-cols-3 gap-3">
          <div className="card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wide">
              <IconUsers size={13} /> Members
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{members.length}</span>
          </div>
          <div className="card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wide">
              <IconReceipt size={13} /> Expenses
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{expenses.length}</span>
          </div>
          <div className="card p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wide">
              <IconHandshake size={13} /> To settle
            </div>
            <span
              className={`text-2xl font-extrabold ${unpaidCount > 0 ? 'text-amber-500' : 'text-brand-500'}`}
            >
              {unpaidCount}
            </span>
          </div>
        </section>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-card'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {TAB_ICONS[tab.key]}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-5">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'expenses' && (
                <ExpensesTab groupId={groupId} expenses={expenses} members={members} onAdded={loadAll} />
              )}
              {activeTab === 'members' && <MembersTab groupId={groupId} members={members} onAdded={loadAll} />}
              {activeTab === 'balances' && <BalancesTab balances={balances} />}
              {activeTab === 'settlements' && <SettlementsTab settlements={settlements} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ------------------------------ Expenses ---------------------------------- */

function ExpensesTab({ groupId, expenses, members, onAdded }) {
  const { auth } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const memberNameById = {};
  members.forEach((m) => {
    memberNameById[m.userId] = `User #${m.userId}`;
  });

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
      {/* Add expense card */}
      <form onSubmit={handleSubmit} className="card p-4 sm:p-5 mb-5">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <IconPlus size={15} className="text-brand-500" /> Add an expense
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative sm:w-32">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="input font-mono !pl-8"
            />
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was it for? e.g. Dinner at Dragos"
            required
            className="input flex-1"
          />
          <button type="submit" disabled={submitting} className="btn-primary shrink-0">
            {submitting ? <IconSpinner size={16} /> : <IconPlus size={16} />}
            {submitting ? 'Adding…' : 'Add'}
          </button>
        </div>
        {error && (
          <div className="mt-3">
            <ErrorAlert>{error}</ErrorAlert>
          </div>
        )}
      </form>

      {expenses.length === 0 ? (
        <EmptyState
          icon={<IconReceipt size={28} />}
          title="No expenses yet"
          text="Add the first bill above — everyone's balance updates automatically."
        />
      ) : (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center gap-3.5 px-4 sm:px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <Avatar id={exp.paidBy} name={`User ${exp.paidBy}`} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">{exp.description}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {memberNameById[exp.paidBy] || `User #${exp.paidBy}`}
                  </span>
                  {formatDate(exp.expenseDate) && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <IconClock size={11} /> {formatDate(exp.expenseDate)}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <span className="font-mono font-semibold text-slate-900 dark:text-white shrink-0">
                {formatMoney(exp.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Members ----------------------------------- */

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
      <form onSubmit={handleSubmit} className="card p-4 sm:p-5 mb-5">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <IconUsers size={15} className="text-brand-500" /> Add a member
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="number"
            min="1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter the user's ID"
            required
            className="input flex-1"
          />
          <button type="submit" disabled={submitting} className="btn-primary shrink-0">
            {submitting ? <IconSpinner size={16} /> : <IconUsers size={16} />}
            {submitting ? 'Adding…' : 'Add member'}
          </button>
        </div>
        {error && (
          <div className="mt-3">
            <ErrorAlert>{error}</ErrorAlert>
          </div>
        )}
      </form>

      <div className="card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3.5 px-4 sm:px-5 py-4">
            <Avatar id={m.userId} name={`User ${m.userId}`} size="md" />
            <span className="flex-1 font-semibold text-slate-900 dark:text-white">User #{m.userId}</span>
            {m.role === 'ADMIN' ? (
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/40 px-2.5 py-1 rounded-full">
                Admin
              </span>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                Member
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Balances ---------------------------------- */

function BalancesTab({ balances }) {
  if (balances.length === 0) {
    return (
      <EmptyState
        icon={<IconScale size={28} />}
        title="No balances yet"
        text="Once you add expenses, each member's net balance shows up here."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {balances.map((b) => {
        const owes = Number(b.netBalance) < 0;
        const getsBack = Number(b.netBalance) > 0;
        const isEven = Number(b.netBalance) === 0;
        return (
          <div
            key={b.userId}
            className="card p-4 sm:px-5 flex items-center gap-3.5 hover:shadow-card-md transition-shadow"
          >
            <Avatar id={b.userId} name={b.userName} size="lg" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">{b.userName}</p>
              {owes && (
                <p className="text-sm text-rose-500 dark:text-rose-400 mt-0.5">
                  owes <span className="font-mono font-semibold">{formatMoney(Math.abs(b.netBalance))}</span>
                </p>
              )}
              {getsBack && (
                <p className="text-sm text-brand-600 dark:text-brand-400 mt-0.5">
                  gets back <span className="font-mono font-semibold">{formatMoney(b.netBalance)}</span>
                </p>
              )}
              {isEven && <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">is all settled</p>}
            </div>
            <span
              className={`shrink-0 font-mono text-lg font-bold ${
                owes ? 'text-rose-500 dark:text-rose-400' : getsBack ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
              }`}
            >
              {owes ? '−' : getsBack ? '+' : ''}
              {formatMoney(Math.abs(b.netBalance))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Settlements -------------------------------- */

function SettlementsTab({ settlements }) {
  if (settlements.length === 0) {
    return (
      <div className="card border-brand-200 dark:border-brand-800 bg-gradient-to-b from-brand-50 to-white dark:from-brand-900/20 dark:to-slate-900 rounded-2xl py-14 px-6 text-center animate-fade-in">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
          <IconCheckCircle size={32} />
        </div>
        <h3 className="text-lg font-extrabold text-brand-700 dark:text-brand-300">All settled up!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Nobody owes anybody anything. Enjoy the peace.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
        Suggested payments — {settlements.length} transaction{settlements.length !== 1 ? 's' : ''}
      </p>
      {settlements.map((s, i) => (
        <div
          key={i}
          className="card p-4 sm:px-5 flex items-center gap-3 hover:shadow-card-md transition-shadow flex-wrap sm:flex-nowrap"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar id={s.fromUserId} name={s.fromUserName} size="md" />
            <div className="text-center shrink-0">
              <IconArrowRight size={16} className="text-brand-500" />
            </div>
            <Avatar id={s.toUserId} name={s.toUserName} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 dark:text-slate-300 truncate">
              <span className="font-bold text-slate-900 dark:text-white">{s.fromUserName}</span>
              {' '}owes{' '}
              <span className="font-bold text-slate-900 dark:text-white">{s.toUserName}</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {initialsOf(s.fromUserName)} pays {initialsOf(s.toUserName)} directly
            </p>
          </div>
          <span className="shrink-0 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-mono font-bold px-3.5 py-2">
            {formatMoney(s.amount)}
          </span>
        </div>
      ))}
      <div className="flex items-start gap-2 text-xs text-slate-400 dark:text-slate-500 px-1 pt-1">
        <IconAlert size={13} className="mt-0.5 shrink-0" />
        These payments clear all debts using the fewest possible transfers.
      </div>
    </div>
  );
}

/* ------------------------------ Empty state -------------------------------- */

function EmptyState({ icon, title, text }) {
  return (
    <div className="card border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-none rounded-2xl py-14 px-6 text-center animate-fade-in">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">{text}</p>
    </div>
  );
}
