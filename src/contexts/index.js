import React from "react";
import { ThemeStore, ModalStore } from "../stores";
import { useLocalStore } from "mobx-react";

export const storesContext = React.createContext(null);

export const createStores = () => {
  return {
    themeStore: new ThemeStore(),
    modalStore: new ModalStore(),
  };
};

export const StoreProvider = ({ children }) => {
  const store = useLocalStore(createStores);
  return (
    <storesContext.Provider value={store}>{children}</storesContext.Provider>
  );
};
