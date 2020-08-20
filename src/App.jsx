import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { AuthRedirect } from "./AuthRedirect";
import { Room } from "./Room";
import { Create } from "./Create";
import { ConnectToSession } from "./ConnectToSession";
import Home from "./Home";
import "./App.css";

import * as firebase from "firebase/app";
import "firebase/auth";

var firebaseConfig = {
  apiKey: "AIzaSyAkaNtHvfJIMLWeWeh1DXLvcN7ybA2yKeo",
  authDomain: "pogify-database.firebaseapp.com",
  databaseURL: "https://pogify-database.firebaseio.com",
  projectId: "pogify-database",
  storageBucket: "pogify-database.appspot.com",
  messagingSenderId: "444153529634",
  appId: "1:444153529634:web:777b677d348ef6b544117b",
  measurementId: "G-TWFDPX1RPF",
};

firebase.initializeApp(firebaseConfig);

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/create" exact component={Create} />
        <Route path="/auth" exact component={AuthRedirect} />
        <Route path="/session/:id" component={Room} />
        <Route path="/session" component={ConnectToSession} exact />
        <Route path="/">404</Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
