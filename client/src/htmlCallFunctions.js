export const visual = {
  screens: {
    lobbyScreen: document.getElementById("lobbyScreen"),
    roomScreen: document.getElementById("roomScreen"),
    gameScreen: document.getElementById("gameScreen"),
    userMobileWarning: document.getElementById("userMobileWarning"),
    userIdWarning: document.getElementById("userIdWarning"),
    userNameChoosingScreen: document.getElementById("userNameChoosingScreen"),
  },
  showScreen: function (screen) {
    Object.values(this.screens).forEach(s => {
        s.classList.add("hidden");
    });

    screen.classList.remove("hidden");
  },
};
