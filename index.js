var express = require("express");
var app = express();
var cookie = require("cookie");
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  perMessageDeflate: false,
});
var path = require("path");
var HostStore = require("./HostStore");
var session = require("express-session");
var bodyParser = require("body-parser");
var customAlphabet = require("nanoid").customAlphabet;

app.set("trust proxy", 1);
app.use(express.static("build"));
const sessionMiddleware = session({
  secret: "keyboardcat",
  cookie: { maxAge: 35 * 60 * 1000 },
  resave: true,
  saveUninitialized: false,
  rolling: true,
});

app.use(sessionMiddleware);

// normal stuff
const nanoid = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  10
);
app.post("/create", (req, res) => {
  if (req.session.hostOf) {
    req.session.hostOf.push(nanoid());
  } else {
    req.session.hostOf = [nanoid()];
  }
  req.session.save();
  res.status(200).send(req.session.hostOf[req.session.hostOf.length - 1]);
});

app.get("/getSessions", (req, res) => {
  res.send(req.session.hostOf);
});

app.get("/refresh", (req, res) => {
  req.session.touch();
  res.sendStatus(200);
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

// websockets
const namespaces = io.of(/^\/\w+$/);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// current track obj
// TODO: this will memory leak
const current = {};
namespaces.on("connection", (socket) => {
  const namespace = socket.nsp;
  let isHost = false;
  if (socket.request.session.hostOf) {
    isHost = socket.request.session.hostOf.includes(
      socket.nsp.name.replace("/", "")
    );
    socket.emit("IS_HOST", isHost);
    socket.request.session.touch();
  } else {
    socket.emit("IS_HOST", isHost);
  }
  socket.on("IS_HOST", () => {
    socket.emit("IS_HOST", isHost);
  });
  namespace.emit("CONNECTION_COUNT", Object.keys(namespace.connected).length);
  if (isHost) {
    const name = namespace.name;
    socket.on("HOST_CONNECTED", (uri, position, playing) => {
      namespace.emit("HOST_CONNECTED", uri, position, playing);
      console.log("Host connected on ", name);
      current[name] = {
        uri,
        position,
        when: Date.now(),
        playing,
      };
    });

    socket.on("UPDATE", (uri, position, playing) => {
      current[name] = {
        uri,
        position,
        playing,
        when: Date.now(),
      };
      console.log("update on ", name, current[name]);
      namespace.emit("UPDATE", uri, position, playing);
    });

    socket.on("END", () => {
      delete current[name];
      console.log("END on ", name);
      socket.emit("END");
    });
    socket.on("disconnect", () => {
      console.log("host disconnect on ", name);
      namespace.emit("HOST_DISCONNECT");
      delete current[name];
    });
  } else {
    socket.on("INITIAL", () => {
      socket.emit("INITIAL", current[namespace.name]);
    });
    socket.on("disconnect", () => {
      console.log("disconnect ", socket.id);
      namespace.emit(
        "CONNECTION_COUNT",
        Object.keys(namespace.connected).length
      );
    });
  }
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

http.listen(process.env.PORT || 5500, () => {
  console.log("listening on *:" + process.env.PORT || 5500);
});
