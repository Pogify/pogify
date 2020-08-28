import React from "react";
import { useHistory } from "react-router-dom";
import { Layout } from "../../layouts";

import styles from "./index.module.css";


/**
 * Code input to connect to a session.
 */
export const ConnectToSession = () => {
  const [code, setCode] = React.useState("");
  const history = useHistory();

  // submit handler. redirects to session
  const submit = () => {
    history.push("/session/" + code);
  };

  return (
    <Layout>
      <h2 className="noMarginTop" >Enter Session Code</h2>
      <form onSubmit={submit} className="inline">
        <div>
          <input
            className={styles.codeInput}
            type="text"
            placeholder="Code"
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div>
          <button
            type="submit"
            className={styles.submit}
          >
            Go
          </button>
        </div>
      </form>
    </Layout >
  );
};

export default ConnectToSession