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

export const posApi = {
  login: (payload) =>
    request('/auth/login', {
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
  createTable: (token, payload) =>
    request('/tables', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload)
    }),
  listProducts: () => request('/products?active=true'),
  listOrders: () => request('/orders?activeOnly=true'),
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
  processPayment: (payload) =>
    request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
