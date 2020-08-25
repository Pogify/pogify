import axios from "axios";
import urlJoin from "url-join";

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

if (process.env.NODE_ENV === "development") {
  cloudFunctionBaseURL = process.env.REACT_APP_CLOUD_FUNCTION_EMULATOR_BASE_URL;
}

var cloudFunctions = {
  refreshToken: urlJoin(cloudFunctionBaseURL, "refreshToken"),
  startSession: urlJoin(cloudFunctionBaseURL, "startSession"),
  postUpdate: urlJoin(cloudFunctionBaseURL, "postUpdate"),
};
console.log(cloudFunctions);

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

export const refreshToken = async (session_token) => {
  if (!FBAuth) initializeApp();

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
    console.error(error);
    // TODO: error handling
    //     let { code: errorCode, message: errorMessage } = error;

    //     if (errorCode === "auth/operation-not-allowed") {
    //     }
  }
};

export const createSession = async (i = 1) => {
  if (!FBAuth) initializeApp();

  return new Promise(async (resolve, reject) => {
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
      resolve(data);
    } catch (e) {
      // backoff retry implementation
      if (i === 10) {
        return reject(new Error("max retries reached"));
      }
      setTimeout(() => {
        resolve(createSession(i + 1));
      }, (i / 10) ** 2);
    }
  });
};

export const publishUpdate = async (uri, position, playing, retries = 0) => {
  if (!FBAuth) initializeApp();

  try {
    let user = await FBAuth.signInAnonymously();
    await axios.post(
      cloudFunctions.postUpdate,
      {
        uri,
        position,
        playing,
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
  } catch (e) {
    if (e.response) {
      if (e.response.status === 401) {
        // session expired modal or something
        console.error("sessionExpired");
      } else if (e.response.status === 429) {
      }
    }
    if (retries < 3) {
      setTimeout(() => publishUpdate(uri, position, playing, retries + 1), 100);
    } else {
      throw e;
    }
  }
};
