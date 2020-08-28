import React from "react"
import styled, { keyframes } from "styled-components"
import { modalStore, themeStore } from "../stores"
import { observer } from "mobx-react"


const rotate = keyframes`
  from {
    opacity: 0
  }

  to {
    opacity: 1
  }
`;
const ModalDiv = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  background-color: ${props => props.theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255, 0.5)"};
  animation: ${rotate} 100ms ease-in-out;
`

/**
 * Shows current modal from modal store
 */
export const ModalSystem = observer(() => {

  if (modalStore.current) {
    return <ModalDiv theme={themeStore.theme}>{modalStore.current}</ModalDiv>

  } else {
    return <div></div>
  }
})
