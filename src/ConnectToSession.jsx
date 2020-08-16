import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

const FlexDiv = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;

  & > form {
    margin: 10px;
  }

  & > form > div {
    margin: 10px;
  }
`;

export const ConnectToSession = () => {
  const [code, setCode] = React.useState("");
  const history = useHistory();

  const submit = () => {
    history.push("/session/" + code);
  };

  return (
    <FlexDiv>
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
    </FlexDiv>
  );
};
