const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.message || 'Request failed');
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/pdf')) {
    return response.blob();
  }

  return response.json();
};

export const customerApi = {
  getTableByToken: (token) => request(`/tables/token/${token}`),
  listProducts: () => request('/products?active=true'),
  createOrder: (payload) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getOrder: (orderId) => request(`/orders/${orderId}`),
  processPayment: (payload) =>
    request('/payments/process', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  downloadBill: (orderId) => request(`/payments/orders/${orderId}/bill`),
  emailBill: (orderId, email) =>
    request(`/payments/orders/${orderId}/email`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  getAvailability: (reservationTime) =>
    request(`/reservations/availability?reservationTime=${encodeURIComponent(reservationTime)}`),
  createReservation: (payload) =>
    request('/reservations', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
