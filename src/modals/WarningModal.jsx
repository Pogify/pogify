import React from "react"
import styled from "styled-components"

const FlexDiv = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: white;
  color: black;
  border-radius: 10px;
`

const WarningMessageDiv = styled.div`
  text-align: center;
  background: white;
  color: black;
  padding: 10px;
  border-radius: 10px; 
`

/**
 * Default warning modal
 * 
 * @param {{title: string, content: string}} props title and message to show
 */
export default function WarningModal(props) {
    return (
        <FlexDiv>
            <WarningMessageDiv>
                <h3>{props.title}</h3>
                <p>{props.content}</p>
                <button onClick={props.closeModal}>Close</button>
            </WarningMessageDiv>
        </FlexDiv>
    )
}