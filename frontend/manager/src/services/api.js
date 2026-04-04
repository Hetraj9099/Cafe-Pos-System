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
  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  forgotPassword: (payload) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  resetPassword: (payload) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getOverview: (token) =>
    request('/dashboard/overview', {
      headers: authHeaders(token)
    }),
  listCuisines: (token) =>
    request('/products/cuisines', {
      headers: authHeaders(token)
    }),
  createCuisine: (token, payload) =>
    request('/products/cuisines', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }),
  listProducts: (token) =>
    request('/products', {
      headers: authHeaders(token)
    }),
  createProduct: (token, payload) =>
    request('/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }),
  updateProduct: (token, productId, payload) =>
    request(`/products/${productId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
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
  updateStaff: (token, staffId, payload) =>
    request(`/users/staff/${staffId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }),
  deleteStaff: (token, staffId) =>
    request(`/users/staff/${staffId}`, {
      method: 'DELETE',
      headers: authHeaders(token)
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
