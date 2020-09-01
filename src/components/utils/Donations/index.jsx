import React from "react";
import styles from "./index.module.css";
/**
 * Donations button from PayPal
 */
export default function Donations() {
  return (
    <div className={styles.donationsWrapper}>
      <p style={{ maxWidth: "55%" }}>
        Do you like what we're doing? Help us out with a donation to keep our
        dev servers running! Even just one dollar will help.
      </p>
      <div style={{ width: "40%" }}>
        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_blank"
          style={{ height: 26, width: 150, margin: "auto" }}
        >
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value="PMHPX79UJJVTA" />
          <input type="hidden" name="item_name" value="Pogify" />
          <input type="hidden" name="currency_code" value="USD" />
          <button
            border="0"
            name="submit"
            title="PayPal - The safer, easier way to pay online!"
            alt="Donate with PayPal button"
            style={{
              backgroundColor: "#FFC43B",
              color: "#000000",
              margin: "auto",
            }}
          >
            <strong>Donate</strong>
          </button>
        </form>
      </div>
    </div>
  );
}
