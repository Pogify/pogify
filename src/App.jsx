import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { AuthRedirect } from "./AuthRedirect";
import { Room } from "./Room";
import { Create } from "./Create";
import { ConnectToSession } from "./ConnectToSession";
import { Privacy } from "./Privacy";
import { Terms } from "./Terms";
import Home from "./Home";
import "./App.css";

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
        <Route path="/tos" component={Terms} />
        <Route path="/">404</Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
