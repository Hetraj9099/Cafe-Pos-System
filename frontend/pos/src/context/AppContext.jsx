import { createContext, useEffect, useState } from 'react';
import { posApi } from '../services/api';

const STORAGE_KEY = 'pos-cafe-pos-state';

const initialState = {
  token: '',
  user: null,
  session: null,
  tables: [],
  manualTableStatuses: {},
  reservations: [],
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

const getTimeValue = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getLatestOrderForTable = (orders, tableId) =>
  orders
    .filter((order) => order.table_id === tableId)
    .sort((left, right) => getTimeValue(right.created_at) - getTimeValue(left.created_at))[0] ||
  null;

const getLatestReservationForTable = (reservations, tableId) =>
  reservations
    .filter((reservation) => reservation.table_id === tableId && reservation.status === 'reserved')
    .sort(
      (left, right) =>
        getTimeValue(right.reservation_time || right.created_at) -
        getTimeValue(left.reservation_time || left.created_at)
    )[0] || null;

const deriveTableData = (table, orders, reservations, manualTableStatuses = {}) => {
  const latestOrder = getLatestOrderForTable(orders, table.id);
  const latestReservation = getLatestReservationForTable(reservations, table.id);
  const latestOrderTime = getTimeValue(latestOrder?.created_at);
  const reservationAnchorTime = getTimeValue(
    latestReservation?.reservation_time || latestReservation?.created_at
  );
  const reservationServed =
    Boolean(latestReservation) &&
    latestOrder?.status === 'paid' &&
    latestOrderTime >= reservationAnchorTime;
  const activeReservation = reservationServed ? null : latestReservation;
  const manualStatus = manualTableStatuses[table.id] ?? table.manual_status ?? null;

  let derivedStatus = 'Available';

  if (activeReservation && (!latestOrder || latestOrder.status === 'created')) {
    derivedStatus = 'Reserved';
  } else {
    switch (latestOrder?.status) {
      case 'created':
        derivedStatus = 'Occupied';
        break;
      case 'sent':
      case 'preparing':
        derivedStatus = 'Cooking';
        break;
      case 'completed':
        derivedStatus = 'Ready';
        break;
      case 'paid':
        derivedStatus = 'Available';
        break;
      default:
        derivedStatus = activeReservation ? 'Reserved' : 'Available';
        break;
    }
  }

  return {
    ...table,
    latest_order: latestOrder,
    active_reservation: activeReservation,
    derived_status: derivedStatus,
    status: manualStatus || derivedStatus
  };
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(readState);
  const [loading, setLoading] = useState(false);
  const [recentlyPaidTableIds, setRecentlyPaidTableIds] = useState([]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const refreshData = async () => {
    const [tablesResponse, reservationsResponse, productsResponse, ordersResponse] = await Promise.all([
      posApi.listTables(),
      posApi.listReservations(),
      posApi.listProducts(),
      posApi.listOrders({})
    ]);

    setState((current) => {
      const resolvedTables = tablesResponse.data.map((table) =>
        deriveTableData(
          table,
          ordersResponse.data,
          reservationsResponse.data,
          current.manualTableStatuses || {}
        )
      );

      return {
        ...current,
        tables: resolvedTables,
        reservations: reservationsResponse.data,
        products: productsResponse.data,
        orders: ordersResponse.data
      };
    });
  };

  useEffect(() => {
    if (!state.token) {
      return undefined;
    }

    refreshData().catch(() => {});
    const handleVisibilityRefresh = () => {
      if (document.visibilityState === 'visible') {
        refreshData().catch(() => {});
      }
    };
    const handleFocusRefresh = () => {
      refreshData().catch(() => {});
    };
    const interval = setInterval(() => {
      refreshData().catch(() => {});
    }, 2500);

    window.addEventListener('focus', handleFocusRefresh);
    window.addEventListener('online', handleFocusRefresh);
    document.addEventListener('visibilitychange', handleVisibilityRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocusRefresh);
      window.removeEventListener('online', handleFocusRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityRefresh);
    };
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

  const signup = async ({ name, email, password, role }) => {
    setLoading(true);
    try {
      const response = await posApi.register({ name, email, password, role });
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

  const requestPasswordReset = async (email) => {
    setLoading(true);
    try {
      return await posApi.forgotPassword({ email });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ email, otp, password }) => {
    setLoading(true);
    try {
      return await posApi.resetPassword({ email, otp, password });
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

  const updateTable = async (tableId, payload) => {
    const nextManualStatus =
      payload.manualStatus === undefined ? state.manualTableStatuses?.[tableId] ?? null : payload.manualStatus;

    setRecentlyPaidTableIds((current) => current.filter((id) => id !== tableId));
    setState((current) => {
      const nextManualTableStatuses = { ...(current.manualTableStatuses || {}) };

      if (nextManualStatus) {
        nextManualTableStatuses[tableId] = nextManualStatus;
      } else {
        delete nextManualTableStatuses[tableId];
      }

      const nextTables = current.tables.map((table) =>
        table.id === tableId
          ? deriveTableData(
              { ...table, manual_status: nextManualStatus },
              current.orders,
              current.reservations,
              nextManualTableStatuses
            )
          : table
      );

      return {
        ...current,
        manualTableStatuses: nextManualTableStatuses,
        tables: nextTables
      };
    });

    try {
      const response = await posApi.updateTable(state.token, tableId, payload);
      await refreshData();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const setSelectedTableId = (selectedTableId) => {
    setState((current) => ({ ...current, selectedTableId }));
  };

  const markTableAsPaid = (tableId) => {
    if (!tableId) {
      return;
    }

    setRecentlyPaidTableIds((current) => Array.from(new Set([...current, tableId])));
    window.setTimeout(() => {
      setRecentlyPaidTableIds((current) => current.filter((id) => id !== tableId));
    }, 5000);
  };

  const getSelectedOrder = () => {
    return state.orders.find(
      (order) => order.table_id === state.selectedTableId && order.status !== 'paid'
    );
  };

  const getSelectedReservation = () => {
    const selectedTable = state.tables.find((table) => table.id === state.selectedTableId);
    return selectedTable?.active_reservation || null;
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        loading,
        recentlyPaidTableIds,
        refreshData,
        login,
        signup,
        requestPasswordReset,
        resetPassword,
        logout,
        createTable,
        updateTable,
        setSelectedTableId,
        markTableAsPaid,
        getSelectedOrder,
        getSelectedReservation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
