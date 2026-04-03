import {
  toClientGame,
  startGame,
  playerWantToUseAbility,
} from "./gameFunctions.js";
const validAbilityKeys = new Set(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Q", "E"]);

//import {users} from "./server.js";
export const utility = {
  io: null,
  toClientUser: function (user) {
    if (!user) return null;
    return {
      userId: user.userId,
      userName: user.userName,
      isReady: user.isReady ?? false,
      isOnline: user.isOnline,
      currentRoom: user.currentRoom || null,
    };
  },
  toClientRoom: function (room) {
    if (!room) return null;
    return {
      roomId: room.roomId,
      maxPlayer: room.maxPlayer,
      minPlayer: room.minPlayer,
      mappa: room.mappa,
      password: room.password ? "Yes" : "No",
      players: Array.from(room.players.values()),
    };
  },
  toClientGame: function (game) {
    return toClientGame(game);
  },
  checkUserRoom: function (userId, rooms) {
    let userRoom = null;
    rooms.forEach((room) => {
      if (room.players.has(userId)) {
        userRoom = room;
      }
    });
    return userRoom;
  },
  handleReconnection: function (userId, socket, rooms, users) {
    console.log("handleReconnection chiamato per userId " + userId);
    //quando uno user si riconnette, se era in una stanza, lo ricollego alla stanza
    if (!users.has(userId)) {
      console.log(
        "lo user " +
          userId +
          " si è riconnesso ma non è stato trovato nei users",
      );
      return;
    }

    const user = users.get(userId);
    user.isReady = user.isReady ?? false;

    let room = null;
    if (user.currentRoom && rooms.has(user.currentRoom)) {
      room = rooms.get(user.currentRoom);
    } else {
      room = this.checkUserRoom(userId, rooms);
    }

    if (!room) {
      user.currentRoom = null;
      users.set(userId, user);
      return;
    }

    user.currentRoom = room.roomId;
    users.set(userId, user);

    console.log(
      "lo user " +
        userId +
        " si è riconnesso ed è stato ricollegato alla stanza " +
        room.roomId,
    );
    this.userReconnectRoom(socket, room.roomId, rooms, users);
    return;
  },

  handleFirstConnection: function (userId) {},
  checkUserName: function (userName) {
    let regex = new RegExp("^[a-zA-Z0-9_-]+$");
    if (!userName) {
      console.log("UserName nullo");
    } else if (!regex.test(userName)) {
      console.log("UserName non valido");
    } else if (userName.length < 5) {
      console.log("UserName troppo corto");
    } else if (userName.length > 21) {
      console.log("UserName troppo lungo");
    } else {
      console.log("UserName valido");
      return true;
    }
    return false;
  },
  getRoomList: function (rooms) {
    const roomList = [];
    rooms.forEach((value, key) => {
      roomList.push({
        roomId: value.roomId,
        players: value.players.size,
        maxPlayer: value.maxPlayer,
        password: value.password ? "Yes" : "No",
        mappa: value.mappa,
      });
    });
    return roomList;
  },
  bindAuthenticatedHandlers: function (
    socket,
    rooms,
    users,
    minPlayer,
    maxPlayer,
  ) {
    if (socket.data.handlersBound) {
      return;
    }
    socket.data.handlersBound = true;

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
        admin: socket.userId,
        maxLives: attributes.maxLives || 3,
        players: new Map(),
        maxPlayer: attributes.maxPlayer || maxPlayer,
        minPlayer: minPlayer,
        mappa: attributes.mappa || "mappa1",
        password: attributes.password,
        isPlaying: false,
      };
      console.log("attributi stanza: " + JSON.stringify(tempRoom));
      rooms.set(roomId, tempRoom);
      console.log("stanza " + roomId + " creata");
      callback("004");
      this.io.emit("005", this.getRoomList(rooms));
    });

    socket.on("104", (roomId, password, callback) => {
      console.log("messaggo 104 ricevuto");
      if (!users.has(socket.userId)) {
        console.log(
          "lo user con socketId " +
            socket.id +
            " e userID " +
            socket.userId +
            " non ha un userId valido",
        );
        callback("208");
        return;
      }
      let user = users.get(socket.userId);
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
          this.userEnterRoom(socket, roomId, rooms, users, callback);
          return;
        }
        console.log("la stanza " + roomId + " è piena");
        callback("205");
        return;
      }

      console.log(
        "lo user " +
          user.userId +
          " | " +
          user.userName +
          " è entrato nella stanza " +
          roomId,
      );
      this.userEnterRoom(socket, roomId, rooms, users, callback);
    });

    socket.on("105", (callback) => {
      console.log("messaggo 105 ricevuto");
      if (!users.has(socket.userId)) {
        console.log(
          "lo user con socketId " +
            socket.id +
            " e userID " +
            socket.userId +
            " non è negli users",
        );
        callback("208");
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
      this.io.to(user.currentRoom).emit("010", user.userId, user.isReady);
      rooms.get(user.currentRoom).players.set(user.userId, {
        userId: user.userId,
        userName: user.userName,
        isReady: user.isReady,
      });
      //controllo se tutti i player della stanza sono ready, se si, inizia il timer per l'inizio della partita (per ora 5 secondi), se durante il timer qualcuno toglie il ready, annullo il timer
      const room = rooms.get(user.currentRoom);
      let allReady = true;
      room.players.forEach((value, key) => {
        if (!value.isReady) {
          allReady = false;
        }
      });
      if (!allReady) return;
      this.startRoomReadyTimer(user.currentRoom, rooms, users);
    });

    socket.on("106", (callback) => {
      console.log("messaggo 106 ricevuto");
      if (!users.has(socket.userId)) {
        console.log(
          "lo user con socketId " +
            socket.id +
            " e userID " +
            socket.userId +
            " non è negli users",
        );
        callback("208");
        return;
      }
      const user = users.get(socket.userId);
      const roomId = user.currentRoom || this.checkUserRoom(socket, rooms);
      if (!roomId) {
        console.log(
          "lo user " +
            user.userId +
            " | " +
            user.userName +
            " non è in una stanza",
        );
        callback("207");
        return;
      }
      this.userLeaveRoom(socket, user, roomId, rooms, users, callback);
    });
    socket.on("107", (payload) => {
      console.log("messaggo 107 ricevuto");
      if (!users.has(socket.userId)) {
        console.log(
          "lo user con socketId " +
            socket.id +
            " e userID " +
            socket.userId +
            " non è negli users",
        );
        return;
      }
      const user = users.get(socket.userId);
      const roomId = user.currentRoom || this.checkUserRoom(socket, rooms);
      if (!roomId) {
        console.log(
          "lo user " +
            user.userId +
            " | " +
            user.userName +
            " non è in una stanza",
        );
        return;
      }
      if (!rooms.get(roomId).isPlaying) {
        console.log("input movimento ignorato: la partita non è iniziata");
        return;
      }

      const room = rooms.get(roomId);
      if (!room.game) {
        console.log(
          "la stanza " +
            roomId +
            " non ha un oggetto game, impossibile processare l'input",
        );
        return;
      }

      const gamePlayer = room.game.players.get(user.userId);
      if (!gamePlayer) {
        console.log(
          "il player " +
            user.userId +
            " non è presente nel game della stanza " +
            roomId +
            ", aggiornamento ignorato",
        );
        return;
      }

      if (!payload || typeof payload !== "object") {
        return;
      }

      const { x, y, direction } = payload;
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }

      const clampedX = Math.max(0, Math.min(room.game.worldWidth, x));
      const clampedY = Math.max(0, Math.min(room.game.worldHeight, y));
      gamePlayer.x = clampedX;
      gamePlayer.y = clampedY;

      if (typeof direction === "number" && Number.isFinite(direction)) {
        gamePlayer.direction = direction;
      }
    });

    socket.on("109", (key) => {
      
      if (!users.has(socket.userId)) {
        return;
      }
      const user = users.get(socket.userId);
      console.log("messaggo 109 ricevuto da user " + user.userId + " | " + user.userName + " con key: " + key);
      const roomId = user.currentRoom || this.checkUserRoom(socket, rooms);
      if (!roomId) {
        return;
      }
      const room = rooms.get(roomId);
      if (!room || !room.isPlaying || !room.game) {
        return;
      }
      const gamePlayer = room.game.players.get(user.userId);
      if (!gamePlayer || !gamePlayer.keyDowns) {
        return;
      }
      playerWantToUseAbility(user.userId, key, rooms, this.io);
      //
    });
    socket.on("108", (direction) => {
      console.log("messaggo 108 ricevuto");
      if (!users.has(socket.userId)) {
        return;
      }
      const user = users.get(socket.userId);
      const roomId = user.currentRoom || this.checkUserRoom(socket, rooms);
      if (!roomId) {
        return;
      }
      const room = rooms.get(roomId);
      if (!room || !room.isPlaying || !room.game) {
        return;
      }
      const gamePlayer = room.game.players.get(user.userId);
      if (!gamePlayer) {
        return;
      }
      if (typeof direction === "number" && Number.isFinite(direction)) {
        gamePlayer.direction = direction;
      }
    });
  },
  completeAuthentication: function (
    socket,
    userId,
    rooms,
    users,
    minPlayer,
    maxPlayer,
  ) {
    socket.userId = userId;
    socket.emit("005", this.getRoomList(rooms));
    this.bindAuthenticatedHandlers(socket, rooms, users, minPlayer, maxPlayer);
  },
  userEnterRoom: function (socket, roomId, rooms, users, callback) {
    if (!socket.userId) {
      console.log(
        "Uno user con socketId " +
          socket.id +
          " ha cercato di entrare nella stanza " +
          roomId +
          " senza avere un userId",
      );
      return;
    }
    if (!users.has(socket.userId)) {
      console.log(
        "Uno user con socketId " +
          socket.id +
          " ha cercato di entrare nella stanza " +
          roomId +
          " senza avere un user associato",
      );
      return;
    }

    if (!rooms.has(roomId)) {
      console.log("la stanza " + roomId + " non esiste");
      return;
    }
    let room = rooms.get(roomId);
    if (room.players.size >= room.maxPlayer) {
      console.log("la stanza " + roomId + " è piena");
      return;
    }
    socket.join(roomId);
    const user = users.get(socket.userId);
    user.currentRoom = roomId;
    rooms.get(roomId).players.set(socket.userId, {
      userId: socket.userId,
      userName: user.userName,
      isReady: user.isReady ?? false,
    });
    users.set(socket.userId, user);
    callback("006");
    socket.emit("007", this.toClientRoom(room));

    this.io.to(roomId).emit("008", this.toClientUser(users.get(socket.userId)));
    room = rooms.get(user.currentRoom);
    let allReady = true;
    room.players.forEach((value, key) => {
      if (!value.isReady) {
        allReady = false;
      }
    });
    if (!allReady) return;
    this.startRoomReadyTimer(user.currentRoom, rooms, users);
  },
  userReconnectRoom: function (socket, roomId, rooms, users) {
    console.log(
      "userReconnectRoom chiamato per userId " +
        socket.userId +
        " e roomId " +
        roomId,
    );
    socket.join(roomId);
    rooms.get(roomId).players.set(socket.userId, {
      userId: socket.userId,
      userName: users.get(socket.userId).userName,
      isReady: users.get(socket.userId).isReady ?? false,
    });
    const room = rooms.get(roomId);
    socket.emit("007", this.toClientRoom(room));
    socket.emit("009", room.players.get(socket.userId).isReady);
    this.io.to(roomId).emit("008", this.toClientUser(users.get(socket.userId)));
    if (room.isPlaying) {
      socket.emit("015", this.toClientGame(room.game));
      socket.emit("014", roomId);
      return;
    }
  },
  userDeletion: function (socket, rooms, users) {},
  userLeaveRoom: function (socket, user, roomId, rooms, users, callback) {
    if (!users.has(socket.userId)) {
      console.log(
        "Uno user con socketId " +
          socket.id +
          " ha cercato di lasciare una stanza senza avere un user associato",
      );
      return;
    }
    socket.leave(roomId);
    rooms.get(roomId).players.delete(socket.userId);
    user.currentRoom = null;
    users.set(socket.userId, user);
    const room = rooms.get(roomId);
    if (room && room.game && room.game.players) {
      room.game.players.delete(socket.userId);
    }
    callback("011");
    this.io.to(roomId).emit("012", socket.userId);
    if (room && room.gameInterval && room.players.size === 0) {
      clearInterval(room.gameInterval);
      room.gameInterval = null;
      room.isPlaying = false;
      room.game = null;
    }
  },
  startRoomReadyTimer: async function (roomId, rooms) {
    const userNumber = rooms.get(roomId).players.size;
    console.log(
      "startRoomReadyTimer chiamato per la stanza " +
        roomId +
        ", tra 5 secondi inizia la partita se tutti i player sono ancora ready",
    );
    for (let i = 5; i >= 0; i--) {
      await this.io
        .timeout(1000)
        .to(roomId)
        .emit("013", i, (err, response) => {
          if (err) {
            console.log(
              "startRoomReadyTimer annullato per la stanza " +
                roomId +
                " perché un player ha tolto il ready",
            );
            this.io.to(roomId).emit("209");
            return;
          }
          if (!response) {
            console.log(
              "startRoomReadyTimer annullato per la stanza " +
                roomId +
                " perché un player ha tolto il ready",
            );
            this.io.to(roomId).emit("209");
            return;
          }
        });
      const room = rooms.get(roomId);
      let allReady = true;
      room.players.forEach((value, key) => {
        if (!value.isReady) {
          allReady = false;
        }
      });
      if (!allReady || room.players.size !== userNumber) {
        this.io.to(roomId).emit("209");
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    //qui inizia la partita
    this.startGame(roomId, rooms);
  },
  startGame: function (roomId, rooms) {
    startGame(this.io, roomId, rooms);
  },
};
