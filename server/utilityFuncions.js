const WORLD_WIDTH = 7680;
const WORLD_HEIGHT = 4320;
const PLAYER_SPEED = 320;
const MOVE_SMOOTHNESS = 18;
const PLAYER_RADIUS = 18;

const OBSTACLE_DEFINITIONS = {
  granite: {
    textureW: 100,
    textureH: 80,
    sensorCircles: [
      { cx: 38, cy: 36, r: 28 },
      { cx: 41, cy: 52, r: 23 },
      { cx: 62, cy: 40, r: 30 },
    ],
    sensorRects: [],
  },
  sandstone: {
    textureW: 90,
    textureH: 96,
    sensorCircles: [
      { cx: 46, cy: 38, r: 32 },
      { cx: 47, cy: 52, r: 39 },
    ],
    sensorRects: [],
  },
  obsidian: {
    textureW: 120,
    textureH: 66,
    sensorCircles: [
      { cx: 30, cy: 35, r: 24 },
      { cx: 92, cy: 36, r: 23 },
    ],
    sensorRects: [{ cx: 60, cy: 34, w: 55, h: 55 }],
  },
  green: {
    textureW: 112,
    textureH: 100,
    sensorCircles: [
      { cx: 32, cy: 44, r: 24 },
      { cx: 60, cy: 38, r: 28 },
      { cx: 82, cy: 54, r: 24 },
      { cx: 56, cy: 64, r: 30 },
    ],
    sensorRects: [],
  },
  autumn: {
    textureW: 112,
    textureH: 100,
    sensorCircles: [
      { cx: 32, cy: 44, r: 24 },
      { cx: 60, cy: 38, r: 28 },
      { cx: 82, cy: 54, r: 24 },
      { cx: 56, cy: 64, r: 30 },
    ],
    sensorRects: [],
  },
  thorn: {
    textureW: 112,
    textureH: 100,
    sensorCircles: [
      { cx: 32, cy: 44, r: 24 },
      { cx: 60, cy: 38, r: 28 },
      { cx: 82, cy: 54, r: 24 },
      { cx: 56, cy: 64, r: 30 },
    ],
    sensorRects: [],
  },
};

function createSeededRandom(seedValue) {
  let seed = 0;
  const seedText = String(seedValue ?? "0");
  for (let i = 0; i < seedText.length; i++) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  if (seed === 0) seed = 0x6d2b79f5;

  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return ((seed >>> 0) / 4294967296);
  };
}

function randomBetween(rng, min, max) {
  return min + (max - min) * rng();
}

function getObstacleDefinition(obstacleType) {
  return OBSTACLE_DEFINITIONS[obstacleType] || OBSTACLE_DEFINITIONS.granite;
}

function buildObstacleSensors(obstacle) {
  const definition = getObstacleDefinition(obstacle.type);
  const width = definition.textureW;
  const height = definition.textureH;
  const scale = obstacle.scale || 1;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const circles = (definition.sensorCircles || []).map((circle) => ({
    x: obstacle.x + (circle.cx - halfWidth) * scale,
    y: obstacle.y + (circle.cy - halfHeight) * scale,
    r: circle.r * scale,
  }));

  const rects = (definition.sensorRects || []).map((rect) => {
    const centerX = typeof rect.cx === "number" ? rect.cx : rect.x + rect.w * 0.5;
    const centerY = typeof rect.cy === "number" ? rect.cy : rect.y + rect.h * 0.5;

    return {
      x: obstacle.x + (centerX - halfWidth) * scale,
      y: obstacle.y + (centerY - halfHeight) * scale,
      w: rect.w * scale,
      h: rect.h * scale,
    };
  });

  return { circles, rects };
}

function circleIntersectsCircle(circleA, circleB) {
  const dx = circleA.x - circleB.x;
  const dy = circleA.y - circleB.y;
  const radiusSum = circleA.r + circleB.r;
  return dx * dx + dy * dy <= radiusSum * radiusSum;
}

function circleIntersectsRect(circle, rect) {
  const halfWidth = rect.w * 0.5;
  const halfHeight = rect.h * 0.5;
  const closestX = Math.max(rect.x - halfWidth, Math.min(circle.x, rect.x + halfWidth));
  const closestY = Math.max(rect.y - halfHeight, Math.min(circle.y, rect.y + halfHeight));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

function playerIntersectsObstacles(x, y, radius, obstacles) {
  if (!Array.isArray(obstacles)) return false;

  const playerCircle = { x, y, r: radius };

  for (const obstacle of obstacles) {
    if (!obstacle) continue;
    const sensors = buildObstacleSensors(obstacle);

    for (const circle of sensors.circles) {
      if (circleIntersectsCircle(playerCircle, circle)) {
        return true;
      }
    }

    for (const rect of sensors.rects) {
      if (circleIntersectsRect(playerCircle, rect)) {
        return true;
      }
    }
  }

  return false;
}

function movePlayerWithCollisions(player, deltaX, deltaY, obstacles, worldWidth, worldHeight) {
  const nextX = player.x + deltaX;
  if (!playerIntersectsObstacles(nextX, player.y, PLAYER_RADIUS, obstacles)) {
    player.x = Math.max(0, Math.min(worldWidth, nextX));
  }

  const nextY = player.y + deltaY;
  if (!playerIntersectsObstacles(player.x, nextY, PLAYER_RADIUS, obstacles)) {
    player.y = Math.max(0, Math.min(worldHeight, nextY));
  }
}

function findSpawnPosition(rng, obstacles, worldWidth, worldHeight) {
  for (let i = 0; i < 40; i++) {
    const x = randomBetween(rng, 200, worldWidth - 200);
    const y = randomBetween(rng, 200, worldHeight - 200);
    if (!playerIntersectsObstacles(x, y, PLAYER_RADIUS, obstacles)) {
      return { x, y };
    }
  }

  return {
    x: worldWidth * 0.5,
    y: worldHeight * 0.5,
  };
}

function buildWorldObstacles(seed) {
  const rng = createSeededRandom(seed);
  const specs = [
    { obstacle: "rock", type: "granite", count: 14, minScale: 0.8, maxScale: 1.35 },
    { obstacle: "rock", type: "sandstone", count: 12, minScale: 0.7, maxScale: 1.2 },
    { obstacle: "rock", type: "obsidian", count: 10, minScale: 0.9, maxScale: 1.4 },
    { obstacle: "bush", type: "green", count: 16, minScale: 0.75, maxScale: 1.25 },
    { obstacle: "bush", type: "autumn", count: 12, minScale: 0.7, maxScale: 1.15 },
    { obstacle: "bush", type: "thorn", count: 10, minScale: 0.8, maxScale: 1.2 },
  ];

  const obstacles = [];

  specs.forEach((spec) => {
    for (let i = 0; i < spec.count; i++) {
      obstacles.push({
        obstacle: spec.obstacle,
        type: spec.type,
        x: Math.floor(randomBetween(rng, 220, WORLD_WIDTH - 220)),
        y: Math.floor(randomBetween(rng, 220, WORLD_HEIGHT - 220)),
        scale: Number(randomBetween(rng, spec.minScale, spec.maxScale).toFixed(2)),
      });
    }
  });

  return obstacles;
}

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
    if (!game) return null;
    return {
      worldWidth: game.worldWidth,
      worldHeight: game.worldHeight,
      playerSpeed: game.playerSpeed,
      seed: game.seed,
      obstacles: Array.isArray(game.obstacles) ? game.obstacles : [],
      players: Array.from(game.players.values()).map((player) => ({
        userId: player.userId,
        userName: player.userName,
        x: player.x,
        y: player.y,
        hp: player.hp,
        attributes: player.attributes,
      })),
      moveSmoothness: game.moveSmoothness,
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
    socket.on("107", (key, isDown) => {
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
        console.log(
          "lo user " +
            user.userId +
            " | " +
            user.userName +
            " ha inviato un input ma la partita non è iniziata",
        );
        return;
      }
      console.log(
        "lo user " +
          user.userId +
          " | " +
          user.userName +
          " ha inviato l'input " +
          key +
          " con isDown = " +
          isDown,
      );
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
      if (!gamePlayer || !gamePlayer.keyDowns) {
        console.log(
          "il player " +
            user.userId +
            " non è presente nel game della stanza " +
            roomId +
            ", input ignorato",
        );
        return;
      }
      if (isDown) {
        gamePlayer.keyDowns.set(key, true);
      } else {
        gamePlayer.keyDowns.delete(key);
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
    rooms.get(roomId).isPlaying = true;
    const room = rooms.get(roomId);
    const seed = `${roomId}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const obstacles = buildWorldObstacles(seed);
    const spawnRng = createSeededRandom(`${seed}-spawn`);
    room.game = {
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      playerSpeed: PLAYER_SPEED,
      seed,
      obstacles,
      players: new Map(),
      moveSmoothness: MOVE_SMOOTHNESS,
    };
    room.players.forEach((value, key) => {
      if (!value || !value.userId) {
        return;
      }
      const spawn = findSpawnPosition(spawnRng, obstacles, WORLD_WIDTH, WORLD_HEIGHT);
      room.game.players.set(key, {
        userId: value.userId,
        userName: value.userName,
        x: spawn.x,
        y: spawn.y,
        hp: 100,
        keyDowns: new Map(),
        attributes: {
          isHit: false,
          hitCooldown: 0,
          holding: null,
          invulnerable: false,
          dazed: false,
          speedPercentage: 1,
        },
        abilities: [],
      });
    });
    this.io.to(roomId).emit("014", roomId);
    this.io.to(roomId).emit("015", this.toClientGame(room.game));
    room.gameInterval = setInterval(() => {
      const currentRoom = rooms.get(roomId);
      if (!currentRoom || !currentRoom.isPlaying || !currentRoom.game) {
        clearInterval(room.gameInterval);
        room.gameInterval = null;
        return;
      }

      if (
        currentRoom.players.size === 0 ||
        currentRoom.game.players.size === 0
      ) {
        clearInterval(room.gameInterval);
        room.gameInterval = null;
        currentRoom.isPlaying = false;
        currentRoom.game = null;
        return;
      }

      const deltaSeconds = 1 / 60;
      const playersPayload = [];

      currentRoom.game.players.forEach((player) => {
        if (!player) {
          return;
        }

        const speedMultiplier = player.attributes?.speedPercentage ?? 1;
        const moveStep = currentRoom.game.playerSpeed * deltaSeconds * speedMultiplier;
        let dirX = 0;
        let dirY = 0;

        if (player.keyDowns.has("D")) dirX += 1;
        if (player.keyDowns.has("A")) dirX -= 1;
        if (player.keyDowns.has("S")) dirY += 1;
        if (player.keyDowns.has("W")) dirY -= 1;

        if (dirX !== 0 || dirY !== 0) {
          const length = Math.hypot(dirX, dirY);
          const moveX = (dirX / length) * moveStep;
          const moveY = (dirY / length) * moveStep;
          movePlayerWithCollisions(
            player,
            moveX,
            moveY,
            currentRoom.game.obstacles,
            currentRoom.game.worldWidth,
            currentRoom.game.worldHeight,
          );
        }

        player.x = Math.max(0, Math.min(currentRoom.game.worldWidth, player.x));
        player.y = Math.max(
          0,
          Math.min(currentRoom.game.worldHeight, player.y),
        );

        playersPayload.push({
          userId: player.userId,
          userName: player.userName,
          x: player.x,
          y: player.y,
          hp: player.hp,
          attributes: player.attributes,
        });
      });

      this.io.volatile.to(roomId).emit("016", playersPayload);
    }, 1000 / 60);
  },
};
