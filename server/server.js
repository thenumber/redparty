const express = require("express");
const app = express();
const server = require("http").createServer(app);
const ioUtils = require("./utils/io");

const io = require("socket.io")(server, {
  path: "/socket",
  origins: [
    "https://interconnector-youtube.netlify.app",
    "https://localhost:3000",
    "http://localhost:3000",
  ],
  serveClient: false,
});

const PORT = process.env.PORT || 3005;

app.get("/test", (req, res, next) => {
  res.send({ message: "Hello World" });
});

ioUtils.setupIO(io);

server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
