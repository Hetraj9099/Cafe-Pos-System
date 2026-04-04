import { createContext, useEffect, useState } from 'react';
import { kitchenApi } from '../services/api';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const response = await kitchenApi.listKitchenOrders();
      setOrders(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders().catch(() => {});
    const interval = setInterval(() => {
      refreshOrders().catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider
      value={{
        module: 'kitchen',
        orders,
        loading,
        refreshOrders
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
