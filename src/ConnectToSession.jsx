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
      <h2>Enter Session Code</h2>
      <form onSubmit={submit}>
        <div>
          <input
            type="text"
            placeholder="Code"
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: "calc(100% - 10px)",
              padding: "5px",
              textAlign: "center",
            }}
          />
        </div>
        <div>
          <button
            type="submit"
            style={{
              width: "100%",
              margin: 0,
              marginTop: "1rem",
            }}
          >
            Go to session
          </button>
        </div>
      </form>
    </Layout>
  );
};
