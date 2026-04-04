import { createContext, useState } from 'react';

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [appState] = useState({
    module: 'pos'
  });

  return <AppContext.Provider value={appState}>{children}</AppContext.Provider>;
};
