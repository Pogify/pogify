import React from "react";
import { themeStore, modalStore } from "../stores";
import { useLocalStore } from "mobx-react";

export const storesContext = React.createContext(null);

export const createStores = () => {
  return {
    themeStore,
    modalStore,
  };
};

export const StoreProvider = ({ children }) => {
  const store = useLocalStore(createStores);
  return (
    <storesContext.Provider value={store}>{children}</storesContext.Provider>
  );
};
