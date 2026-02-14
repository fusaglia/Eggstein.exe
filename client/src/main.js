import BootScene from './scenes/BootScene.js';
import './WebSocketClient.js';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Generazione ID utente persistente
let userId = localStorage.getItem("userId");

if (!userId) {
  // genera un ID unico e sicuro con timestamp
  userId = ${crypto.randomUUID()};
  localStorage.setItem("userId", userId);
}

console.log("UserID locale:", userId);

// Connessione al server
// const socket = io(); (questa avviene in WebSocketClient.js dopo che l'utente ha scelto il nome)

// Schermate
const lobbyScreen = document.getElementById("lobbyScreen");
const roomScreen = document.getElementById("roomScreen");
const gameScreen = document.getElementById("gameScreen");
const userMobileWarning = document.getElementById("userMobileWarning");
const userIdWarning = document.getElementById("userIdWarning");

// serve qualcosa che non permetta di far eseguire questa funzione da console client (F12)
// da vedere come spostare sta roba lato server
// Cambio schermate
function showScreen(screen) {
  userMobileWarning.classList.add("hidden");
  userIdWarning.classList.add("hidden");
  lobbyScreen.classList.add("hidden");
  roomScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");

  screen.classList.remove("hidden");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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