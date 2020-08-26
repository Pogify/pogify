import React from "react";
import { ThemeStore, ModalStore, PlayerStore } from "../stores";
import { useLocalStore } from "mobx-react";
import EventEmitter from "events";

export const storesContext = React.createContext(null);

const messenger = new EventEmitter();

export const createStores = () => {
  return {
    themeStore: new ThemeStore(messenger),
    modalStore: new ModalStore(messenger),
    playerStore: new PlayerStore(messenger),
  };
};
export const StoreProvider = ({ children }) => {
  const store = useLocalStore(createStores);
  return (
    <storesContext.Provider value={store}>{children}</storesContext.Provider>
  );
};
