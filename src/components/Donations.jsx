import React from "react";

export const Donations = () => {
  return (
    <form
      action="https://www.paypal.com/cgi-bin/webscr"
      method="post"
      target="_top"
      style={{height: 26, width: 92}}
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
      <img
        alt=""
        border="0"
        src="https://www.paypal.com/en_US/i/scr/pixel.gif"
        width="1"
        height="1"
      />
    </form>
  );
};
