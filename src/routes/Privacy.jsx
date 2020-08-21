import React from "react";
import { Layout } from "../layouts";

export const Privacy = () => {
  return (
    <Layout>
      <div>
        <h1 id="privacy-policy">Privacy Policy</h1>
        <p>
          If you require any more information or have any questions about our
          privacy policy, please feel free to contact us by email at
          support@pogify.net. At pogify.net, the privacy of our users is
          extremely important to us. This privacy policy document outlines the
          types of personal information that are received and collected by
          pogify.net and how it is used.
        </p>
        <p id="footnote1">
          1: A verified session is a permanent session granted to an
          authenticated user
        </p>
        <h3 id="cookies-and-tokens">Cookies and Tokens:</h3>
        <p>
          Pogify.net does use cookies to store information about visitors
          sessions, record user-specific information regarding pages the user
          accesses or visits, customise web page content based on the user's
          browser type and/or other information that the user sends via his or
          her browser. Pogify.net stores locally Spotify session tokens and
          refresh tokens provided when a user uses the Spotify media player.
          Twitch session tokens and refresh tokens will be stored when a user
          begins a verified session
          <sup>
            <a href="#footnote1">1</a>
          </sup>
          .
        </p>
        <h3 id="user-information">User information:</h3>
        <p>
          Pogify.net stores user information collected from Twitch when a user
          authenticates using Twitch Authentication when creating a verified
          session
          <sup>
            <a href="#footnote1">1</a>
          </sup>
          . The data collected will include the users channel name. This
          infomation will only be stored aslong as the verified session is
          running
        </p>
        <h3 id="children-under-the-age-of-13">Children Under The Age Of 13:</h3>
        <p>
          Pogify.net is <strong>not</strong> intended for children under 13
          years of age. We do <strong>not</strong> knowingly collect personal
          information from children under 13. If you are under 13, please{" "}
          <strong>do not</strong> provide any information on pogify.net.
        </p>
        <h3 id="dispute-resolution">Dispute Resolution:</h3>
        <p>
          If you have any complaints regarding the privacy policy please contact
          us at support@pogify.net. We will investigate and attempt to resolve
          complaints and disputes regarding the use of personal information in
          accordance with the privacy policy.
        </p>
        <p>
          The work on the website and the images, logos, text and other such
          information is the property of Pogify.net ( unless otherwise stated ).
        </p>
      </div>
    </Layout>
  );
};
