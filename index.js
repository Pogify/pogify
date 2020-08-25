var path = require("path");
var express = require("express");
var app = express();

app.set("trust proxy", 1);
app.use(express.static("build"));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`App started on port ${process.env.PORT}`);
});
