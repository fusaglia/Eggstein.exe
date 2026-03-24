import { mainObjects } from "./main.js";

//import { mainObjects } from "./main";
export const utility = {
  generateUUID: function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  },
  // ^ in case crypto.randomUUID() is not supported, but it should be in modern browsers

  generateUser: function () {
    let userId = localStorage.getItem("userId");
    let userName = localStorage.getItem("userName");
    if (!userId || userId == "") {
      console.log("generazione userId");
      //userId deve essere unico, generato con crypto.randomUUID()
      try {
        userId = crypto.randomUUID();
      } catch (error) {
        console.log("crypto.randomUUID() non supportato, generazione UUID alternativa");
        userId = this.generateUUID();
      }
    }
    if (!userName) {
      console.log("generazione userName");
      userName = "user" + userId.substring(0, 10);
      localStorage.setItem("userName", userName);
    }
    localStorage.setItem("userId", userId);
  },
  addUserToRoom: function (user) {
    if (!user) return;
    mainObjects.addUserToRoom(user);
  },
};
