import { createContext, useState } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [appState] = useState({
    module: 'manager'
  });

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};
