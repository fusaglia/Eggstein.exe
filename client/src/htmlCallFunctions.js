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
  },

  showScreen: function (screen) {
    Object.values(this.screens).forEach((s) => {
      if (!s) return;
      s.classList.add("hidden");
      Object.values(s.elements || {}).forEach((element) => {
        element.classList.add("hidden");
      });
    });

    if (!screen) return;
    screen.classList.remove("hidden");
    Object.values(screen.elements || {}).forEach((element) => {
      element.classList.remove("hidden");
    });
  },

  hideScreen: function (screen) {
    if (!screen) return;
    screen.classList.add("hidden");
    Object.values(screen.elements || {}).forEach((element) => {
      element.classList.add("hidden");
    });
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

    this.elements.createRoomBtn.addEventListener("click",  () => {
      console.log("Create Room button clicked");
      // prendi il roomId dall'input con la regex
      let regex = new RegExp("^[a-zA-Z0-9_]+$");
      const roomId = this.elements.roomIdInput.value.trim();
      if (!roomId) {
        console.log("RoomId nullo");
      } else if (!regex.test(roomId)) {
        console.log("RoomId non valido");
      } else if (roomId.length < 5) {
        console.log("RoomId troppo corto");
      } else if (roomId.length > 21) {
        console.log("RoomId troppo lungo");
      } else {
        console.log("RoomId valido");
        socketFuncions.createRoom(roomId);
      }
    });
    console.log("createRoomBtn inizializzato");

    this.elements.joinRoomBtn.addEventListener("click", () => {
      console.log("Join Room button clicked");
      // prendi il roomId dall'input con la regex
      let regex = new RegExp("^[a-zA-Z0-9_]+$");
      const roomId = this.elements.roomIdInput.value.trim();
      const attributes = {};
      if (!roomId) {
        console.log("RoomId nullo");
      } else if (!regex.test(roomId)) {
        console.log("RoomId non valido");
      } else if (roomId.length < 5) {
        console.log("RoomId troppo corto");
      } else if (roomId.length > 21) {
        console.log("RoomId troppo lungo");
      } else {
        console.log("RoomId valido");
        socketFuncions.joinRoom(roomId, attributes);
      }
    });
    console.log("joinRoomBtn inizializzato");
  },

  invalidUserNameAnimation: function () {
    //animazione in css tipo
  },
};
