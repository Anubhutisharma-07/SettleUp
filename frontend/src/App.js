import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GroupDetail from './pages/GroupDetail';
import { useAuth } from './AuthContext';

function App() {
  const [page, setPage] = useState('login');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { auth } = useAuth();

  if (!auth) {
    return <Login onNavigate={setPage} />;
  }

  if (page === 'groupDetail' && selectedGroup) {
    return (
      <GroupDetail
        groupId={selectedGroup.id}
        group={selectedGroup}
        onBack={() => setPage('dashboard')}
      />
    );
  }

  return (
    <Dashboard
      onNavigate={setPage}
      onSelectGroup={(group) => {
        setSelectedGroup(group);
        setPage('groupDetail');
      }}
    />
  );
}

export default App;
