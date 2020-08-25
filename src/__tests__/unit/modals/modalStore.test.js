import { ModalStore } from "../../../stores";
import React from "react";

let modalStore;
beforeEach(() => {
  modalStore = new ModalStore();
});

test("test observable properties exists", () => {
  expect(modalStore).toHaveProperty("current", undefined);
  expect(modalStore).toHaveProperty("modalQueue", []);
});

test("test methods exists", () => {
  expect(modalStore).toHaveProperty("show", expect.any(Function));
  expect(modalStore).toHaveProperty("queue", expect.any(Function));
  expect(modalStore).toHaveProperty("closeModal", expect.any(Function));
  expect(modalStore).toHaveProperty("inject", expect.any(Function));
});

describe("test closeModal method", () => {
  let TestDiv = (props) => {
    return <div />;
  };

  test("test with callback", (done) => {
    modalStore.queue(<TestDiv />, 0, () => {
      setImmediate(() => {
        expect(modalStore.current).toBeFalsy();
        done();
      });
    });
    expect(modalStore.current).toBeTruthy();
    modalStore.closeModal();
  });
  test("test without callback", () => {
    modalStore.queue(<TestDiv />, 0);
    modalStore.closeModal();
    expect(modalStore.current).toBeUndefined();
  });
});
describe("test inject method", () => {
  test("test inject adds closeModal property", () => {
    let injectedDiv = modalStore.inject(<div />);

    expect(injectedDiv).toHaveProperty(
      "props.closeModal",
      expect.any(Function)
    );
  });

  test("test inject adds throws error then replaces closeModal", () => {
    let spyInject = jest.spyOn(modalStore, "inject");
    let spyError = jest.spyOn(console, "error");

    const TestDiv = (props) => {
      return <div />;
    };
    let testDiv = <TestDiv closeModal={3} />;
    let injectedDiv = modalStore.inject(testDiv);
    expect(testDiv).toHaveProperty("props.closeModal", expect.any(Number));
    expect(injectedDiv).toHaveProperty(
      "props.closeModal",
      expect.any(Function)
    );
    expect(spyInject).toHaveBeenCalled();
    expect(spyError).toHaveBeenCalled();
  });
});
