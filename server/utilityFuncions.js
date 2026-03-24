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
        "lo user " + userId + " si è riconnesso ma non è stato trovato nei users",
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
  },
  userReconnectRoom: function (socket, roomId, rooms, users) {
    console.log("userReconnectRoom chiamato per userId " + socket.userId + " e roomId " + roomId);
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
  },
  userDeletion: function (socket, rooms, users) {
  },
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
    callback("011");
    this.io.to(roomId).emit("012", socket.userId);
  },
};
