import { createContext, useEffect, useState } from 'react';
import { kitchenApi } from '../services/api';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refreshOrders = async (options = {}) => {
    const silent = options.silent === true;

    if (silent) {
      setSyncing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await kitchenApi.listKitchenOrders();
      setOrders(response.data);
    } finally {
      if (silent) {
        setSyncing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const patchOrder = (orderId, transform) => {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? transform(order) : order))
    );
  };

  const patchOrderByItemId = (itemId, transform) => {
    setOrders((current) =>
      current.map((order) => {
        if (!order.items?.some((item) => item.id === itemId)) {
          return order;
        }

        return {
          ...order,
          items: order.items.map((item) => (item.id === itemId ? transform(item, order) : item))
        };
      })
    );
  };

  useEffect(() => {
    refreshOrders().catch(() => {});
    const interval = setInterval(() => {
      refreshOrders({ silent: true }).catch(() => {});
    }, 2500);

    const syncNow = () => {
      refreshOrders({ silent: true }).catch(() => {});
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncNow();
      }
    };

    window.addEventListener('focus', syncNow);
    window.addEventListener('online', syncNow);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', syncNow);
      window.removeEventListener('online', syncNow);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        module: 'kitchen',
        orders,
        loading,
        syncing,
        refreshOrders,
        patchOrder,
        patchOrderByItemId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};