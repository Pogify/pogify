import React from "react";
import { extendObservable, action, runInAction, autorun, computed } from "mobx";
import promiseRetry from "promise-retry";
import debounce from "lodash/debounce";
import difference from "lodash/difference";
import Axios from "axios";
import crypto from "crypto";
import * as Sentry from "@sentry/react";

import { modalStore } from ".";
import WarningModal from "../modals/WarningModal";
import ErrorModal from "../modals/ErrorModal";
import { fromPromise, now } from "mobx-utils";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin + "/auth";

/**
 * PlayerStore manages state and logic for spotify playback sdk.
 */
export class PlayerStore {
  constructor(messenger) {
    this.messenger = messenger;
    extendObservable(this, {
      player: null,
      youTubeReady: false,
      videoId: "iDjQSdN_ig8",
      playing: false,
      unstarted: false,
      ended: false,
      buffering: true,
      cued: false,
      p0: 0,
      t0: Date.now(),
      t1: Date.now(),
      duration: 0,
      seeking: false,
      volume: window.localStorage.getItem("pogify:volume"),
    });

    setInterval(
      action(() => {
        this.t1 = Date.now();
      }),
      200
    );
  }

  position = computed(() => {
    if (this.playing) {
      return this.p0 + this.t1 / 1000 - this.t0;
    } else {
      return this.p0;
    }
  });

  onYoutubeReady = action(({ target }) => {
    console.log("a");
    this.youTubeReady = true;
    target.setVolume(this.volume * 100);

    runInAction(() => {
      this.handleEvents({
        target,
        data: target.getPlayerState(),
        initialVol: this.volume,
      });
    });
  });

  handleEvents = action(({ target, data, initialVol }) => {
    this.player = target;

    this.playing = data === 1;
    this.unstarted = data === -1;
    this.ended = data === 0;
    this.buffering = data === 3;
    this.videoCued = data === 5;
    this.duration = target.getDuration();

    let videoUrl = target.getVideoUrl();

    if (videoUrl) {
      let url = new URL(videoUrl);
      this.videoId = url.searchParams.get("v");
    }

    this.p0 = target.getCurrentTime();
    this.t0 = Date.now() / 1000;

    this.volume = initialVol || target.getVolume() / 100;
    window.player = target;
  });

  togglePlay = () => {
    console.log(this.player);
    if (this.player && this.playing) {
      this.player.pauseVideo();
    } else if (this.player) {
      this.player.playVideo();
    }
  };

  resume = () => {
    this.player.playVideo();
  };

  pause = () => {
    this.player.pauseVideo();
  };

  seek = (pos) => {
    if (this.player) {
      this.p0 = pos;
      this.player.seekTo(pos);
    }
  };

  debouncedSetVolume = debounce((vol) => {
    window.localStorage.setItem("pogify:volume", vol);
  }, 1000);

  setVolume = (vol) => {
    if (this.player) {
      this.volume = vol;
      this.player.setVolume(vol * 100);
      this.debouncedSetVolume(vol);
    }
  };

  newTrack = (videoId, pos, play) => {
    console.log(videoId, pos, play);
    if (this.player) {
      if (play) {
        this.player.loadVideoById(videoId, pos);
      } else {
        this.player.cueVideoById(videoId, pos);
      }
    }
  };
}
