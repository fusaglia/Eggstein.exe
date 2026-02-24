import { socketFuncions } from "./WebSocketClient.js";
export const visual = {
  screens: {
    lobbyScreen: document.getElementById("lobbyScreen"),
    roomScreen: document.getElementById("roomScreen"),
    gameScreen: document.getElementById("gameScreen"),
    userMobileWarning: document.getElementById("userMobileWarning"),
    userIdWarning: document.getElementById("userIdWarning"),
    userNameChoosingScreen: document.getElementById("userNameChoosingScreen"),
  },
  elements: {
    userNameInput: document.getElementById("userNameInput"),
    userNameBtn: document.getElementById("userNameBtn"),
  },
  showScreen: function (screen) {
    Object.values(this.screens).forEach((s) => {
      s.classList.add("hidden");
    });

    screen.classList.remove("hidden");
  },
  initializeHtml: function () {
    console.log("inizializzazione html");
    console.log("inizializzazione elementi html");
    this.elements.userNameBtn.addEventListener("click", () => {
      let regex = new RegExp("[a-zA-Z0-9_]+$");
      const userName = this.elements.userNameInput.value.trim();
      if (userName) {
        console.log("UserName nullo");
      } else if (regex.test(userName))
      {
        console.log("UserName non valido")
      } else if (userName.lenght()>5)
      {
        console.log("UserName troppo corto")
      } else if (userName.lenght()<21)
      {
        console.log("UserName troppo lungo")
      } else 
      {
        console.log("UserName valido")
        socketFuncions.changeUserName(userName);
      }
    });
    console.log("userNameBtn inizializzato");
  },
  invalidUserNameAnimation: function() {

  }
};
