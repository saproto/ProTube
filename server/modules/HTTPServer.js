//Server to host our web apps and socket.io sockets on
const express = require("express");
const app = express();
const path = require("path");
const { Server } = require("socket.io");
const { authApi } = require("./api_endpoints/AuthApi");
const { protubeApi } = require("./api_endpoints/ProtubeApi");
const https = require("https");
const fs = require("fs");
const http = require("http");
require("./DataBase");
const { sessionMiddleware } = require("./Middlewares");
const passport = require("passport");
const history = require("connect-history-api-fallback");
require("./AuthService");
const PORT = parseInt(process.env.PORT);

// Used for a SPA to redirect all paths to the index.html file
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  history({
    index: "/index.html",
    rewrites: [
      {
        from: /^\/api\/.*$/,
        to: function (context) {
          return context.parsedUrl.path;
        },
      },
    ],
  })
);
app.use("/", express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/", authApi);
app.use("/api/laravel/", protubeApi);

let server;
if (process.env.HTTPS === "true") {
  const privateKey = fs.readFileSync(process.env.SSL_KEY_FILE, "utf8");
  const certificate = fs.readFileSync(process.env.SSL_CERT_FILE, "utf8");
  const ssl = { key: privateKey, cert: certificate };
  server = https.createServer(ssl, app);
} else {
  server = http.createServer(app);
}
server.listen(PORT); //server.listen instead of app.listen to accommedate for https and socket.io
server.on("error", (err) =>
  logger.serverError(`Failed to start server: ${err}`)
);
server.on("listening", () => logger.serverInfo(`Listening on port ${PORT}`));

//Create a global Socket.io instance for all modules to use
global.io = new Server(server, {
  pingTimeout: 10000,
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
// registering this for all socketio namespaces
io.on("new_namespace", (namespace) => {
  namespace.use(wrap(sessionMiddleware));
  namespace.use(wrap(passport.initialize()));
  namespace.use(wrap(passport.session()));
});

require("./socket_endpoints/ScreenSocket");
require("./socket_endpoints/AdminScreen");
require("./socket_endpoints/AdminRemote");
require("./socket_endpoints/RemoteSocket");
