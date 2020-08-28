import React from 'react'

import NewTabLink from "./NewTabLink"


export default function SpotifyLogo() {
    return (
        <div style={{ marginTop: "30px" }}>
            <p style={{ margin: 0, fontSize: "0.6em" }}>Playback powered by</p>
            <NewTabLink href="https://www.spotify.com" title="Visit Spotify's website">
                <img
                    alt=""
                    width="80px"
                    height="24px"
                    style={{ verticalAlign: "middle", padding: 12 }}
                    src="/Spotify_Logo_Green.svg"
                />
            </NewTabLink>
        </div>
    )
}
