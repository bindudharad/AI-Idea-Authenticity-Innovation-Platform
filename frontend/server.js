const http = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));

  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  global.__io = io;

  io.on("connection", (socket) => {
    socket.on("team:join", (teamId) => {
      if (typeof teamId === "string" && teamId) {
        socket.join(`team:${teamId}`);
      }
    });

    socket.on("team:leave", (teamId) => {
      if (typeof teamId === "string" && teamId) {
        socket.leave(`team:${teamId}`);
      }
    });

    socket.on("notification:join", (userId) => {
      if (typeof userId === "string" && userId) {
        socket.join(`user:${userId}`);
      }
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
