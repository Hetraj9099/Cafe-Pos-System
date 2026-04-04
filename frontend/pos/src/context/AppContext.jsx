import { createContext, useEffect, useState } from 'react';
import { posApi } from '../services/api';

const STORAGE_KEY = 'pos-cafe-pos-state';

const initialState = {
  token: '',
  user: null,
  session: null,
  tables: [],
  products: [],
  orders: [],
  selectedTableId: ''
};

const readState = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch (error) {
    return initialState;
  }
};

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(readState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const refreshData = async () => {
    const [tablesResponse, productsResponse, ordersResponse] = await Promise.all([
      posApi.listTables(),
      posApi.listProducts(),
      posApi.listOrders()
    ]);

    setState((current) => ({
      ...current,
      tables: tablesResponse.data,
      products: productsResponse.data,
      orders: ordersResponse.data
    }));
  };

  useEffect(() => {
    if (!state.token) {
      return undefined;
    }

    refreshData().catch(() => {});
    const interval = setInterval(() => {
      refreshData().catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [state.token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await posApi.login({ email, password });
      const sessionResponse = await posApi.openSession(
        response.data.token,
        response.data.user.id
      );

      setState((current) => ({
        ...current,
        token: response.data.token,
        user: response.data.user,
        session: sessionResponse.data
      }));

      await refreshData();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (state.token && state.session?.id) {
      await posApi.closeSession(state.token, state.session.id).catch(() => {});
    }

    setState(initialState);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const createTable = async (payload) => {
    const response = await posApi.createTable(state.token, payload);
    await refreshData();
    return response.data;
  };

  const setSelectedTableId = (selectedTableId) => {
    setState((current) => ({ ...current, selectedTableId }));
  };

  const getSelectedOrder = () => {
    return state.orders.find(
      (order) => order.table_id === state.selectedTableId && order.status !== 'paid'
    );
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        loading,
        refreshData,
        login,
        logout,
        createTable,
        setSelectedTableId,
        getSelectedOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
