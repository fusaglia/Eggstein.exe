import express, { response } from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { utility } from "./utilityFuncions.js";
import { fileURLToPath } from "url";
import { callbackify } from "util";
import { isReadable } from "stream";
import e from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, "../client")));
/*
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/", "index.html"));
});*/

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the game at http://localhost:${PORT}`);
  //console.log(`Access the game at http://25.37.171.45:${PORT}`);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// costanti
const users = new Map();
const rooms = new Map();
const minPlayer = 2;
const maxPlayer = 8;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// gestione connessioni
io.on("connection", (socket) => {
  //connesione di un client
  {
    let randomJoke = ["negro", "nigga", "jew", "ebreo", "goym"];
    console.log(
      "Un " +
        randomJoke[Math.floor(Math.random() * randomJoke.length)] +
        " è entrato",
      socket.id,
    );
  }
  socket.emit("001");

  socket.on("101", (userId, userName) => {
    console.log("messaggio 101 ricevuto da socket: " + socket.id);
    if (userId === undefined || userId === null || userId === "") {
      socket.emit("208");
      console.log("messaggio 208 mandato");
      return;
    }
    if (!utility.checkUserName(userName) || userName == userId.substring(0, 10)) {
      socket.emit("202");
      console.log(
        "lo userName " + userName + " dello user " + userId + " non è valido",
      );
      console.log("messaggio 202 mandato");
      return;
    }
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
              isReady: user.isReady ?? false,
              currentRoom: user.currentRoom ?? null,
            });
            utility.completeAuthentication(
              socket,
              userId,
              rooms,
              users,
              minPlayer,
              maxPlayer,
            );
            utility.handleReconnection(userId, socket, rooms, users);
          } else {
            socket.emit("201");
            console.log("messaggio 201 mandato");
          }
        });
        return;
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
            isReady: user.isReady ?? false,
            currentRoom: user.currentRoom ?? null,
          });
          utility.completeAuthentication(
            socket,
            userId,
            rooms,
            users,
            minPlayer,
            maxPlayer,
          );
          utility.handleReconnection(userId, socket, rooms, users);
          return;
        } else {
          //è un user diverso con lo stesso userId
          socket.emit("201");
          console.log("messaggio 201 mandato");
          return;
        }
      }
    } else {
      //se è la prima volta che uno user con questo userId si colleca al server
      users.set(userId, {
        userName: userName,
        userId: userId,
        socket: socket,
        isOnline: true,
        isReady: false,
        currentRoom: null,
      });
      utility.completeAuthentication(
        socket,
        userId,
        rooms,
        users,
        minPlayer,
        maxPlayer,
      );
      utility.handleFirstConnection(userId);
      return;
    }
  });
  socket.on("disconnect", (reason) => {
    //messaggio di disconnessione da parte del client
    if (!users.has(socket.userId)) {
      return;
    }
    const user = users.get(socket.userId);
    const disconnectedSocketId = socket.id;
    console.log(
      "the user " +
        user.userId +
        " | " +
        user.userName +
        " disconnected because of " +
        reason,
    );
    users.get(socket.userId).isOnline = false;
    //emit con timeout allo user, se non risponde, eliminarlo dagli user e da tutte le stanze
    socket.timeout(5000).emit("002", (err) => {
      if (err) {
        const currentUser = users.get(socket.userId);
        if (!currentUser) {
          return;
        }
        if (
          currentUser.isOnline ||
          !currentUser.socket ||
          currentUser.socket.id !== disconnectedSocketId
        ) {
          console.log(
            "lo user " +
              socket.userId +
              " si è riconnesso entro il timeout, nessuna eliminazione",
          );
          return;
        }

        console.log("user non riconnesso entro 5 secondi, eliminazione in corso...");
        users.delete(socket.userId);
      }
    });
  });
});

export function getSocket(userId) {
  if (!users.has(userId)) {
    return null;
  }
  return users.get(userId).socket;
}

// update classi
utility.io = io;
