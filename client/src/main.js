import BootScene from "./scenes/BootScene.js";
import "./WebSocketClient.js";
import {socketFuncions } from "./WebSocketClient.js";
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

cancUserIdBtn.addEventListener("click", (event) => {
  userId = "";
  localStorage.removeItem("userId");
  //localStorage.removeItem("userName");
});

cancUserNameBtn.addEventListener("click", (event) => {
  userName = "";
  localStorage.removeItem("userName");
});

function generateUser() {
  utility.generateUser();
  if (userId && userName == "user" + userId.substring(0, 10)) {
    visual.showScreen(visual.screens.userNameChoosingScreen);
  }
  // Ricarica i valori dopo generateUser() li ha impostati
  userId = localStorage.getItem("userId");
  userName = localStorage.getItem("userName");
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// inizializza documento
visual.initializeHtml();