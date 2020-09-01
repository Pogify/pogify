
import { ThemeStore, ModalStore, PlayerStore } from "../stores";
import EventEmitter from "events";

export const messenger = new EventEmitter();

export const themeStore = new ThemeStore(messenger)
export const modalStore = new ModalStore(messenger)
export const playerStore = new PlayerStore(messenger)


export * from "./themeStore";
export * from "./modalStore";
export * from "./playerStore";