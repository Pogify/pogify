const http = require("http");

const max = 500;

let count = 0;
let err = 0;
for (let i = 0; i < max; i++) {
  http
    .get(
      {
        agent: false,
        path: "/sub/my_channel_1",
        hostname: "161.35.120.197",
        timeout: 10000000,
      },
      (res) => {
        res.on("data", (data) => {
          console.log(count++, err, data.toString());
        });
        res.on("error", console.log);
      }
    )
    .on("error", (error) => {
      console.log("errcount", err++);
    });
}
