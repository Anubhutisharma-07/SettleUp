import { useEffect, useRef, useState } from 'react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import { useAuth } from './AuthContext';
import { useReducedMotion } from './components/motion';
import BrandMark from './components/BrandMark';

/* Short brand overlay when entering the app (Login → Dashboard):
   the mark settles while three network dots converge on it. */
function AppEnterTransition() {
  const dots = [
    { dx: '-64px', dy: '-48px', delay: '0s' },
    { dx: '64px', dy: '-40px', delay: '0.07s' },
    { dx: '0px', dy: '60px', delay: '0.14s' },
  ];
  return (
    <div className="app-enter-overlay" aria-hidden="true">
      <div className="relative">
        <BrandMark size={72} animated={false} className="app-enter-mark text-brand-500" />
        {dots.map((d, i) => (
          <span
            key={i}
            className="enter-dot absolute left-1/2 top-1/2 w-2.5 h-2.5 -ml-[5px] -mt-[5px] rounded-full bg-brand-400"
            style={{ '--dx': d.dx, '--dy': d.dy, animationDelay: d.delay }}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  // Pre-auth pages: 'landing' | 'login' | 'signup'. Post-auth: 'dashboard' | 'groupDetail'.
  const [page, setPage] = useState('landing');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupTab, setGroupTab] = useState('expenses');
  const { auth } = useAuth();
  const reduced = useReducedMotion();

  // Track the moment auth flips from signed-out to signed-in.
  const [entering, setEntering] = useState(false);
  const prevAuthRef = useRef(null);

  useEffect(() => {
    const wasSignedIn = Boolean(prevAuthRef.current);
    prevAuthRef.current = auth;
    if (!wasSignedIn && auth) {
      setEntering(true);
      const t = setTimeout(() => setEntering(false), 620);
      return () => clearTimeout(t);
    }
    if (wasSignedIn && !auth) {
      setEntering(false);
    }
    return undefined;
  }, [auth]);

  if (!auth) {
    if (page === 'login' || page === 'signup') {
      return <Login onNavigate={setPage} mode={page} />;
    }
    return <Landing onNavigate={setPage} />;
  }

  return (
    <>
      {!reduced && entering && <AppEnterTransition />}
      {page === 'groupDetail' && selectedGroup ? (
        <GroupDetail
          groupId={selectedGroup.id}
          group={selectedGroup}
          initialTab={groupTab}
          onBack={() => setPage('dashboard')}
        />
      ) : (
        <Dashboard
          onNavigate={setPage}
          onSelectGroup={(group, tab) => {
            setSelectedGroup(group);
            setGroupTab(tab || 'expenses');
            setPage('groupDetail');
          }}
        />
      )}
    </>
  );
}

export default App;
