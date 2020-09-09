import { extendObservable, action } from "mobx";

export class RequestStore {
  subscription = null;
  constructor() {
    extendObservable(this, {
      requests: new Set(),
      requestsOpen: false,
    });
  }

  subscribeToRequests = (sessionId) => {
    this.subscription = new EventSource(
      "https://messages.pogify.net/requests/" + sessionId
    );
    this.subscription.onopen(() => {
      this.requestsOpen = true;
    });
    this.subscription.onerror((e) => {
      console.error(e);
    });
    this.subscription.onmessage(({ data }) => {
      this.requests.add(data);
    });
  };

  unsubscribeToRequests = action(() => {
    if (this.subscription) {
      this.subscription.close();
      this.subscription = null;
      this.requestsOpen = false;
    }
  });

  removeRequest = (item) => {
    this.requests.delete(item);
  };
}
