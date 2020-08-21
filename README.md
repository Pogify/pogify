# Pogify

Pogify allows a Spotify user to host a listening session with an almost unlimited audience.

> ## 🚧⛔ Pogify is still in its infancy and undergoing rapid development. It is **NOT** production ready. Do **NOT** expect it to work at capacity. ⛔🚧

> ## ❗❗❗ Important Notice: Pogify does **NOT** stream audio of the host of a listening session. ❗❗❗

## Features

- A single host can control the playback of an almost unlimited audience.
- A host an use any spotify solution they want to control playback granted they keep pogify open.
- A host can play, pause, seek, and skip track and listeners will also.
- (planned feature) verified sessions with permalink.

## Mechanism

Pogify does **NOT** stream audio from the host of a listening session. Instead, pogify collects metadata of a host and broadcasts

## Known Issues / Limitations

- ### Pogify does **NOT** work on Safari, or Mobile Browsers
  - ref 1: https://developer.spotify.com/documentation/web-playback-sdk/#supported-browsers
  - ref 2: https://github.com/spotify/web-playback-sdk/issues/10
- Listeners cannot play pause their local spotify
- Session member count is always 0.
- Listener Player will stutter.
- Listener player unexpectedly seek to beginning of track.
- Seeking on a listener player will de-synchronize a listener from the host and will not resynchronize until an update from host.
- Volume Control is not good.
- 'Join Session' / 'Start session' buttons sometimes do not work
- Incomplete error handling
- Leftover console.logs
- No nav bar or alternative
- Sessions may timeout even if its active.
- Navigating away from player screen shows an alert.
- Overall buggy user experience (this project is still in alpha)
- Pogify will unexpectedly automatically redirect to the Spotify login page if it fails to refresh the login session.
- And probably many more I forgot about
