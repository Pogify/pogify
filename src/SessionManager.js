import axios from "axios";

import * as firebase from "firebase/app";

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
