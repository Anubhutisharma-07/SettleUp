import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import { useAuth } from './AuthContext';

function App() {
  const [page, setPage] = useState('login');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const { auth } = useAuth();

  if (!auth) {
    return <Login onNavigate={setPage} />;
  }

  if (page === 'groupDetail' && selectedGroupId) {
    return (
      <GroupDetail
        groupId={selectedGroupId}
        onBack={() => setPage('dashboard')}
      />
    );
  }

  return (
    <Dashboard
      onNavigate={setPage}
      onSelectGroup={(groupId) => {
        setSelectedGroupId(groupId);
        setPage('groupDetail');
      }}
    />
  );
}

export default App;