import { extendObservable } from "mobx";

export class RequestStore {
  constructor() {
    extendObservable(this, {
      requests: [],
    });
  }
}
