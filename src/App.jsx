import React from "react";

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
        <Route path="/" component={FourOhFour} />
      </Switch>
      <ModalSystem />
    </BrowserRouter>
  );
}
export default App;
