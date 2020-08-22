import React from "react";

export const Donations = () => {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ width: "70%", textAlign: "center", margin: "0 auto" }}>
        Do you like what we're doing? Help us out with a donation to keep our
        dev servers running! Even just one dollar will help.
      </div>
      <div style={{ margin: "10px auto", textAlign: "center" }}>
        <form
          action="https://www.paypal.com/cgi-bin/webscr"
          method="post"
          target="_top"
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
      </div>
    </div>
  );
};
