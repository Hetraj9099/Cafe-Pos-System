import { createContext, useEffect, useState } from 'react';
import { managerApi } from '../services/api';

const STORAGE_KEY = 'pos-cafe-manager-state';

const initialState = {
  token: '',
  user: null,
  overview: null,
  cuisines: [],
  localCuisines: [],
  products: [],
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

const mergeCuisineNames = (apiCuisines = [], localCuisines = [], products = []) => {
  const names = [
    ...apiCuisines.map((cuisine) => cuisine.name),
    ...localCuisines.map((cuisine) => cuisine.name),
    ...products.map((product) => product.category).filter(Boolean)
  ];

  return Array.from(new Set(names))
    .sort((left, right) => left.localeCompare(right))
    .map((name) => ({ id: `cuisine-${name}`, name }));
};

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

    const [overviewResponse, productsResponse, staffResponse, attendanceResponse] = await Promise.all([
      managerApi.getOverview(state.token),
      managerApi.listProducts(state.token),
      managerApi.listStaff(state.token),
      managerApi.listAttendance(state.token)
    ]);

    let apiCuisines = [];

    try {
      const cuisinesResponse = await managerApi.listCuisines(state.token);
      apiCuisines = cuisinesResponse.data;
    } catch (error) {
      apiCuisines = [];
    }

    setState((current) => ({
      ...current,
      overview: overviewResponse.data,
      cuisines: mergeCuisineNames(apiCuisines, current.localCuisines || [], productsResponse.data),
      products: productsResponse.data,
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

  const signup = async ({ name, email, password, role = 'admin' }) => {
    setLoading(true);
    try {
      const response = await managerApi.register({ name, email, password, role });
      setState((current) => ({
        ...current,
        token: response.data.token,
        user: response.data.user
      }));
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    try {
      return await managerApi.forgotPassword({ email });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ email, otp, password }) => {
    setLoading(true);
    try {
      return await managerApi.resetPassword({ email, otp, password });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setState(initialState);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const createProduct = async (payload) => {
    await managerApi.createProduct(state.token, payload);
    await refreshData();
  };

  const createCuisine = async (payload) => {
    const cuisineName = payload.name.trim();

    try {
      await managerApi.createCuisine(state.token, { name: cuisineName });
      setState((current) => {
        const localCuisines = current.localCuisines || [];
        const alreadyExists = localCuisines.some(
          (entry) => entry.name.toLowerCase() === cuisineName.toLowerCase()
        );
        const nextLocalCuisines = alreadyExists
          ? localCuisines
          : [...localCuisines, { id: `local-${cuisineName}`, name: cuisineName }];

        return {
          ...current,
          localCuisines: nextLocalCuisines,
          cuisines: mergeCuisineNames(current.cuisines || [], nextLocalCuisines, current.products || [])
        };
      });
      await refreshData();
    } catch (error) {
      const cuisine = {
        id: `local-${cuisineName}`,
        name: cuisineName
      };

      setState((current) => {
        const localCuisines = current.localCuisines || [];
        if (localCuisines.some((entry) => entry.name.toLowerCase() === cuisineName.toLowerCase())) {
          return current;
        }

        const nextLocalCuisines = [...localCuisines, cuisine];

        return {
          ...current,
          localCuisines: nextLocalCuisines,
          cuisines: mergeCuisineNames(current.cuisines || [], nextLocalCuisines, current.products || [])
        };
      });
    }
  };

  const updateProduct = async (productId, payload) => {
    await managerApi.updateProduct(state.token, productId, payload);
    await refreshData();
  };

  const createStaff = async (payload) => {
    await managerApi.createStaff(state.token, payload);
    await refreshData();
  };

  const updateStaff = async (staffId, payload) => {
    await managerApi.updateStaff(state.token, staffId, payload);
    await refreshData();
  };

  const deleteStaff = async (staffId) => {
    await managerApi.deleteStaff(state.token, staffId);
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
        signup,
        requestPasswordReset,
        resetPassword,
        logout,
        createCuisine,
        createProduct,
        updateProduct,
        createStaff,
        updateStaff,
        deleteStaff,
        markAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
