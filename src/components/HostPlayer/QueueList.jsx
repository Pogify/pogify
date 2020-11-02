import React from "react";
import { queueStore } from "../../stores";
import ClearQueue from "./components/ClearQueue";

export const QueueList = () => {
  return (
    <>
      <ClearQueue />

      <pre style={{ textAlign: "left" }}>
        {JSON.stringify(
          queueStore.queue.map((e, i) => {
            return queueStore.currentIndex === i
              ? "-> " + e.snippet.title
              : e.snippet.title;
          }),
          undefined,
          2
        )}
      </pre>
    </>
  );
};
