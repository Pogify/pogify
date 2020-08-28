import React from "react";

/**
 * Donations button from PayPal
 */

/**
 * TODO: We should replace that button, it's awfully ugly. A simple highlighted button will do
 */
export const Donations = () => {
  return (
    <form
      action="https://www.paypal.com/cgi-bin/webscr"
      method="post"
      target="_blank"
      style={{ height: 26, width: 92 }}
    >
      <input type="hidden" name="cmd" value="_donations" />
      <input type="hidden" name="business" value="PMHPX79UJJVTA" />
      <input type="hidden" name="item_name" value="Pogify" />
      <input type="hidden" name="currency_code" value="USD" />
      <input
        type="image"
        src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
        border="0"
        name="submit"
        title="PayPal - The safer, easier way to pay online!"
        alt="Donate with PayPal button"
      />
    </form>
  );
};
