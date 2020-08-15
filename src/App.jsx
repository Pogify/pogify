import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { AuthRedirect } from "./AuthRedirect";
import { Room } from "./Room";
import { Create } from "./Create";
import "./App.css";

const UserContext = React.createContext({});
export const io = window.io;

function App() {
  return (
    <UserContext.Provider value={{}}>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            home
          </Route>
          <Route path="/create" exact component={Create} />
          <Route path="/auth" exact component={AuthRedirect} />
          <Route path="/session/:id" component={Room} />
          <Route path="/">404</Route>
        </Switch>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
