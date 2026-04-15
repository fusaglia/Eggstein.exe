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



// Gioco
const stanza = {};

// controllo se il client è da telefono
function isMobileDevice() {
  // Combina metodi più affidabili:
  // 1. maxTouchPoints: dispositivi mobili hanno >2 touch points
  // 2. matchMedia: CSS media query per dispositivi touch senza hover
  // 3. User agent come fallback
  return (
    navigator.maxTouchPoints > 2 ||
    window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

if (isMobileDevice()) {
  visual.showScreen(visual.screens.userMobileWarning);
  //fermata il refresh della pagina
  window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "";
  });
  //blocca l'eseguzione del resto del file (che contiene la logica del gioco) se è un dispositivo mobile
  throw new Error("Dispositivo mobile non supportato");
} else 
{
  // Connessione al server
const socket = socketFuncions.startConnection(); // (questa avviene in WebSocketClient.js dopo che l'utente ha scelto il nome)
}


// Funzione per gestire la riconnessione o la nuova connessione

// Schermate

// serve qualcosa che non permetta di far eseguire questa funzione da console client (F12)
// da vedere come spostare sta roba lato server
// Cambio schermate

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//game utils
const config = {
  type: Phaser.AUTO,
  parent: "gameScreen",
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
let pendingAbilitiesIndex = null;
// resize

function generateUser() {
  utility.generateUser();

  // Ricarica i valori dopo generateUser() li ha impostati.
  userId = localStorage.getItem("userId");
  userName = localStorage.getItem("userName");

  const defaultNameA = userId ? userId.substring(0, 10) : "";
  const defaultNameB = userId ? "user" + userId.substring(0, 10) : "";
  if (userId && (userName === defaultNameA || userName === defaultNameB)) {
    visual.showScreen(visual.screens.userNameChoosingScreen);
  } else {
    visual.showScreen(visual.screens.lobbyScreen);
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//funzioni main

export const mainObjects = {
  flushPendingAbilities: function () {
    if (!Array.isArray(pendingAbilitiesIndex)) return;
    const gameScene = game?.scene?.getScene("BootScene");
    if (!gameScene || typeof gameScene.updateAbilities !== "function") return;
    gameScene.updateAbilities(pendingAbilitiesIndex);
    pendingAbilitiesIndex = null;
  },
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
    pendingAbilitiesIndex = null;

    if (game) {
      game.destroy(true);
      game = null;
    }
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
        direction: playerData.direction,
        attributes: playerData.attributes,
      });
    });
    const gameScene = game?.scene?.getScene("BootScene");
    if (gameScene && typeof gameScene.syncPlayersFromServer === "function") {
      gameScene.syncPlayersFromServer(playersPayload);
      this.flushPendingAbilities();
    }
    visual.updatePlayersStatus();
  },
  updateGame: function (gameData) {
    stanza.game = gameData;
    gameState.currentGame = gameData;
    this.startGame();
  },
  updateAbilities: function (abilitiesIndex) {
    if (!Array.isArray(abilitiesIndex)) return;
    const gameScene = game?.scene?.getScene("BootScene");
    if (gameScene && typeof gameScene.updateAbilities === "function") {
      gameScene.updateAbilities(abilitiesIndex);
      return;
    }
    pendingAbilitiesIndex = [...abilitiesIndex];
  },
  playAbilityFx: function (effectPayload) {
    const gameScene = game?.scene?.getScene("BootScene");
    if (!gameScene || typeof gameScene.playAbilityFx !== "function") {
      console.log("[AbilityImage] playAbilityFx skipped: scene not ready", {
        hasGame: Boolean(game),
        hasScene: Boolean(gameScene),
      });
      return;
    }
    console.log("[AbilityImage] playAbilityFx bridge", effectPayload);
    gameScene.playAbilityFx(effectPayload);
  },
  playerDead: function () {
    const gameScene = game?.scene?.getScene("BootScene");
    gameScene?.playerDead();
  },
  playerRespawn: function (spawnX, spawnY) {
    const gameScene = game?.scene?.getScene("BootScene");
    gameScene?.playerRespawn(spawnX, spawnY);
  },

  gameOver: function (winnerName) {
    // Overlay fine partita
    const overlay = document.createElement("div");
    overlay.id = "gameOverOverlay";
    overlay.style.cssText = [
      "position:fixed", "inset:0",
      "background:rgba(0,0,0,0.78)",
      "display:flex", "flex-direction:column",
      "align-items:center", "justify-content:center",
      "z-index:99999", "pointer-events:all",
    ].join(";");

    const img = document.createElement("img");
    img.src = "assets/images/VictoryRoyale.png";
    img.alt = "Victory Royale";
    img.style.cssText = "max-width:62vw;max-height:48vh;object-fit:contain;";

    const txt = document.createElement("h2");
    txt.textContent = winnerName ? `Vincitore: ${winnerName}` : "Partita terminata!";
    txt.style.cssText = [
      "color:#ffd700", "font-size:2.4rem",
      "margin-top:1.2rem", "font-family:sans-serif",
      "text-shadow:0 3px 12px #000", "text-align:center",
    ].join(";");

    overlay.appendChild(img);
    overlay.appendChild(txt);
    document.body.appendChild(overlay);

    // Suono vittoria
    const audio = new Audio("assets/sounds/victory-royale.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => { });

    // Torna alla lobby dopo 6 secondi
    setTimeout(() => {
      const el = document.getElementById("gameOverOverlay");
      if (el) el.remove();
      this.leaveRoom();
      visual.showScreen(visual.screens.lobbyScreen);
      visual.showElement(visual.elements.gameTitle);
    }, 6000);
  },

};

async function inizialize() {
  await visual.initializeHtml();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// inizializza documento
inizialize();