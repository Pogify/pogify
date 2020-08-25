# Pogify

<!-- FIXME: change to https when we don't need to redirect -->
<!-- FIXME: change to badge monitor link when proper host -->

[![Website www.pogify.net](https://img.shields.io/website?url=https%3A%2F%2Fpogify.herokuapp.com)](http://www.pogify.net)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PMHPX79UJJVTA&item_name=Pogify&currency_code=USD&source=url)
[![Discord](https://img.shields.io/discord/744265206816833617.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/bU6E9Xj)

> I just want like my songs to play on your computer when I uh, when I play them on my computer.
>
> -- <cite>Michael Reeves</cite>

Listen to music with your live audience without getting DMCA-striked!

[View code on GitHub](https://github.com/pogify/pogify.github.io)
/
[Join Discord Server](https://discord.gg/bU6E9Xj)

<!-- ![logo](./img/logo.png ) -->
<p align="center">
<img src="img/logo.png" width=300 style="margin:5px 50%; transform: translateX(-50%);">
</p>

> ### 🚧⛔ Pogify is still in its infancy and undergoing rapid development. It is **NOT** production ready. Do **NOT** expect it to work to any capacity. ⛔🚧

> ### ❗❗❗ Important Notice: Pogify does **NOT** stream audio of the host of a listening session. ❗❗❗

## Help keep our dev servers running

[![](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PMHPX79UJJVTA&item_name=Pogify&currency_code=USD&source=url)

## Notice:

Pogify only works for Spotify Premium members.

We are looking into solutions for non Spotify Premium users.

## Features

- A single host can control the playback of an almost unlimited audience live.
- A host can play, pause, seek, and skip track and listeners will also be _in real time_.
- A host can use any Spotify solution they want to control playback granted they keep `Pogify` open.
- [planned feature] verified sessions with permalink.
- [planned feature] Listeners can look ahead to upcoming tracks in queue.
- [planned feature] Make song requests.
- Want to see a feature? Request it with an issue.

## Mechanism

Pogify does **NOT** stream audio from the host of a listening session. Instead, pogify collects metadata (ie. current song, current timestamp in the song, etc.) of a host and forwards it to listeners as soon as possible. Listeners wait for metadata events and react accordingly.

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

## Data Collection (Or the lack thereof)

Pogify does not collect and store any of the metadata from its hosts beyond the five minute cache.

Pogify uses Google Firebase's Authentication service to use its anonymous sign in method to enforce api rate limits. Pogify does not use anonymous sign in for any other use.

## Associated Repos

- ### [Pogify/pogify-functions](https://github.com/Pogify/pogify-functions)
  - Pogify's Google Firebase Cloud functions repo

## Known Issues / Limitations

This project is still in alpha and as such, there are still lots of bugs.

Currently the project is deployed on a free tier heroku dyno. Thus, we cannot use SSL with a custom domain. Thus, www.pogify.net redirects to the non-custom pogify.herokuapp.com for the moment.

1. ### Pogify does **NOT** work on Safari, or Mobile Browsers

   - This is a limitation of the Spotify Web Playback SDK.
   - ref 1: https://developer.spotify.com/documentation/web-playback-sdk/#supported-browsers
   - ref 2: https://github.com/spotify/web-playback-sdk/issues/10

2. Listeners cannot play pause their local spotify
3. Session member count is always 0.
4. Listener Player will stutter.
5. Listener player unexpectedly seek to beginning of track.
6. Seeking on a listener player will de-synchronize a listener from the host and will not resynchronize until an update from host.
7. ~~Volume Control is not good.~~
8. 'Join Session' / 'Start session' buttons sometimes do not work
9. Incomplete error handling
10. Leftover console.logs
11. No nav bar or alternative
12. Sessions may timeout even if its active.
13. ~~Navigating away from player screen shows an alert.~~
14. Pogify will unexpectedly automatically redirect to the Spotify login page if it fails to refresh the login session.
15. ~~State updates by the Spotify Web Player SDK makes two plus updates per state change. There is not yet a solution to consolidate and/or drop an update and not post an update.~~
16. ~~Pogify does not yet comply 100% with Spotify Developer Agreement. We are working as fast as possible to remedy this shortfall.~~
17. Theme enabling dark mode keeps dark mode on refresh even when dark mode toggled off
18. ~~there are no tests.~~ there is one test.
19. sparse code commenting
20. And probably many more I forgot about

## Contributing and Communication

Currently, Pogify is open to contributors but please note that Pogify is stil in its infancy and undergoing rapid development which means we will not be assigning particular tasks to non-maintainers. This also means that we may be liable to reject pull requests that cause **major** conflicts with a mainatiner's local repository. Due to this, please first discuss the change you may wish to make via Github issue or with someone with the Developer role on our [Discord](https://discord.gg/bU6E9Xj) before making a change. With that said, do not be afraid to make a pull request if you have already gotten approval from a maintainer! Pogify is also looking for potential contributors with skills that extend beyond code. If you think you have skills that could be of any benefit to Pogify, please do reach out to us on our [Discord server](https://discord.gg/bU6E9Xj)!

The above paragraph is verbatim from the [Contributing Guidelines](https://github.com/Pogify/pogify/blob/master/CONTRIBUTING.md) which all contributors must read before attempting to contribute!
All Pogify contributors are bound by the [Contributor Covenant Code of Conduct](https://github.com/Pogify/pogify/blob/develop/CONTRIBUTING.md).

## Todo List

- [ ] Make a looping script or something that people can use to develop the listener player without 2 accounts.
- [ ] code comments
- [ ] tests
- [x] debouncer for client events (would fix no. 15 of Known Issues)

## Related Repos

### [Pogify/pogify-functions](https://github.com/Pogify/pogify-functions)

    Repo housing pogify's Google Cloud functions
