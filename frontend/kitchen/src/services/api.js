import API_BASE_URL from '../config/api';

const API_ROOT = `${API_BASE_URL}/api`;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_ROOT}${path}`, {
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

  return response.json();
};

export const kitchenApi = {
  listKitchenOrders: () => request('/orders/kitchen/active'),
  updateOrderStatus: (orderId, status) =>
    request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
  markItemPrepared: (itemId, isPrepared = true) =>
    request(`/orders/items/${itemId}/prepared`, {
      method: 'PATCH',
      body: JSON.stringify({ isPrepared })
    })
};
