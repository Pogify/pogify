import React from "react";
import styles from "./modals.module.css";
import * as Sentry from "@sentry/react";
console.log(styles);
export const FeedbackButton = () => {
  return (
    <button
      className={styles.feedbackButton}
      onClick={() => {
        let eventId = Sentry.captureMessage("User Feedback Submitted");
        Sentry.showReportDialog({
          eventId,
          title: "Leave us Feedback!",
          subtitle:
            "Pogify is still a young project and we need all the help we can get",
          subtitle2:
            "Please leave us feedback regarding your experience, any problems you've faced, and/or any improvements you'd like to see!",
          labelComments: "Leave your feedback here",
          labelSubmit: "Submit Feedback",
        });
      }}
    >
      Feedback
    </button>
  );
};
