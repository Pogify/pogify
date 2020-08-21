# Pogify

> I just want like my songs to play on your computer when I uh, when I play them on my computer.
>
> -- <cite>Michael Reeves</cite>

Listen to music with your live audience without getting DMCA-striked!

[View code on GitHub](https://github.com/pogify/pogify.github.io)
/
[Join Discord Server](https://discord.gg/bEfdQp)

![logo](./img/logo.png)

> ### 🚧⛔ Pogify is still in its infancy and undergoing rapid development. It is **NOT** production ready. Do **NOT** expect it to work to any capacity. ⛔🚧

> ### ❗❗❗ Important Notice: Pogify does **NOT** stream audio of the host of a listening session. ❗❗❗

## Features

- A single host can control the playback of an almost unlimited audience.
- A host an use any Spotify client for their own listening.
- When the host plays, pauses, seeks, or skips a track, the listeners' Spotify player will do the same.
- (Planned Feature) Twitch streamers can create permanent session links.

## Mechanism

Pogify does **NOT** stream audio from the host of a listening session. Instead, Pogify collects metadata from the host (ex. current song, current timestamp in the song, etc.) and broadcasts it to their entire audience. 

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
