import React from "react";
import { useHistory } from "react-router-dom";
import { Layout } from "../layouts";
import styled from "styled-components";

const CodeInput = styled.input`
  width: calc(100% - 10px);
  padding: 5px;
  border-radius: 12px;
  border-style: solid;
  border-width: 0.5px;
  border-color: rgb(44, 58, 58);
  text-align: center;
  transition: box-shadow 0.3s;

  &:focus {
    outline: none;
    box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24);
  }
`;

export const ConnectToSession = () => {
  const [code, setCode] = React.useState("");
  const history = useHistory();

  const submit = () => {
    history.push("/session/" + code);
  };

  return (
    <Layout>
      <h2 style={{ marginTop: 0 }}>Enter Session Code</h2>
      <form onSubmit={submit} style={{ display: "inline" }}>
        <div>
          <CodeInput
            type="text"
            placeholder="Code"
            onChange={(e) => setCode(e.target.value)}
            style={{}}
            required
          />
        </div>
        <div>
          <button
            type="submit"
            style={{
              width: "100%",
              margin: "auto",
              marginTop: "1rem",
            }}
          >
            Go
          </button>
        </div>
      </form>
    </Layout>
  );
};
