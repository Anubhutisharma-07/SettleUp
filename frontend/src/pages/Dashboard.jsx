import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import ErrorAlert from '../components/ErrorAlert';
import BrandMark from '../components/BrandMark';
import NetworkGraph from '../components/NetworkGraph';
import { AnimatedValue, FlowRing } from '../components/motion';
import { formatMoney } from '../utils/format';
import {
  IconPlus,
  IconChevronRight,
  IconSearch,
  IconLogout,
  IconUsers,
  IconWallet,
  IconSpinner,
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconCheckCircle,
  IconReceipt,
  IconActivity,
  IconHandshake,
} from '../components/Icons';

function formatGroupDate(iso) {
  if (!iso) return 'Tap to open';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Tap to open';
  return `Created ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function greetingFor(hour) {
  if (hour < 5) return 'Working late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/* Tiny money-flow arrow used in the flows panel. */
function FlowArrow() {
  return (
    <span className="relative inline-flex items-center justify-center w-14 h-[2px] mx-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-visible">
      <span className="absolute right-0 -top-[3px] w-0 h-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-brand-500" />
      <span className="flow-line is-visible absolute inset-0" />
    </span>
  );
}

export default function Dashboard({ onNavigate, onSelectGroup }) {
  /* onSelectGroup(group, tab?) — optional tab: 'settlements' | 'balances' | ... */
  const { auth, logout } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  /* Per-group enrichment: members, expenses, balances, settlements.
     Fetched after groups load; failures degrade gracefully. */
  const [enriched, setEnriched] = useState({}); // groupId -> { members, expenses, balances, settlements }
  const [preview, setPreview] = useState({}); // groupId -> same shape (lazy, hover-triggered)
  const previewCache = useRef({});
  const enrichedStarted = useRef(false);

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError('');
    enrichedStarted.current = false;
    try {
      const data = await api.getGroups(auth.token);
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* Enrich every group once groups are known (best-effort). */
  useEffect(() => {
    if (loading || error || groups.length === 0 || enrichedStarted.current) return;
    enrichedStarted.current = true;
    (async () => {
      const results = await Promise.all(
        groups.map(async (g) => {
          try {
            const [members, expenses, balances, settlements] = await Promise.all([
              api.getMembers(g.id, auth.token),
              api.getExpenses(g.id, auth.token),
              api.getBalances(g.id, auth.token),
              api.getSettlements(g.id, auth.token),
            ]);
            return [g.id, { members, expenses, balances, settlements }];
          } catch {
            return [g.id, null];
          }
        })
      );
      const map = {};
      results.forEach(([id, val]) => {
        if (val) map[id] = val;
      });
      setEnriched(map);
    })();
  }, [groups, loading, error, auth.token]);

  /* Lazy hover preview (cached). */
  const loadPreview = async (group) => {
    if (previewCache.current[group.id]) {
      setPreview((p) => ({ ...p, [group.id]: previewCache.current[group.id] }));
      return;
    }
    setPreview((p) => ({ ...p, [group.id]: { loading: true } }));
    try {
      const [members, expenses, balances, settlements] = await Promise.all([
        api.getMembers(group.id, auth.token),
        api.getExpenses(group.id, auth.token),
        api.getBalances(group.id, auth.token),
        api.getSettlements(group.id, auth.token),
      ]);
      const data = { members, expenses, balances, settlements };
      previewCache.current[group.id] = data;
      setPreview((p) => ({ ...p, [group.id]: data }));
    } catch {
      setPreview((p) => ({ ...p, [group.id]: { loading: false, failed: true } }));
    }
  };

  /* --------------------------------------------------------------- */
  /*  Aggregate "your position" from real balances + settlements     */
  /* --------------------------------------------------------------- */
  const myId = Number(auth.userId);

  let owedToMe = 0;
  let iOwe = 0;
  let settledGroups = 0;
  const flows = []; // { direction: 'in'|'out', name, amount, group }
  const activity = [];

  groups.forEach((g) => {
    const e = enriched[g.id];
    if (!e) return;
    const mine = (e.balances || []).find((b) => Number(b.userId) === myId);
    if (mine) {
      const net = Number(mine.netBalance) || 0;
      if (net > 0.005) owedToMe += net;
      else if (net < -0.005) iOwe += -net;
    }
    const activeSettlements = (e.settlements || []).filter((s) => Number(s.amount) > 0.005);
    if (activeSettlements.length === 0) settledGroups += 1;

    activeSettlements.forEach((s) => {
      if (Number(s.fromUserId) === myId) {
        flows.push({ direction: 'out', name: s.toUserName, amount: Number(s.amount), group: g.name });
      } else if (Number(s.toUserId) === myId) {
        flows.push({ direction: 'in', name: s.fromUserName, amount: Number(s.amount), group: g.name });
      }
    });

    (e.expenses || []).forEach((exp) => {
      activity.push({
        kind: 'expense',
        id: `${g.id}-exp-${exp.id}`,
        group: g.name,
        text: exp.description,
        amount: Number(exp.amount) || 0,
        byId: exp.paidBy,
        date: exp.expenseDate ? new Date(exp.expenseDate).getTime() : 0,
      });
    });
    activeSettlements.forEach((s, idx) => {
      const mineOut = Number(s.fromUserId) === myId;
      activity.push({
        kind: 'settlement',
        id: `${g.id}-set-${idx}`,
        group: g.name,
        from: mineOut ? auth.name : s.fromUserName,
        to: mineOut ? s.toUserName : auth.name,
        mine: mineOut,
        amount: Number(s.amount),
        date: 1, // settlements have no date; keep them after undated expenses, before dated? keep at top-ish
      });
    });
  });

  /* Quick-action targets, derived from real data. */
  const settleTarget = groups.find(
    (g) => enriched[g.id] && (enriched[g.id].settlements || []).some((s) => Number(s.amount) > 0.005)
  );
  const balancesTarget = groups.find((g) => enriched[g.id] && (enriched[g.id].balances || []).length > 0);

  const net = owedToMe - iOwe;
  const isFullySettled = iOwe <= 0.005 && owedToMe <= 0.005;
  const settledPercent = groups.length === 0 ? 100 : Math.round((settledGroups / groups.length) * 100);

  /* Activity stream: dated expenses desc, then suggested settlements. */
  const activityStream = [...activity]
    .sort((a, b) => (b.date || 0) - (a.date || 0) || (b.kind === 'settlement' ? 1 : 0) - (a.kind === 'settlement' ? 1 : 0))
    .slice(0, 6);

  const firstName = (auth.name || 'friend').trim().split(/\s+/)[0];

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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ======================= GREETING ======================= */}
        <div className="animate-fade-up">
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">{greetingFor(new Date().getHours())},</p>
          <h1 className="mt-0.5 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {firstName}.
          </h1>
        </div>

        {error && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ErrorAlert>{error}</ErrorAlert>
            <button onClick={loadGroups} className="btn-secondary !py-2">
              Retry
            </button>
          </div>
        )}

        {/* ================== CENTERPIECE: YOUR POSITION ================== */}
        <section className="mt-7 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="card rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_1.1fr]">
              {/* Left: the big number */}
              <div className="relative p-7 sm:p-9 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800">
                {isFullySettled ? (
                  <div className="flex flex-col items-start gap-4">
                    <div className="flex items-center gap-3">
                      <FlowRing percent={100} size={84} stroke={7}>
                        <BrandMark size={30} animated={false} className="text-brand-500" />
                      </FlowRing>
                      <div>
                        <p className="text-xs font-bold tracking-widest text-brand-600 dark:text-brand-400 uppercase">
                          You&apos;re all settled
                        </p>
                        <p className="mt-1 font-mono text-5xl font-extrabold text-slate-900 dark:text-white leading-none">
                          ₹0
                        </p>
                      </div>
                    </div>
                    <div className="settled-pop inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-4 py-2">
                      <IconCheckCircle size={16} />
                      <span className="text-sm font-bold">Nothing to pay. Everyone's square. Nice.</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                      {groups.length > 0
                        ? `All ${groups.length} group${groups.length !== 1 ? 's are' : ' is'} square. Start a new one whenever.`
                        : 'Create a group and add your first expense to get going.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-5">
                    <div className="flex items-center gap-4">
                      <FlowRing percent={settledPercent} size={84} stroke={7}>
                        <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">
                          {settledPercent}%
                        </span>
                      </FlowRing>
                      <div>
                        <p className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                          {net >= 0 ? 'You are owed in total' : 'You owe in total'}
                        </p>
                        <p
                          className={`mt-1 font-mono text-5xl font-extrabold leading-none tabular-nums ${
                            net >= 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500 dark:text-rose-400'
                          }`}
                        >
                          <AnimatedValue value={Math.abs(net)} format={(v) => formatMoney(v)} />
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {owedToMe > 0.005 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-3 py-1.5 text-xs font-bold">
                          <IconArrowRight size={12} className="rotate-180" /> {formatMoney(owedToMe)} coming in
                        </span>
                      )}
                      {iOwe > 0.005 && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-3 py-1.5 text-xs font-bold">
                          <IconArrowRight size={12} /> {formatMoney(iOwe)} to pay
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: real settlement flows + your personal network */}
              <div className="p-7 sm:p-9">
                <p className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
                  <IconActivity size={13} /> Your money flows
                </p>

                {flows.length === 0 ? (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-5">
                    <span className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <IconCheck size={18} strokeWidth={3} />
                    </span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No pending payments — everyone is square with you.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {flows.slice(0, 3).map((f, i) => (
                      <div
                        key={`${f.direction}-${f.name}-${f.group}-${i}`}
                        className="flex items-center gap-2 animate-fade-up"
                        style={{ animationDelay: `${0.15 + i * 0.12}s` }}
                      >
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ring-2 ring-white dark:ring-slate-900 ${
                            f.direction === 'out'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                              : 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                          }`}
                        >
                          {f.direction === 'out' ? 'YOU' : (f.name || '?').slice(0, 2).toUpperCase()}
                        </span>
                        <FlowArrow />
                        <span
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ring-2 ring-white dark:ring-slate-900 ${
                            f.direction === 'out'
                              ? 'bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300'
                              : 'text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {f.direction === 'out' ? (f.name || '?').slice(0, 2).toUpperCase() : 'YOU'}
                        </span>
                        <div className="ml-2 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                            {f.direction === 'out' ? (
                              <>
                                You pay {f.name} <span className="font-mono text-brand-600 dark:text-brand-400">{formatMoney(f.amount)}</span>
                              </>
                            ) : (
                              <>
                                {f.name} pays you <span className="font-mono text-brand-600 dark:text-brand-400">{formatMoney(f.amount)}</span>
                              </>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{f.group} · suggested</p>
                        </div>
                      </div>
                    ))}
                    {flows.length > 3 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">+{flows.length - 3} more in your groups</p>
                    )}

                    {/* Your personal settlement network (real flows, clickable) */}
                    {flows.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-3 self-start">
                          Your settlement network — click a payment
                        </p>
                        <NetworkGraph
                          flows={flows}
                          onOpenGroup={(groupName) => {
                            const g = groups.find((grp) => grp.name === groupName);
                            if (g) onSelectGroup(g);
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================== QUICK ACTIONS (state-aware) ================== */}
        <section className="mt-8 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => settleTarget && onSelectGroup(settleTarget, 'settlements')}
              disabled={!settleTarget}
              className={`btn-primary ${!settleTarget ? 'opacity-40 pointer-events-none' : ''}`}
            >
              <IconHandshake size={16} /> Settle Up
            </button>
            <button
              onClick={() => balancesTarget && onSelectGroup(balancesTarget, 'balances')}
              disabled={!balancesTarget}
              className={`btn-secondary ${!balancesTarget ? 'opacity-40 pointer-events-none' : ''}`}
            >View Balances</button>
            <button onClick={openCreateModal} className="btn-secondary">Create Group</button>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto hidden sm:block">
              {settleTarget
                ? `Next up: ${settleTarget.name}`
                : 'Nothing pending — add an expense to get moving.'}
              
            </span>
          </div>
        </section>

        {/* ========================= GROUPS ========================= */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Your groups</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading ? 'Loading your groups…' : `${groups.length} group${groups.length !== 1 ? 's' : ''} · hover a card for the full picture`}
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
              {filtered.map((group, gi) => {
                const e = enriched[group.id];
                const totalSpent = e ? (e.expenses || []).reduce((s, x) => s + (Number(x.amount) || 0), 0) : null;
                const memberCount = e ? (e.members || []).length : null;
                const openCount = e ? (e.settlements || []).filter((s) => Number(s.amount) > 0.005).length : null;
                const mine = e ? (e.balances || []).find((b) => Number(b.userId) === myId) : null;
                const myNet = mine ? Number(mine.netBalance) || 0 : null;
                const pv = preview[group.id];
                const showPv = pv && !pv.loading && !pv.failed;

                return (
                  <div
                    key={group.id}
                    onMouseEnter={() => loadPreview(group)}
                    onFocus={() => loadPreview(group)}
                    className="group card p-5 text-left transition-all duration-200 hover:border-brand-400/70 dark:hover:border-brand-500/60 hover:shadow-card-md cursor-pointer animate-fade-up"
                    style={{ animationDelay: `${0.15 + gi * 0.07}s` }}
                    onClick={() => onSelectGroup(group)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        onSelectGroup(group);
                      }
                    }}
                    title="Open group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar id={group.id} name={group.name} size="lg" className="!rounded-2xl" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{group.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatGroupDate(group.createdAt)}
                        </p>
                      </div>
                      <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <IconChevronRight size={16} />
                      </span>
                    </div>

                    {/* summary strip (from enrichment; falls back to placeholders) */}
                    <div className="mt-4 flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-600 dark:text-slate-300">
                        <IconUsers size={11} /> {memberCount ?? '·'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-600 dark:text-slate-300 font-mono">
                        <IconWallet size={11} /> {totalSpent === null ? '·' : formatMoney(totalSpent)}
                      </span>
                      {openCount !== null && (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
                            openCount > 0
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                              : 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                          }`}
                        >
                          <IconHandshake size={11} /> {openCount > 0 ? `${openCount} to settle` : 'all settled'}
                        </span>
                      )}
                      {myNet !== null && Math.abs(myNet) > 0.005 && (
                        <span
                          className={`ml-auto font-mono font-bold text-xs ${
                            myNet > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-rose-500 dark:text-rose-400'
                          }`}
                        >
                          {myNet > 0 ? '+' : '−'}
                          {formatMoney(Math.abs(myNet))} you
                        </span>
                      )}
                    </div>

                    {/* hover preview — real data, lazy-loaded */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                      <div className="overflow-hidden">
                        {pv?.loading && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-pulse">
                            <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                            <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                          </div>
                        )}
                        {showPv && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div className="flex -space-x-2">
                                {(pv.members || []).slice(0, 5).map((m) => (
                                  <Avatar key={m.id} id={m.userId} name={`User ${m.userId}`} size="sm" />
                                ))}
                                {(pv.members || []).length > 5 && (
                                  <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                                    +{(pv.members || []).length - 5}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                {(pv.expenses || []).length} expense{(pv.expenses || []).length !== 1 ? 's' : ''} ·{' '}
                                {(pv.settlements || []).filter((s) => Number(s.amount) > 0.005).length} payment
                                {(pv.settlements || []).filter((s) => Number(s.amount) > 0.005).length !== 1 ? 's' : ''} needed
                              </p>
                            </div>
                            {(pv.settlements || []).filter((s) => Number(s.amount) > 0.005).length > 0 && (
                              <div className="mt-3 space-y-1.5">
                                {(pv.settlements || [])
                                  .filter((s) => Number(s.amount) > 0.005)
                                  .slice(0, 2)
                                  .map((s, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">{s.fromUserName}</span>
                                      <IconArrowRight size={11} className="text-brand-500" />
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">{s.toUserName}</span>
                                      <span className="ml-auto font-mono font-bold text-brand-600 dark:text-brand-400">
                                        {formatMoney(s.amount)}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No search match */}
          {!loading && !error && groups.length > 0 && filtered.length === 0 && (
            <div className="card py-12 text-center rounded-2xl">
              <IconAlert size={22} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No groups match “{query}”.</p>
            </div>
          )}
        </section>        {/* ===================== RECENT ACTIVITY (timeline) ===================== */}
        {!loading && !error && activityStream.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconActivity size={18} className="text-brand-500" /> Recent activity
            </h2>
            <div className="relative mt-4 pl-8">
              {/* timeline spine */}
              <div className="timeline-spine absolute left-[15px] top-2 bottom-2 w-[2px]" />
              <div className="space-y-3">
                {activityStream.map((ev, i) => (
                  <div
                    key={ev.id}
                    className="relative animate-fade-up"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {/* timeline node */}
                    <span
                      className={`absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-4 ring-slate-100 dark:ring-slate-950 ${
                        ev.kind === 'settlement' ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                    <div className="card p-4 flex items-center gap-3.5 hover:shadow-card-md transition-shadow">
                      <span
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          ev.kind === 'settlement'
                            ? 'bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {ev.kind === 'settlement' ? <IconHandshake size={15} /> : <IconReceipt size={15} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        {ev.kind === 'expense' ? (
                          <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                            Member #{ev.byId} added <span className="font-semibold">{ev.text}</span>
                            <span className="text-slate-400 dark:text-slate-500"> · {ev.group}</span>
                          </p>
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                            Suggested: <span className="font-semibold">{ev.mine ? 'you' : ev.from}</span> pay
                            {ev.mine ? '' : 's'} <span className="font-semibold">{ev.to}</span>
                            <span className="text-slate-400 dark:text-slate-500"> · {ev.group}</span>
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 font-mono text-sm font-bold ${
                          ev.kind === 'settlement' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {ev.kind === 'settlement' && ev.mine ? '−' : ''}
                        {formatMoney(ev.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
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
