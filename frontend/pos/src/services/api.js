import API_BASE_URL from '../config/api';

const API_ROOT = `${API_BASE_URL}/api`;

const request = async (path, options = {}) => {
  const { headers, ...restOptions } = options;
  const response = await fetch(`${API_ROOT}${path}`, {
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

export const posApi = {
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
  getProfile: (token) =>
    request('/auth/profile', {
      headers: authHeaders(token)
    }),
  openSession: (token, userId) =>
    request('/sessions', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ userId })
    }),
  closeSession: (token, sessionId) =>
    request(`/sessions/${sessionId}/close`, {
      method: 'PATCH',
      headers: authHeaders(token)
    }),
  listTables: () => request('/tables'),
  listReservations: () => request('/reservations'),
  createTable: (token, payload) =>
    request('/tables', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }),
  updateTable: (token, tableId, payload) =>
    request(`/tables/${tableId}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }),
  listProducts: () => request('/products?active=true'),
  listOrders: (filters = { activeOnly: true }) => {
    const params = new URLSearchParams();

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },
  createOrder: (payload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  addOrderItem: (orderId, payload) =>
    request(`/orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  removeOrderItem: (orderId, itemId) =>
    request(`/orders/${orderId}/items/${itemId}`, {
      method: 'DELETE'
    }),
  updateOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  updateCustomer: (customerId, payload) =>
    request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  processPayment: (payload) =>
    request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
