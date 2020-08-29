import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { CaptureConsole } from "@sentry/integrations";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing(), new CaptureConsole()],
  tracesSampleRate: 1.0,
});
console.log(process.env.npm_package_version);
ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback="An error has occurred" showDialog>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
window.onerror = (evt, source, lineno, colno, error) => {
  let eventId = Sentry.captureException(error);
  Sentry.showReportDialog({ eventId });
  console.error(error);
};

window.onunhandledrejection = (e) => {
  let eventId = Sentry.captureException(e);
  Sentry.showReportDialog({ eventId });
  console.error(e);
};
