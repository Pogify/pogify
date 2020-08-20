import React from "react";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { AuthRedirect } from "./AuthRedirect";
import { Room } from "./Room";
import { Create } from "./Create";
import { ConnectToSession } from "./ConnectToSession";
import Home from "./Home";
import "./App.css";
import Layout from "./Layout";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/create" exact component={Create} />
        <Route path="/auth" exact component={AuthRedirect} />
        <Route path="/session/:id" component={Room} />
        <Route path="/session" component={ConnectToSession} exact />
        <Route path="/">
          <Layout>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ margin: 0 }}>
                <div>404</div>
              </h1>
              <div>What you were looking for isn't here</div>
              <Link to="/">Go home</Link>
            </div>
          </Layout>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
