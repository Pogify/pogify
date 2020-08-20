import axios from "axios";

import * as firebase from "firebase/app";
import "firebase/auth";

var firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);
const FBAuth = firebase.auth();

export const refreshToken = async (session_token) => {
  try {
    await FBAuth.signInAnonymously();
    let res = await axios.get(
      "https://us-central1-pogify-database.cloudfunctions.net/refreshToken",
      {
        headers: {
          Authorization: "Bearer " + session_token,
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
    let { code: errorCode, message: errorMessage } = error;

    if (errorCode === "auth/operation-not-allowed") {
    }
  }
};

export const createSession = async (i = 1) => {
  return new Promise(async (resolve, reject) => {
    try {
      await FBAuth.signInAnonymously();
      let { data } = await axios.post(
        "https://us-central1-pogify-database.cloudfunctions.net/startSession"
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
      if (i == 10) {
        return reject(new Error("max retries reached"));
      }
      setTimeout(() => {
        resolve(createSession(i + 1));
      }, (i / 10) ** 2);
    }
  });
};

export const publishUpdate = async (uri, position, playing, retries = 0) => {
  try {
    firebase.auth().signInAnonymously();
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
          Authorization:
            "Bearer " + window.localStorage.getItem("pogify:token"),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (e) {
    if (e.response) {
      if (e.response.status === 401) {
        // session expired modal or something
        console.error("sessionExpired");
      }
    }
    if (retries < 3) {
      setTimeout(this.publishUpdate, 100, [
        uri,
        position,
        playing,
        retries + 1,
      ]);
    } else {
      throw e;
    }
  }
};
