import BootScene from "./scenes/BootScene.js";
import { socketFuncions } from "./WebSocketClient.js";
import { utility } from "./utilityFunctions.js";
import { visual } from "./htmlCallFunctions.js";
import { gameState } from "./gameState.js";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Generazione ID utente persistente
let userId = localStorage.getItem("userId");
let userName = localStorage.getItem("userName");
generateUser();
console.log("UserID locale:", userId);
console.log("UserName locale:", userName);

// Connessione al server
const socket = socketFuncions.startConnection(); // (questa avviene in WebSocketClient.js dopo che l'utente ha scelto il nome)

// Gioco
const stanza = {};

// Schermate

// serve qualcosa che non permetta di far eseguire questa funzione da console client (F12)
// da vedere come spostare sta roba lato server
// Cambio schermate

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//game utils

const imageCache = new Map();
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  scene: [BootScene],
};

let game = null;
// resize

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DEBUG
const cancUserNameBtn = document.getElementById("cancUserNameBtn");
const cancUserIdBtn = document.getElementById("cancUserIdBtn");
const debugHeader = document.getElementById("debugHeader");

cancUserIdBtn.addEventListener("click", (event) => {
  userId = "";
  localStorage.removeItem("userId");
  //localStorage.removeItem("userName");
});

cancUserNameBtn.addEventListener("click", (event) => {
  userName = "";
  localStorage.removeItem("userName");
});

//quando si clicca F12 mostra i bottoni per cancellare userId e userName
window.addEventListener("keydown", (event) => {
  if (event.key === "F12") {
    debugHeader.classList.toggle("hidden");
  }
});

function generateUser() {
  utility.generateUser();
  if (userId && userName == "user" + userId.substring(0, 10)) {
    visual.showScreen(visual.screens.userNameChoosingScreen);
  } else {
    visual.showScreen(visual.screens.lobbyScreen);
  }
  // Ricarica i valori dopo generateUser() li ha impostati
  userId = localStorage.getItem("userId");
  userName = localStorage.getItem("userName");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//funzioni main

export const mainObjects = {
  reloadUserNameAndId: function () {
    userId = localStorage.getItem("userId");
    userName = localStorage.getItem("userName");
  },
  reloadRoom: function (room) {
    stanza.roomId = room.roomId;
    stanza.maxPlayer = room.maxPlayer;
    stanza.minPlayer = room.minPlayer;
    stanza.mappa = room.mappa;
    stanza.password = room.password;
    stanza.users = room.players;
    visual.reloadRoom(room);
    console.log("stanza aggiornata:", stanza);
  },
  addUserToRoom: function (user) {
    if (!user) return;
    //se lo user è già nella stanza, non aggiungerlo di nuovo
    if (
      stanza.users &&
      stanza.users.find((u) => u.userId === user.userId)
    ) {
      console.log("lo user " + user.userId + " è già nella stanza");
      visual.updatePlayersStatus();
      return;
    }
    if (!stanza.users) {
      stanza.users = [];
      stanza.users.push(user);
    } else {
      stanza.users.push(user);
    }
    visual.updatePlayersStatus();
  },
  removeUserFromRoom: function (userId) {
    if (!stanza.users) return;
    stanza.users = stanza.users.filter((u) => u.userId !== userId);
    visual.updatePlayersStatus();
  },
  setUserIsReady: function (userId, isReady) {
    if (!stanza.users) return;
    if (!userId) return;
    const user = stanza.users.find((u) => u.userId === userId);
    if (user) {
      user.isReady = isReady;
      visual.updatePlayersStatus(userId, isReady);
    }
  },
  getPlayers: function () {
    return stanza.users || [];
  },
  leaveRoom: function () {
    stanza.roomId = null;
    stanza.maxPlayer = null;
    stanza.minPlayer = null;
    stanza.mappa = null;
    stanza.password = null;
    stanza.users = null;
    stanza.game = null;
    gameState.currentGame = null;
  },
  startGame: function () {
    if (game) game.destroy(true);
    game = new Phaser.Game(config);
    window.addEventListener("resize", () =>
      game.scale.resize(window.innerWidth, window.innerHeight),
    );
  },
  updatePlayers: function (playersPayload) {
    if (!stanza.game) {
      stanza.game = {
        playersMap: new Map(),
      };
    }
    if (!(stanza.game.playersMap instanceof Map)) {
      stanza.game.playersMap = new Map();
    } else {
      stanza.game.playersMap.clear();
    }

    const playersList = Array.isArray(playersPayload)
      ? playersPayload
      : playersPayload && typeof playersPayload === "object"
        ? Object.values(playersPayload)
        : [];

    playersList.forEach((playerData) => {
      if (!playerData || !playerData.userId) return;
      stanza.game.playersMap.set(playerData.userId, {
          userId: playerData.userId,
          userName: playerData.userName,
          x: playerData.x,
          y: playerData.y,
          hp: playerData.hp,
          attributes: playerData.attributes,
      });
    });
    const gameScene = game?.scene?.getScene("BootScene");
    if (gameScene && typeof gameScene.syncPlayersFromServer === "function") {
      gameScene.syncPlayersFromServer(playersPayload);
    }
    visual.updatePlayersStatus();
  },
  updateGame: function (gameData) {
    stanza.game = gameData;
    gameState.currentGame = gameData;
    this.startGame();
  },

};

async function inizialize() {
  await visual.initializeHtml();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// inizializza documento
inizialize();
