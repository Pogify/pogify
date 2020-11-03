import { extendObservable, action, computed } from "mobx";

export class RequestStore {
  subscription = null;
  constructor() {
    extendObservable(this, {
      requests: { a: 1, b: 2 },
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
      this.addRequest(data.request);
    });
  };

  stopTakingRequests = () => {
    this.subscription.close();
  };

  addRequest = action((videoId) => {
    if (this.requests[videoId]) {
      this.requests[videoId]++;
    } else {
      this.requests[videoId] = 1;
    }
  });

  requestsByMostRequested = computed(() => {
    return Object.keys(this.requests).sort(
      (a, b) => this.requests[a] - this.requests[b]
    );
  });

  requestsByRecent = computed(() => {
    return Object.keys(this.requests).reverse();
  });

  unsubscribeToRequests = action(() => {
    if (this.subscription) {
      this.subscription.close();
      this.subscription = null;
      this.requestsOpen = false;
    }
  });

  removeRequest = (item) => {
    delete this.requests[item];
  };

  clearRequests = () => {
    this.requests = {};
  };
}
