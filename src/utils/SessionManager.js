import axios from "axios";

import * as firebase from "firebase/app";
import "firebase/auth";

var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// lazy load firebase client sdk since only hosts need it
let app;
let FBAuth;

function initializeApp() {
  app = firebase.initializeApp(firebaseConfig);
  FBAuth = firebase.auth();
}

export const refreshToken = async (session_token) => {
  if (!app || !FBAuth) initializeApp();

  try {
    let user = await FBAuth.signInAnonymously();
    let res = await axios.get(
      "https://us-central1-pogify-database.cloudfunctions.net/refreshToken",
      {
        headers: {
          "X-Session-Token": window.localStorage.getItem("pogify:token"),
          Authorization: "Bearer " + (await user.user.getIdToken()),
        },
      }
    );

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
  if (!app || !FBAuth) initializeApp();

  return new Promise(async (resolve, reject) => {
    try {
      const user = await FBAuth.signInAnonymously();
      let { data } = await axios.post(
        "https://us-central1-pogify-database.cloudfunctions.net/startSession",
        undefined,
        {
          headers: {
            Authorization: "Bearer " + (await user.user.getIdToken()),
          },
        }
      );

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
  if (!app || !FBAuth) initializeApp();

  try {
    let user = await FBAuth.signInAnonymously();
    await axios.post(
      "https://us-central1-pogify-database.cloudfunctions.net/postUpdate",
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
