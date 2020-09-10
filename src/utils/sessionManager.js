import axios from "axios";
import urlJoin from "url-join";
import { observable } from "mobx";
import promiseRetry from "promise-retry";

import * as firebase from "firebase/app";
import "firebase/auth";

var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// ???: we can avoid all of this rewriting stuff if we use client sdk for endpoint.
// would make dev toggle easier b/c would be using firebase.function dev toggle but idk if can initialize
// without proper firebaseConfig.
let cloudFunctionBaseURL = process.env.REACT_APP_CLOUD_FUNCTION_BASE_URL;

// toggles dev endpoint
if (process.env.NODE_ENV === "development") {
  cloudFunctionBaseURL = process.env.REACT_APP_CLOUD_FUNCTION_EMULATOR_BASE_URL;
}

// set endpoints
var cloudFunctions = {
  refreshToken: urlJoin(cloudFunctionBaseURL, "refreshToken"),
  startSession: urlJoin(cloudFunctionBaseURL, "startSession"),
  postUpdate: urlJoin(cloudFunctionBaseURL, "postUpdate"),
  makeRequest: urlJoin(cloudFunctionBaseURL, "makeRequest"),
};

// lazy load firebase client sdk since only hosts need it
let FBAuth;
function initializeApp() {
  if (process.env.NODE_ENV !== "development") {
    firebase.initializeApp(firebaseConfig);
    FBAuth = firebase.auth();
  } else {
    // dev mock for firebase auth
    FBAuth = {
      signInAnonymously: () => {
        return {
          user: {
            getIdToken: () => Promise.resolve("thisIsNotaToken"),
          },
        };
      },
    };
  }
}

/**
 * Listener count observable
 */
export const SessionCount = observable.box(0);

/**
 * Refresh session token and stick it in localStorage
 */
export const refreshToken = () => {
  if (!FBAuth) initializeApp();

  return promiseRetry(async (retry) => {
    try {
      let user = await FBAuth.signInAnonymously();
      let res = await axios.get(cloudFunctions.refreshToken, {
        headers: {
          "X-Session-Token": window.localStorage.getItem("pogify:token"),
          Authorization: "Bearer " + (await user.user.getIdToken()),
        },
      });

      window.localStorage.setItem("pogify:token", res.data.token);
      window.localStorage.setItem(
        "pogify:expiresAt",
        res.data.expiresIn * 1000 + Date.now()
      );
      return res.data;
    } catch (error) {
      retry(error);
      // TODO: error handling
      //     let { code: errorCode, message: errorMessage } = error;

      //     if (errorCode === "auth/operation-not-allowed") {
      //     }
    }
  });
};

/**
 * create session
 *
 */
export const createSession = () => {
  if (!FBAuth) initializeApp();

  return promiseRetry(async (retry) => {
    try {
      const user = await FBAuth.signInAnonymously();
      let { data } = await axios.post(cloudFunctions.startSession, undefined, {
        headers: {
          Authorization: "Bearer " + (await user.user.getIdToken()),
        },
      });

      window.localStorage.setItem("pogify:token", data.token);
      window.localStorage.setItem(
        "pogify:expiresAt",
        data.expiresIn * 1000 + Date.now()
      );
      window.localStorage.setItem("pogify:session", data.session);
      return data;
    } catch (e) {
      if (e.response) {
        if (e.response.status === 429) {
          let retryAfter = e.response.headers["retry-after"] || 1;

          setTimeout(() => {
            retry(e);
          }, retryAfter * 1000);
        }
      } else {
        retry(e);
      }
    }
  });
};

export const publishUpdate = (videoId, position, playing, queue) => {
  if (!FBAuth) initializeApp();

  return promiseRetry(async (retry) => {
    try {
      let user = await FBAuth.signInAnonymously();
      console.log("publishUpdate", videoId, position, playing, queue);
      let res = await axios.post(
        cloudFunctions.postUpdate,
        {
          videoId,
          position,
          playing,
          queue,
          timestamp: Date.now(),
        },
        {
          headers: {
            "X-Session-Token": window.localStorage.getItem("pogify:token"),
            Authorization: "Bearer " + (await user.user.getIdToken()),
            "Content-Type": "application/json",
          },
        }
      );
      SessionCount.set(res.data.subscribers);
    } catch (e) {
      if (e.response) {
        if (e.response.status === 401) {
          // session expired modal or something
          console.error("sessionExpired");
          // try to refresh token
          try {
            await refreshToken();
          } catch (e) {
            retry(e);
          }
        } else if (e.response.status === 429) {
          let retryAfter = e.response.headers["retry-after"] || 1;

          setTimeout(() => {
            retry(e);
          }, retryAfter * 1000);
        }
      }
    }
  });
};

export const makeRequest = (provider, token, request, session) => {
  return promiseRetry(async (retry) => {
    try {
      return await axios.post(cloudFunctions.makeRequest, {
        provider,
        token,
        request,
        session,
      });
    } catch (e) {
      if (e.response) {
        switch (e.response.status) {
          case 429:
            throw e;
          case 400:
            throw e;
          default:
            retry(e);
        }
      } else {
        throw e;
      }
    }
  });
};
