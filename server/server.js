import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { to } from "mathjs";
import { utility } from "./utilityFuncions.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the game at http://localhost:${PORT}`);
  console.log(`Access the game at http://25.37.171.45:${PORT}`);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// costanti
const users = new Map();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// gestione connessioni
io.on("connection", (socket) => {
  console.log("Un negro è entrato", socket.id);
  socket.emit("001", "ciao negro! mandami il tuo UserID e il tuo nome utente");
  socket.on("101", (userId, userName) => {
    console.log("messaggio 101 ricevuto da socket" + socket.id);
    if (users.has(userId)) {
      const user = users.get(userId);
      console.log(
        "lo user " + user.userId + " | " + user.userName + " si è riconnesso",
      );
      users.set(userId, {
        userName: userName,
        userId: userId,
        socket: socket,
        isOnline: true,
      });
      utility.handleReconnection(userId);
    } else {
      users.set(userId, {
        userName: userName,
        userId: userId,
        socket: socket,
        isOnline: true,
      });
      utility.handleFirstConnection(userId);
    }
  });
});
