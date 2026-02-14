import BootScene from './scenes/BootScene.js';
import './WebSocketClient.js';
import { startConnection } from './WebSocketClient.js';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Generazione ID utente persistente
let userId = localStorage.getItem("userId");
let userName = localStorage.getItem("userName");

if (!userId||userId=="") {
  // genera un ID unico e sicuro con timestamp
  userId = generateUUID() + "-" + Date.now();
  localStorage.setItem("userId", userId);
}

if (!userName||userName=="") {
  // genera un ID unico e sicuro con timestamp
  userName = "User"+userId.substring(0,10);
  localStorage.setItem("userName", userName);
}

if (userName==userId.substring(0,10))
{

}

console.log("UserID locale:", userId);

// Connessione al server
const socket = startConnection(); // (questa avviene in WebSocketClient.js dopo che l'utente ha scelto il nome)

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
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DEBUG
const cancUserNameBtn = document.getElementById("cancUserNameBtn")
const cancUserIdBtn = document.getElementById("cancUserIdBtn")

cancUserIdBtn.addEventListener("click", (event)=> {
userId = "";
localStorage.removeItem("userId")
})

cancUserNameBtn.addEventListener("click", (event)=> {
userName = "";
localStorage.removeItem("userName")
})