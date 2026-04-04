const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const { headers, ...restOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || 'Request failed');
  }

  return response.json();
};

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`
});

export const managerApi = {
  login: (payload) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getOverview: (token) =>
    request('/dashboard/overview', {
      headers: authHeaders(token)
    }),
  listStaff: (token) =>
    request('/users/staff', {
      headers: authHeaders(token)
    }),
  createStaff: (token, payload) =>
    request('/users/staff', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }),
  listAttendance: (token, date = '') =>
    request(`/users/attendance${date ? `?date=${encodeURIComponent(date)}` : ''}`, {
      headers: authHeaders(token)
    }),
  markAttendance: (token, payload) =>
    request('/users/attendance', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    })
};
