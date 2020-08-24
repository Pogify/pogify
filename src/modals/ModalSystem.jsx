import React from "react"
import styled, {keyframes} from "styled-components"
import { useStores } from "../hooks/useStores"
import {observer} from"mobx-react"


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
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  background-color: ${props=> props.theme==="dark"? "rgba(0,0,0,0.5)" : "rgba(255,255,255, 0.5)"};
  animation: ${rotate} 100ms ease-in-out
`


export const ModalSystem = observer(() => {
  let {modalStore, themeStore} = useStores()

  if (modalStore.current) {
    return <ModalDiv theme={themeStore.theme}>{modalStore.current}</ModalDiv>

  } else {
    return <div></div> 
  }
})
