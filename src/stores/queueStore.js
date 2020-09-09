import { extendObservable, action } from "mobx";
import { playerStore } from ".";

export class QueueStore {
  constructor() {
    extendObservable(this, {
      queue: [],
      currentIndex: 0,
    });
  }

  addToQueue = action((item, i) => {
    // add to queue
    if (i !== undefined) {
      this.queue.splice(i, 0, item);
    } else {
      this.queue.push(item);
    }
    // if nothing queued then cue video.
    if (playerStore.videoId === null) {
      playerStore.cueQueue();
    }
  });

  addNext = action((item) => {
    this.queue.splice(1, 0, item);
  });

  addMultipleToQueue = action((items) => {
    // add to queue
    this.queue = this.queue.concat(items);
    // if nothing queued then cue video.
    if (playerStore.videoId === null) {
      playerStore.cueQueue();
    }
  });

  previousVideo = () => {
    // decrement index
    this.currentIndex--;

    // return item
    return this.queue[this.currentIndex];
  };
  get currentVideo() {
    return this.queue[this.currentIndex];
  }

  nextVideo = () => {
    // increment index
    this.currentIndex++;
    return this.queue[this.currentIndex];
  };

  reorderItem = action((from, to) => {
    // splice item from the from index
    let item = this.queue.splice(from, 1);
    // put it back in into the to index
    this.queue.splice(to, 0, item);
  });

  clearQueue = action(() => {
    this.queue.clear();
    this.currentIndex = 0;
  });
}
