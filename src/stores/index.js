import {
  ThemeStore,
  ModalStore,
  PlayerStore,
  PlaylistStore,
  SearchStore,
  QueueStore,
  RequestStore,
} from "../stores";
import EventEmitter from "events";

export const messenger = new EventEmitter();

export const themeStore = new ThemeStore(messenger);
export const modalStore = new ModalStore(messenger);
export const playerStore = new PlayerStore(messenger);
export const playlistStore = new PlaylistStore();
export const queueStore = new QueueStore();
export const searchStore = new SearchStore();
export const requestStore = new RequestStore();

export * from "./themeStore";
export * from "./modalStore";
export * from "./playerStore";
export * from "./playlistStore";
export * from "./queueStore";
export * from "./searchStore";
export * from "./requestStore";
window.requestStore = requestStore;
