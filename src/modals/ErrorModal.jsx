import React from "react";

import styles from "./modals.module.css";

/**
 * Default error modal
 * 
 * @param {{errorCode: string|number, errorMessage: string}} props code and message to show
 */
export default function ErrorModal(props) {
  return (
    <div className={styles.flexDiv}>
      <div className={styles.errorDiv}>
        <h3>Error: {props.errorCode}</h3>
        <p>{props.errorMessage}</p>
        <div>
          {props.children}
        </div>
        <button onClick={props.closeModal}>Close</button>
      </div>
    </div>
  )
}