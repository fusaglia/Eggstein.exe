import express, { response } from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
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
  //console.log(`Access the game at http://25.37.171.45:${PORT}`);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// costanti
const users = new Map();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// gestione connessioni
io.on("connection", (socket) => {
  //connesione di un client
  console.log("Un negro è entrato", socket.id);
  socket.emit("001");

  socket.on("101", (userId, userName) => {
    console.log("messaggio 101 ricevuto da socket: " + socket.id);
    //se uno user con lo stesso userId si è gia collegato in precendeza
    if (users.has(userId)) {
      const user = users.get(userId);
      //se questo user gia collegaco è online
      if (user.isOnline) {
        //ping in attesa di risposta
        user.socket.timeout(3000).emit("002", (err) => {
          //se lo user non risponde
          if (err) {
            console.log(
              "lo user " +
              user.userId +
              " | " +
              user.userName +
              " si è riconnesso",
            );
            users.set(userId, {
              userName: userName,
              userId: userId,
              socket: socket,
              isOnline: true,
            });
            socket.userId = userId;
            utility.handleReconnection(userId);
          }
          else {
            socket.emit("201");
            console.log("messaggio 201 mandato");
          }
        });
      } else {
        //se lo user non è online
        //se il client appena collegato ha sia lo stesso userId che lo stesso userName
        if (user.userName == userName) {
          console.log(
            "lo user " +
            user.userId +
            " | " +
            user.userName +
            " si è riconnesso",
          );
          users.set(userId, {
            userName: userName,
            userId: userId,
            socket: socket,
            isOnline: true,
          });
          socket.userId = userId;
          utility.handleReconnection(userId);
        } else {
          //è un user diverso con lo stesso userId
          socket.emit("201");
          console.log("messaggio 201 mandato");
        }
      }
    } else {
      //se è la prima volta che uno user con questo userId si colleca al server
      users.set(userId, {
        userName: userName,
        userId: userId,
        socket: socket,
        isOnline: true,
      });
      socket.userId = userId;
      utility.handleFirstConnection(userId);
    }
  });
  socket.on("disconnect", (reason) => {
    //messaggio di disconnessione da parte del client
    if (!users.has(socket.userId)) {
      return;
    }
    const user = users.get(socket.userId);
    console.log(
      "the user " +
      user.userId +
      " | " +
      user.userName +
      " disconnected because of " +
      reason,
    );
    users.get(socket.userId).isOnline = false;

  });
});
