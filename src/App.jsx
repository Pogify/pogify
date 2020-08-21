import React from "react";
import { Privacy } from "./routes/Privacy";
import { Terms } from "./routes/Terms";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import { AuthRedirect, Room, Create, ConnectToSession, Home } from "./routes";
import "./styles/App.css";
import { Layout } from "./layouts";

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
        <Route path="/">
          <Layout>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ margin: 0 }}>
                <div>404</div>
              </h1>
              <div>What you are looking for ain't here</div>
              <Link to="/">Go home</Link>
            </div>
          </Layout>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
