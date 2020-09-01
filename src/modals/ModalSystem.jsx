import React from "react";
import { modalStore } from "../stores";
import { observer } from "mobx-react";

import styles from "./modals.module.css";

/**
 * Shows current modal from modal store
 */
export const ModalSystem = observer(() => {
  if (modalStore.current) {
    return <div className={styles.modalDiv}>{modalStore.current}</div>;
  } else {
    return null;
  }
});
