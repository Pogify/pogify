import { extendObservable, action, runInAction, computed } from "mobx";
import debounce from "lodash/debounce";

import { queueStore } from ".";

/**
 * PlayerStore manages state and logic for spotify playback sdk.
 */
export class PlayerStore {
  constructor(messenger) {
    this.messenger = messenger;
    extendObservable(this, {
      player: null,
      youTubeReady: false,
      videoId: null,
      playing: false,
      unstarted: false,
      ended: false,
      buffering: true,
      cued: false,
      error: null,
      p0: 0,
      t0: Date.now(),
      t1: Date.now(),
      duration: 0,
      seeking: false,
      volume: window.localStorage.getItem("pogify:volume") || 0.2,
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
    console.log("yt ready");
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
    console.log(data);
    this.error = null;
    this.player = target;

    this.playing = data === 1;
    this.unstarted = data === -1;
    this.ended = data === 0;
    this.buffering = data === 3;
    this.videoCued = data === 5;
    this.duration = target.getDuration() || 0;

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

  handleErrors = action(({ target, data }) => {
    this.playing = false;
    this.unstarted = false;
    this.buffering = false;
    this.videoCued = false;
    this.duration = target.getDuration();
    this.error = data;

    switch (data) {
      case 2:
        console.error("yt error: 2");
        break;
      case 5:
        console.error("yt error: 5");
        break;
      case 100:
        console.error("yt error: 100");
        break;
      case 101:
        console.error("yt error: 101");
        break;
      case 150:
        console.error("yt error: 105");
        break;
      default:
        console.error(new Error("unknown yt iframe error"));
    }
  });

  togglePlay = () => {
    console.log(this.player);
    if (this.player && this.playing) {
      this.pause();
    } else if (this.player) {
      this.resume();
    }
  };

  resume = () => {
    console.log(this.videoId);
    if (this.videoId === null) {
      if (queueStore.currentVideo) {
        this.newVideo(queueStore.currentVideo.id, 0, true);
      }
    } else {
      this.player.playVideo();
    }
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

  newVideo = (videoId, pos, play) => {
    console.log(videoId, pos, play);

    if (this.player) {
      if (play || this.videoId === null) {
        this.player.loadVideoById(videoId, pos);
      } else {
        this.player.cueVideoById(videoId, pos);
      }
    }
  };

  next = () => {
    this.newVideo(queueStore.nextVideo().id, undefined, true);
  };

  previous = () => {
    this.newVideo(queueStore.previousVideo().id, undefined, true);
  };

  cueQueue = () => {
    this.videoId = null;
    console.log(queueStore.currentVideo.id);
    this.newVideo(queueStore.currentVideo.id, 0, false);
  };
}
