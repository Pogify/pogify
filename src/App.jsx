import React from "react";
import { Privacy } from "./routes/Privacy";
import { Terms } from "./routes/Terms";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import {
  AuthRedirect,
  Room,
  Create,
  ConnectToSession,
  Home,
  FourOhFour,
} from "./routes";
import {ModalSystem} from "./modals"
import "./styles/App.css";
import { StoreProvider } from "./contexts";

function App() {
  return (
    <StoreProvider>
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
    </StoreProvider> 
  );
}

export default App;
