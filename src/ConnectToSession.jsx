import React from "react";
import { useHistory } from "react-router-dom";
import Layout from "./Layout";

export const ConnectToSession = () => {
  const [code, setCode] = React.useState("");
  const history = useHistory();

  const submit = () => {
    history.push("/session/" + code);
  };

  return (
    <Layout>
      <div>Enter session code:</div>
      <form onSubmit={submit}>
        <div>
          <input
            type="text"
            placeholder="Code"
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div>
          <button type="submit">Go to session</button>
        </div>
      </form>
    </Layout>
  );
};
