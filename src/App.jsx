import React from "react";
import YouTube from "react-youtube";

import { BrowserRouter, Switch, Route } from "react-router-dom";
import {
  AuthRedirect,
  Room,
  Create,
  ConnectToSession,
  Home,
  FourOhFour,
} from "./routes";
import { Terms } from "./routes/Terms";
import { Privacy } from "./routes/Privacy";

import { ModalSystem } from "./modals";

import "./styles/App.css";
import { playerStore } from "./stores";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/create" exact component={Create} />
        <Route path="/auth" exact component={AuthRedirect} />
        <Route path="/session/:id" component={Room} />
        <Route path="/session" component={ConnectToSession} exact />
        <Route path="/privacy" component={Privacy} />
        <Route path="/tou" component={Terms} />
        <Route path="/yt" component={Yt} />
        <Route path="/" component={FourOhFour} />
      </Switch>
      <ModalSystem />
    </BrowserRouter>
  );
}
export default App;

class Yt extends React.Component {
  state = {
    id: "QIN5_tJRiyY",
  };
  onReady = ({ target }) => {
    this.target = target;
    console.log("ready");
    target.seekTo(100);
    target.playVideo();
    setTimeout(() => {
      this.setState(
        {
          id: "iDjQSdN_ig8",
        },
        () => {
          setTimeout(() => {
            this.target.playVideo();
          }, 1000);
        }
      );
    }, 100);
  };

  render() {
    return (
      <YouTube
        opts={{
          playerVars: {
            controls: 0,
          },
        }}
        videoId={this.state.id}
        onReady={this.onReady}
        onStateChange={console.log}
      />
    );
  }
}
