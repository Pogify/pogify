import { extendObservable, action, computed } from "mobx";

export class RequestStore {
  subscription = null;
  constructor() {
    extendObservable(this, {
      requests: {},
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
    return Object.keys(this.requests);
  });

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
