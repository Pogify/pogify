import React from 'react';

import NewTabLink from "./NewTabLink";

import styles from "./PoweredBySpotify.module.css";

export default function SpotifyLogo() {
    return (
        <div className={styles.poweredBySpotifyWrapper}>
            <NewTabLink href="https://www.spotify.com" title="Visit Spotify's website" className={styles.noDecorationLink} style={{ textDecoration: "none" }}>
                <p className={styles.text}>Playback powered by</p>
                <img
                    alt=""
                    className={styles.spotifyLogo}
                    src="/Spotify_Logo_Green.svg"
                />
            </NewTabLink>
        </div>
    )
}
