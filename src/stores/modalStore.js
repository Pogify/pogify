import { extendObservable, action } from "mobx";
import React from "react";

/**
 * ModalStore manages state for the ModalSystem.
 */
export class ModalStore {
  constructor() {
    extendObservable(this, {
      current: undefined,
      modalQueue: [],
    });
  }

  show = action(() => {
    // gets first item in queue
    const item = this.modalQueue.shift();

    // if an item is shifted then show
    if (item) {
      // assign current modal to current property
      // this.current = this.inject(<div>item.modal</div>);
      this.current = this.inject(item.modal);
      // if modal has timeout set it
      // create method for callback
      this.currentCallback = () => {
        if (item.callback) {
          this.currentCallback = null;
          item.callback();
        }
        this.show();
      };
      // set the timeout for modal
      if (item.timeout) {
        this.currentTimeout = setTimeout(this.currentCallback, item.timeout);
      }
    } else {
      // if no modal, set falsy value
      this.current = undefined;
    }
  });

  /**
   * Queues a modal. Will display modal according to queue order.
   *
   * If no modals are showing queued modal will show.
   *
   * @param {JSX} modal JSXElement
   * @param {number} timeout
   * @param {Function} callback
   */
  queue = action((modal, timeout, callback) => {
    this.modalQueue.push({
      modal,
      timeout,
      callback,
    });
    if (!this.current) {
      this.show();
    }
  });

  /**
   * Closes the currently open modal
   */
  closeModal = action((...args) => {
    // clears the timeout of current modal
    clearTimeout(this.currentTimeout);
    // if a callback exists for modal fires callback
    if (this.currentCallback) {
      this.currentCallback(...args);
    }
    // show the next modal
    this.show();
  });

  /**
   * Inject closeModal method to any modal.
   *
   * @param {JSX} Modal
   */
  inject = (element) => {
    if (element.props.closeModal) {
      console.error("modal has closeModal defined already, will be replaced");
    }

    return React.cloneElement(
      element,
      { closeModal: this.closeModal },
      element.children
    );
  };
}
