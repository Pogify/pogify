import { extendObservable, autorun } from "mobx";

export class PlaylistStore {
  constructor(messenger) {
    this.messenger = messenger;
    this.googleAuth = null;
    extendObservable(this, {
      signedIn: false,
      playlists: [],
      gapiInit: false,
    });
    let signedInAutorunDisposer = autorun(async (r) => {
      console.log("this.signedIn", this.signedIn);
      if (this.signedIn) {
        r.dispose();
        const playlists = await window.gapi.client.youtube.playlists.list({
          part: "snippet",
          mine: "true",
          maxResults: "25",
        });
        this.playlists.replace(playlists.result.items);
        console.log(this.playlists);
      }
    });
    window.gapi.load("client:auth2", this.initClient);
  }

  initClient = async () => {
    console.log("init");
    await window.gapi.client.init({
      apiKey:
        process.env.REACT_APP_GAPI_KEY ||
        "AIzaSyAinhOijmpXDxJR-zgIfYXYkiXs0X2dmRk",
      clientId:
        process.env.REACT_APP_GAPI_CLIENT_ID ||
        "444153529634-g6ha2c41cb6g97v1it7kbkgd36d0cpvm.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/youtube.readonly",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
      ],
    });
    this.googleAuth = window.gapi.auth2.getAuthInstance();
    this.signedIn = this.googleAuth.isSignedIn.get();
    this.googleAuth.isSignedIn.listen((isSignedIn) => {
      console.log("isslignedin", isSignedIn);
      this.signedIn = isSignedIn;
    });
    this.gapiInit = true;
  };

  signIn = () => {
    console.log("signin");

    this.googleAuth.signIn().then(() => {
      this.signedIn = true;
    });
  };
}
