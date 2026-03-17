import { reload } from "./main.js";
import { socketFuncions } from "./WebSocketClient.js";
export const visual = {
  userNameTemp: null,
  screens: {
    lobbyScreen: document.getElementById("lobbyScreen"),
    roomScreen: document.getElementById("roomScreen"),
    gameScreen: document.getElementById("gameScreen"),
    userMobileWarning: document.getElementById("userMobileWarning"),
    userIdWarning: document.getElementById("userIdWarning"),
    userNameChoosingScreen: document.getElementById("userNameChoosingScreen"),
  },
  elements: {
    //userNameChoosingScreen
    userNameInput: document.getElementById("userNameInput"),
    userNameBtn: document.getElementById("userNameBtn"),

    //lobbyScreen
    createRoomBtn: document.getElementById("createBtn"),
    joinRoomBtn: document.getElementById("joinBtn"),
    roomIdInput: document.getElementById("roomIdInput"),
    createRoomIdInput: document.getElementById("CreateRoomIdInput"),
    createRoomMaxPlayers: document.getElementById("CreateRoomMaxPlayers"),
    createRoomPassword: document.getElementById("CreateRoomPassword"),
    createRoomMap: document.getElementById("CreateRoomMap"),
    availableRoomsList: document.getElementById("availableRoomsList"),

    //passwordScreen
    passwordCard: document.getElementById("passwordCard"),
    passwordInput: document.getElementById("passwordInput"),
    passwordSubmitBtn: document.getElementById("passwordSubmitBtn"),
    passwordError: document.getElementById("passwordError"),

    //roomScreen
    roomInfo: document.getElementById("roomInfo"),
    playersList: document.getElementById("playersList"),
    currentRoomName: document.getElementById("currentRoomName"),
  },

  showScreen: function (screen) {
    Object.values(this.screens).forEach((s) => {
      if (!s) return;
      s.classList.add("hidden");
      /*
      Object.values(s.elements || {}).forEach((element) => {
        element.classList.add("hidden");
      });*/
    });

    if (!screen) return;
    screen.classList.remove("hidden"); /*
    Object.values(screen.elements || {}).forEach((element) => {
      element.classList.remove("hidden");
    });*/
  },

  hideScreen: function (screen) {
    if (!screen) return;
    screen.classList.add("hidden"); /*
    Object.values(screen.elements || {}).forEach((element) => {
      element.classList.add("hidden");
    });*/
  },
  showElement: function (element) {
    if (!element) return;
    element.classList.remove("hidden");
  },
  hideElement: function (element) {
    if (!element) return;
    element.classList.add("hidden");
  },

  initializeHtml: function () {
    console.log("inizializzazione html");

    console.log("inizializzazione elementi html");

    this.elements.userNameBtn.addEventListener("click", () => {
      let regex = new RegExp("^[a-zA-Z0-9_]+$");
      const userName = this.elements.userNameInput.value.trim();
      console.log("userName scelto: " + userName);
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
        this.userNameTemp = userName;
        socketFuncions.changeUserName(userName);
      }
    });
    console.log("userNameBtn inizializzato");

    this.elements.createRoomBtn.addEventListener("click", () => {
      console.log("Create Room button clicked");
      // prendi il roomId dall'input con la regex
      let regex = new RegExp("^[a-zA-Z0-9_]+$");
      const roomId = this.elements.createRoomIdInput.value.trim();
      const attributes = {};
      const maxPlayer = parseInt(this.elements.createRoomMaxPlayers.value) || 8;
      const password = this.elements.createRoomPassword.value.trim();
      const mappa = this.elements.createRoomMap.value || "mappa1";
      if (!roomId) {
        console.log("RoomId nullo");
      } else if (!regex.test(roomId)) {
        console.log("RoomId non valido");
      } else if (roomId.length < 5) {
        console.log("RoomId troppo corto");
      } else if (roomId.length > 21) {
        console.log("RoomId troppo lungo");
      } else if (maxPlayer < 2 || maxPlayer > 8) {
        console.log("MaxPlayer non valido");
      } else {
        console.log("RoomId valido");
        if (!regex.test(password) && password.length > 0) {
          console.log("Password non valida");
          return;
        }
        attributes.maxPlayer = maxPlayer;
        attributes.password = password || null;
        attributes.mappa = mappa;
        socketFuncions.createRoom(roomId, attributes);
      }
    });
    console.log("createRoomBtn inizializzato");

    this.elements.createRoomPassword.addEventListener("input", () => {
      let regex = new RegExp("^[a-zA-Z0-9]+$");
      const password = this.elements.createRoomPassword.value.trim();
      if (!regex.test(password)) {
        console.log("Password non valida");
        this.elements.createRoomPassword.value = password.replace(
          /[^a-zA-Z0-9]/g,
          "",
        );
      }
    });
    console.log("createRoomPassword inizializzato");

    this.elements.joinRoomBtn.addEventListener("click", () => {
      console.log("Join Room button clicked");
      // prendi il roomId dall'input con la regex
      let regex = new RegExp("^[a-zA-Z0-9_-]+$");
      const roomId = this.elements.roomIdInput.value.trim();
      //prendi la stanza da socketFuncions.roomList con roomId e controlla se ha la password, se sì, chiedi la password all'utente, altrimenti entra direttamente nella stanza
      const room = socketFuncions.roomList.find((r) => r.roomId === roomId);
      if (!roomId) {
        console.log("RoomId nullo");
      } else if (!regex.test(roomId)) {
        console.log("RoomId non valido");
      } else if (roomId.length < 5) {
        console.log("RoomId troppo corto");
      } else if (roomId.length > 21) {
        console.log("RoomId troppo lungo");
      } else if (room && room.password === "Yes") {
        console.log("La stanza " + roomId + " è protetta da password");
        visual.showElement(visual.elements.passwordCard);
      } else {
        console.log("RoomId valido");
        socketFuncions.joinRoom(roomId);
      }
    });
    console.log("joinRoomBtn inizializzato");

    console.log("inizializzazione passwordSubmitBtn");
    this.elements.passwordSubmitBtn.addEventListener("click", () => {
      const password = this.elements.passwordInput.value.trim();
      const roomId = this.elements.roomIdInput.value.trim();
      let regex = new RegExp("^[a-zA-Z0-9_-]+$");
      if (!regex.test(password)) {
        console.log("Password non valida");
        return;
      }
      socketFuncions.joinRoom(roomId, password);
    });
  },

  invalidUserNameAnimation: function () {
    //animazione in css tipo
  },
  reloadRoom: function (room) {
    //aggiorna la schermata della stanza con le informazioni della stanza passata come parametro
      this.elements.currentRoomName.textContent = "Stanza: " + room.roomId;
  },
};
