import React from "react";
import { ThemeStore, ModalStore, PlayerStore } from "../stores";
import { useLocalStore } from "mobx-react";
import EventEmitter from "events";

// storesContext
export const storesContext = React.createContext(null);

// export messenger to allow not stores to send messages
export const messenger = new EventEmitter();

// create store instances
export const createStores = () => {
  return {
    themeStore: new ThemeStore(messenger),
    modalStore: new ModalStore(messenger),
    playerStore: new PlayerStore(messenger),
  };
};

// create storeProvider
export const StoreProvider = ({ children }) => {
  const store = useLocalStore(createStores);
  return (
    <storesContext.Provider value={store}>{children}</storesContext.Provider>
  );
};
