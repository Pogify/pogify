import React from "react";
import styles from "./index.module.css";
import NewTabLink from "../NewTabLink";
/**
 * Donations button from PayPal
 */
export default function Donations(props) {
  const button = (
    <NewTabLink
      title="Donate to Pogify with PayPal"
      href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PMHPX79UJJVTA&item_name=Pogify&currency_code=USD"
    >
      <button
        border="0"
        name="submit"
        alt="Donate with PayPal button"
        className={styles.donationButton}
      >
        <strong>Donate</strong>
      </button>
    </NewTabLink>
  );
  if (props.noText) {
    return button;
  } else {
    return (
      <div
        className={`${styles.donationsWrapper} ${
          props.className ? props.className : ""
        }`}
      >
        <p
          className={`${styles.donateParagraph} ${
            props.large ? styles.large : ""
          }`}
        >
          Do you like what we're doing? Help us out to keep our servers running!
          Even just one dollar will help.
        </p>
        {button}
      </div>
    );
  }
}
