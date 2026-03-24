import express, { response } from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { utility } from "./utilityFuncions.js";
import { fileURLToPath } from "url";
import { callbackify } from "util";
import { isReadable } from "stream";

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
    if (!utility.checkUserName(userName)) {
      socket.emit("201");
      console.log(
        "lo userName " + userName + " dello user " + userId + " non è valido",
      );
      console.log("messaggio 201 mandato");
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
            socket.userId = userId;
            utility.handleReconnection(userId, socket, rooms, users);
          } else {
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
            isReady: user.isReady ?? false,
            currentRoom: user.currentRoom ?? null,
          });
          socket.userId = userId;
          utility.handleReconnection(userId, socket, rooms, users);
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
        isReady: false,
        currentRoom: null,
      });
      socket.userId = userId;
      utility.handleFirstConnection(userId);
    }
    socket.emit("005", utility.getRoomList(rooms));
    socket.on("102", (userName) => {
      console.log("messaggo 102 ricevuto");
      if (users.has(socket.userId)) {
        users.get(socket.userId).userName = userName;
      }
      socket.emit("003");
      console.log("messaggo 003 mandato");
    });
    socket.on("103", (roomId, attributes, callback) => {
      console.log("messaggo 103 ricevuto");
      if (rooms.has(roomId)) {
        console.log("la stanza " + roomId + " esiste già");
        callback("203");
        return;
      }
      console.log("creazione stanza " + roomId);
      const tempRoom = {
        roomId: roomId,
        players: new Map(),
        maxPlayer: attributes.maxPlayer || maxPlayer,
        minPlayer: minPlayer,
        mappa: attributes.mappa || "mappa1",
        password: attributes.password,
      };
      console.log("attributi stanza: " + JSON.stringify(tempRoom));
      rooms.set(roomId, tempRoom);
      console.log("stanza " + roomId + " creata");
      callback("004");
      io.emit("005", utility.getRoomList(rooms));
    });
    socket.on("104", (roomId, password, callback) => {
      console.log("messaggo 104 ricevuto");
      if (!users.has(socket.userId)) {
        return;
      }
      const user = users.get(socket.userId);
      console.log(
        "lo user " +
          user.userId +
          " | " +
          user.userName +
          " vuole entrare nella stanza " +
          roomId,
      );
      if (!rooms.has(roomId)) {
        console.log("la stanza " + roomId + " non esiste");
        callback("204");
        return;
      }
      if (rooms.get(roomId).password) {
        console.log("la stanza " + roomId + " è protetta da password");
        if (rooms.get(roomId).password !== password) {
          console.log("password sbagliata per la stanza " + roomId);
          callback("206");
          return;
        }
      }
      if (rooms.get(roomId).players.size >= rooms.get(roomId).maxPlayer) {
        //controlla se nella stanza ci sono dei dublicati di userId, se si, rimuovili e permetti al nuovo user di entrare, altrimenti rifiuta l'ingresso
        const room = rooms.get(roomId);
        let duplicateFound = false;
        room.players.forEach((value, key) => {
          const tempMap = new Map();
          if (tempMap.has(value.userId)) {
            duplicateFound = true;
            room.players.delete(key);
          }
          tempMap.set(value.userId, true);
        });
        if (duplicateFound) {
          console.log(
            "la stanza " +
              roomId +
              " era piena ma è stato trovato un duplicato, quindi è stato rimosso e il nuovo user è entrato",
          );
          utility.userEnterRoom(socket, roomId, rooms, users, callback);
          return;
        }
        console.log("la stanza " + roomId + " è piena");
        callback("205");
        return;
      } else {
        console.log(
          "lo user " +
            user.userId +
            " | " +
            user.userName +
            " è entrato nella stanza " +
            roomId,
        );
        utility.userEnterRoom(socket, roomId, rooms, users, callback);
      }
    });
    socket.on("105", (callback) => {
      console.log("messaggo 105 ricevuto");
      if (!users.has(socket.userId)) {
        return;
      }
      const user = users.get(socket.userId);
      if (user.isReady === true) {
        console.log(
          "lo user " +
            user.userId +
            " | " +
            user.userName +
            " della stanza " +
            user.currentRoom +
            "ha tolto il ready",
        );
        user.isReady = false;
      } else if (user.isReady === false) {
        console.log(
          "lo user " +
            user.userId +
            " | " +
            user.userName +
            " della stanza " +
            user.currentRoom +
            " è ready",
        );
        user.isReady = true;
      } else {
        console.log(
          "lo user " +
            user.userId +
            " | " +
            user.userName +
            " della stanza " +
            user.currentRoom +
            " ha un valore di ready non valido: " +
            user.isReady,
        );
        user.isReady = false;
      }
      callback("009", user.isReady);
      io.to(user.currentRoom).emit("010", user.userId, user.isReady);
    });
    socket.on("106", (callback) => {
      console.log("messaggo 106 ricevuto");
      if (!users.has(socket.userId)) {
        return;
      }
      const user = users.get(socket.userId);
      const roomId = user.currentRoom || utility.checkUserRoom(socket, rooms);
      if (!roomId) {
        console.log("lo user " + user.userId + " | " + user.userName + " non è in una stanza");
        callback("207");
        return;
      }
      utility.userLeaveRoom(socket, user, roomId, rooms, callback);
    });
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
    //emit con timeout allo user, se non risponde, eliminarlo dagli user e da tutte le stanze
    socket.timeout(5000).emit("002", (err) => {
      if (err) {
        console.log("user non riconnesso entro 5 secondi, eliminazione in corso...");

        users.delete(socket.userId);
      }
    });
  });
});

// update classi
utility.io = io;
