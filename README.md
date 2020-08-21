# Pogify

> I just want like my songs to play on your computer when I uh, when I play them on my computer.
>
> -- <cite>Michael Reeves</cite>

Listen to music with your live audience without getting DMCA-striked!

[View code on GitHub](https://github.com/pogify/pogify.github.io)
/
[Join Discord Server](https://discord.gg/bEfdQp)

<!-- ![logo](./img/logo.png ) -->
<img src="img/logo.png" width=300 style="margin:5px 50%; transform: translateX(-50%);">

> ### 🚧⛔ Pogify is still in its infancy and undergoing rapid development. It is **NOT** production ready. Do **NOT** expect it to work to any capacity. ⛔🚧

> ### ❗❗❗ Important Notice: Pogify does **NOT** stream audio of the host of a listening session. ❗❗❗

## Help keep our dev servers running

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PMHPX79UJJVTA&item_name=Pogify&currency_code=USD&source=url)

## Features

- A single host can control the playback of an almost unlimited audience live.
- A host can play, pause, seek, and skip track and listeners will also live.
- A host an use any Spotify solution they want to control playback granted they keep `Pogify` open.
- [planned feature] verified sessions with permalink.
- Want to see a feature? Request it with an issue.

## Mechanism

Pogify does **NOT** stream audio from the host of a listening session. Instead, pogify collects metadata (ie. current song, current timestamp in the song, etc.) of a host and forwards it to listeners as soon as possible. Listeners wait for metadata events and reacts accordingly.

### Tech Stack

- Nginx
  - with [push_stream_module](https://github.com/wandenberg/nginx-push-stream-module)
    - module enables us to handle 60k connections on one VPS (single core, 1GB).
- Google Firebase
  - Realtime Database & Authentication
    - uses anonymous sign in and the realtime database to implement a rate limiter for cloud functions
  - Cloud Functions
    - enables serverless api endpoints for rapid development.
    - performs session authorization to limit malicious calls.
- React JS

### Flow

1. Hosts start a session and begin sending updates to cloud functions.
2. Cloud functions check rate limits and authorization.
3. Cloud function forwards updates to our nginx server.
4. nginx then propagates to all listeners.
5. listener clients react to updates.

## Rate Limit

Rate limits to cloud function endpoints are enforced per host. Listeners are not limited.

Current Limit: 100 calls per 5 minutes.

## Known Issues / Limitations

- ### Pogify does **NOT** work on Safari, or Mobile Browsers
  - This is a limitation of the Spotify Web Playback SDK.
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
- State updates by the Spotify Web Player SDK makes two plus updates per state change. There is not yet a solution to consolidate and/or drop an update and not post an update.
- Pogify does not yet comply 100% with Spotify Developer Agreement. We are working as fast as possible to remedy this shortfall.
- there are no tests.
- And probably many more I forgot about

## Contributing

- Make a pull request
- Open an issue
- Message an admins
- Join us on Discord: https://discord.gg/WdV3yt
- [donate](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PMHPX79UJJVTA&item_name=Pogify&currency_code=USD&source=url) to keep our dev servers running
