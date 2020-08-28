import React from "react"
import { modalStore, themeStore } from "../stores"
import { observer } from "mobx-react"

import styles from "./modals.module.css";

/**
 * Shows current modal from modal store
 */
export const ModalSystem = observer(() => {

  if (modalStore.current) {
    return <div className={styles.modalDiv} style={{ backgroundColor: themeStore.theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255, 0.5)" }}>{modalStore.current}</div>

  } else {
    return null
  }
})
