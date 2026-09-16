const BASE_URL = 'http://localhost:8080';

async function request(path, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  signup: (name, email, password) =>
    request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getGroups: (token) => request('/api/groups', {}, token),

  createGroup: (name, token) =>
    request('/api/groups', { method: 'POST', body: JSON.stringify({ name }) }, token),

  getMembers: (groupId, token) => request(`/api/groups/${groupId}/members`, {}, token),

  addMember: (groupId, userId, token) =>
    request(`/api/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }, token),

  getExpenses: (groupId, token) => request(`/api/groups/${groupId}/expenses`, {}, token),

  addExpense: (groupId, amount, description, token) =>
    request(`/api/groups/${groupId}/expenses`, { method: 'POST', body: JSON.stringify({ amount, description }) }, token),

  getBalances: (groupId, token) => request(`/api/groups/${groupId}/balances`, {}, token),

  getSettlements: (groupId, token) => request(`/api/groups/${groupId}/settlements`, {}, token),
};
