//import {users} from "./server.js";
export const utility = {
  io: null,
  toClientUser: function (user) {
    if (!user) return null;
    return {
      userId: user.userId,
      userName: user.userName,
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
  handleReconnection: function (userId, socket, rooms, users) {
      //quando uno user si riconnette, se era in una stanza, lo ricollego alla stanza
      if (!users.has(userId))
      {
        console.log("lo user " + userId + " si è riconnesso ma non è stato trovato nei users");
        return;
      }
      const user = users.get(userId);
      if (user.currentRoom) {
        const roomId = user.currentRoom;
        if (!rooms.has(roomId)) {
          console.log("lo user " + userId + " si è riconnesso ma la stanza " + roomId + " non esiste più");
          return;
        }
        const room = rooms.get(roomId);
        if (room.players.has(userId)) {
          console.log(
            "lo user " +
              userId +
              " si è riconnesso ed è stato ricollegato alla stanza " +
              roomId,
          );
          this.userReconnectRoom(socket, roomId, rooms, users);
          return;
        }
      }
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
    const room = rooms.get(roomId);
    if (room.players.size >= room.maxPlayer) {
      console.log("la stanza " + roomId + " è piena");
      return;
    }
    socket.join(roomId);
    rooms.get(roomId).players.set(socket.userId, {
      userId: socket.userId,
      userName: users.get(socket.userId).userName,
    });
    users.get(socket.userId).currentRoom = roomId;
    callback("006");
    socket.emit("007", this.toClientRoom(room));
    this.io.to(roomId).emit("008", this.toClientUser(users.get(socket.userId)));
  },
  userReconnectRoom: function (socket, roomId, rooms, users) {
    socket.join(roomId);
    rooms.get(roomId).players.set(socket.userId, {
      userId: socket.userId,
      userName: users.get(socket.userId).userName,
    });
    const room = rooms.get(roomId);
    socket.emit("007", this.toClientRoom(room));
    this.io.to(roomId).emit("008", this.toClientUser(users.get(socket.userId)));
  },
};
