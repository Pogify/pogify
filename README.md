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

This project is still in alpha and as such there are still lots of bugs.

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
13. Navigating away from player screen shows an alert.
14. Pogify will unexpectedly automatically redirect to the Spotify login page if it fails to refresh the login session.
15. State updates by the Spotify Web Player SDK makes two plus updates per state change. There is not yet a solution to consolidate and/or drop an update and not post an update.
16. ~~Pogify does not yet comply 100% with Spotify Developer Agreement. We are working as fast as possible to remedy this shortfall.~~
17. there are no tests.
18. sparse code commenting
19. And probably many more I forgot about

## Contributing and Communication

- Make a pull request on the `develop` branch. [Guidelines](#Pull-Request-Guidelines)
- Open an issue
- Message an admin
- Join us on Discord: https://discord.gg/bU6E9Xj
- [donate](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=PMHPX79UJJVTA&item_name=Pogify&currency_code=USD&source=url) to keep our dev servers running

### Set up for local development

#### If you have difficulty setting up the environment, do _not_ open an issue. Message one of the admins or ask for help on the [discord server](https://discord.gg/bU6E9Xj).

0. We use yarn for _this_ repo (`pogify-functions` uses npm); install yarn with

   `npm i -g yarn`

1. Clone this repo
2. Clone [Pogify/pogify-functions](https://github.com/Pogify/pogify-functions)
3. Get a [spotify api client id](https://developer.spotify.com/dashboard/applications)
4. make sure you configure the auth redirect correctly. The redirect for the app is `http://localhost:{PORT}/auth` where port is the port of the create-react-app dev server (default: 3000).
5. cd into the `pogify-functions` repo
6. Install [firebase-cli](https://firebase.google.com/docs/cli)
7. `firebase init` and follow the instructions.

   - Project only requires emulators for functions and database
   - Select `Don't set up a default project` when prompted with project setup options.
   - Designate `TypeScript` as the language for cloud functions.
   - DO _NOT_ overwrite any existing files.
   - _DO_ install dependencies.

8) cd into `pogify-functions/functions` folder and run `npm run build`
9) In the same folder, declare env vars in `.runtimeconfig.json`

   ```json
   {
     "jwt": {
       "secret": "anysecretyoudlike"
     }
   }
   ```

10) `firebase --project=any-name emulators:start` and note the host, port and region of the emulated functions (eg. "localhost:5001/any-name/us-central1").
    ![Emulator Endoint example](./img/emulator-endpoint-example.png)

11) cd into the `pogify` repo and install dependencies with `yarn install`

12) Declare the following env var in .env or .env.development.local, where host, port, and region are the host, port, and region of the functions emulator endpoint, 'any-name' is consistent with the project name you used in step 9, and spotify_client_id is consistent with the one obtained in step 3.

```
  REACT_APP_CLOUD_FUNCTION_BASE_URL=http://{host}:{port}/any-name/{region}
  REACT_APP_SUB=https://messages.pogify.net
  REACT_APP_SPOTIFY_CLIENT_ID=the-client-id-you-got-in-step-3
```

- messages.pogify.net is the current production endpoint for subscribing to events. It's ok to use this endpoint for dev.

11. Make sure `pogify-functions` firebase emulators are running and `yarn start` to start the react dev servers.

If everything is done right you should have a functioning dev environment.

##### A couple notes:

- Hosting a session from localhost will not push any events to production.
- If you click `join a session`, you will be stuck on the 'waiting for host' modal unless theres an active session.
- Missing any one step will throw an error. make sure not to make a mistake

## Todo List

- [ ] Make a looping script or something that people can use to develop the listener player without 2 accounts.
- [ ] code comments
- [ ] tests
- [ ] debouncer for client events (would fix no. 15 of Known Issues)

## Pull Request Guidelines

1. Only pull requests to the development branch will be honored.
2. Explain what you did and how.
3. If its a new feature, explain what it is.
4. Add a screen shot if applicable.
5. As it stands, pull requests that modify core components will not be honored. (unless otherwise discussed with maintainers).

## Related Repos

### [Pogify/pogify-functions](https://github.com/Pogify/pogify-functions)

    Repo housing pogify's Google Cloud functions
