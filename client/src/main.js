import BootScene from "./scenes/BootScene.js";
import "./WebSocketClient.js";
import { socketFuncions } from "./WebSocketClient.js";
import { utility } from "./utilityFunctions.js";
import { visual } from "./htmlCallFunctions.js";

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
/*
const imageCache = new Map();
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    scene: [BootScene]
};

const game = new Phaser.Game(config);

// resize
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});
*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// funzioni utility

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
// inizializza documento
visual.initializeHtml();

export const reload = {
  reloadUserNameAndId: function () {
    userId = localStorage.getItem("userId");
    userName = localStorage.getItem("userName");
  },
  reloadRoom: function (room) {
    stanza = room;
  },
};
