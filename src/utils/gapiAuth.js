import { observable } from "mobx";

export const gapiSignedIn = observable.box(false);
let gapiAuth;

export const initClient = async () => {
  console.log("init");
  await window.gapi.client.init({
    apiKey: process.env.REACT_APP_GAPI_KEY,
    clientId: process.env.REACT_APP_GAPI_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
    ],
  });
  console.log(window.gapi.client.youtube);
  gapiAuth = window.gapi.auth2.getAuthInstance();
  gapiSignedIn.set(gapiAuth.isSignedIn.get());
  gapiAuth.isSignedIn.listen((isSignedIn) => {
    console.log("isslignedin", isSignedIn);
    gapiSignedIn.set(isSignedIn);
  });
};

window.gapi.load("client:auth2", initClient);
export const signIn = () => {
  console.log("signin");

  gapiAuth.signIn().then(() => {
    gapiSignedIn.set(true);
  });
};
