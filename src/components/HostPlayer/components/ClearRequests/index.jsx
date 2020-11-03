import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import React from "react";

import styles from "./index.module.css";
import { requestStore } from "../../../../stores";

export default () => {
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: "auto" }} />
      <div className={styles.button} onClick={requestStore.clearRequests}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </div>
    </div>
  );
};
