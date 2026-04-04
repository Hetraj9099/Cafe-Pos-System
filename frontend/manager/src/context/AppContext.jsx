import { createContext, useEffect, useState } from 'react';
import { managerApi } from '../services/api';

const STORAGE_KEY = 'pos-cafe-manager-state';

const initialState = {
  token: '',
  user: null,
  overview: null,
  staff: [],
  attendance: []
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
    if (!state.token) {
      return;
    }

    const [overviewResponse, staffResponse, attendanceResponse] = await Promise.all([
      managerApi.getOverview(state.token),
      managerApi.listStaff(state.token),
      managerApi.listAttendance(state.token)
    ]);

    setState((current) => ({
      ...current,
      overview: overviewResponse.data,
      staff: staffResponse.data,
      attendance: attendanceResponse.data
    }));
  };

  useEffect(() => {
    if (!state.token) {
      return undefined;
    }

    refreshData().catch(() => {});
    const interval = setInterval(() => {
      refreshData().catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [state.token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await managerApi.login({ email, password });
      setState((current) => ({
        ...current,
        token: response.data.token,
        user: response.data.user
      }));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setState(initialState);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const createStaff = async (payload) => {
    await managerApi.createStaff(state.token, payload);
    await refreshData();
  };

  const markAttendance = async (payload) => {
    await managerApi.markAttendance(state.token, payload);
    await refreshData();
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        loading,
        refreshData,
        login,
        logout,
        createStaff,
        markAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};