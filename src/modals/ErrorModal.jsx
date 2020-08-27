import React from "react"
import styled from "styled-components"

const FlexDiv = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ErrorMessageDiv = styled.div`
  text-align: center;
  background: white;
  color: black;
  padding: 10;
  border-radius: 10; 
`

export default function ErrorModal(props) {
  return (
    <FlexDiv>
      <ErrorMessageDiv style={{textAlign: "center", background: "white", color: "black", padding:10, borderRadius: 10}}>
        <h3>Error: {props.errorCode}</h3>
        <p>{props.errorMessage}</p>
        <div>
          {props.children}
        </div>
        <button onClick={props.closeModal}>Close</button>
      </ErrorMessageDiv>
    </FlexDiv>
  )
}