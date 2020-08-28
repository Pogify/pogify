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
import { ModalSystem, ErrorModal } from "./modals";
import "./styles/App.css";
import { messenger } from "./contexts";

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

window.onerror = (evt, source, lineno, colno, error) => {
  messenger.emit(
    "POST_MODAL",
    <ErrorModal errorCode={error.name} errorMessage={error.message}>
      <div>{JSON.stringify(evt, undefined, 2)}</div>
      <div>
        {source} {lineno}:{colno}
      </div>
      <div>{JSON.stringify(error, undefined, 2)}</div>
    </ErrorModal>
  );
  console.error(error);
};
