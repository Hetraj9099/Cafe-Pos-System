import { createContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'pos-cafe-customer-state';

const defaultState = {
  module: 'customer',
  table: null,
  customer: {
    name: '',
    phone: '',
    email: ''
  },
  cart: [],
  checkoutMode: 'order',
  latestOrder: null,
  latestReservation: null
};

const readStoredState = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch (error) {
    return defaultState;
  }
};

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(readStoredState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateCustomer = (payload) => {
    setState((current) => ({
      ...current,
      customer: {
        ...current.customer,
        ...payload
      }
    }));
  };

  const setTable = (table) => {
    setState((current) => ({ ...current, table }));
  };

  const setCheckoutMode = (checkoutMode) => {
    setState((current) => ({ ...current, checkoutMode }));
  };

  const addToCart = (product) => {
    setState((current) => {
      const existing = current.cart.find((item) => item.productId === product.id);

      if (existing) {
        return {
          ...current,
          cart: current.cart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      return {
        ...current,
        cart: [
          ...current.cart,
          {
            productId: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            category: product.category
          }
        ]
      };
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    setState((current) => ({
      ...current,
      cart: current.cart
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    }));
  };

  const clearCart = () => {
    setState((current) => ({ ...current, cart: [] }));
  };

  const setLatestOrder = (latestOrder) => {
    setState((current) => ({ ...current, latestOrder }));
  };

  const setLatestReservation = (latestReservation) => {
    setState((current) => ({ ...current, latestReservation }));
  };

  const resetOrderFlow = () => {
    setState((current) => ({
      ...current,
      cart: [],
      checkoutMode: 'order'
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        updateCustomer,
        setTable,
        setCheckoutMode,
        addToCart,
        updateCartQuantity,
        clearCart,
        setLatestOrder,
        setLatestReservation,
        resetOrderFlow
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
