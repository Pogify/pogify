import React from "react";

import styles from "./modals.module.css";

/**
 * Default warning modal
 * 
 * @param {{title: string, content: string}} props title and message to show
 */
export default function WarningModal(props) {
  return (
    <div className={styles.flexDiv}>
      <div className={styles.warningDiv}>
        <h3>{props.title}</h3>
        <p>{props.content}</p>
        <button onClick={props.closeModal}>Close</button>
      </div>
    </div>
  )
}