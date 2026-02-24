import { utility } from "./utilityFunctions.js";
import { visual } from "./htmlCallFunctions.js";
export const socketFuncions = {
  socket: null,
  startConnection: function () {
    // Connessione al server
    const tSocket = io();
    tSocket.on("connect", () => {
      localStorage.setItem("oldSocketId", tSocket.id);
      console.log("socketId: " + tSocket.id);

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      tSocket.on("001", () => {
        console.log("messaggio 001 ricevuto");
        tSocket.emit(
          "101",
          localStorage.getItem("userId"),
          localStorage.getItem("userName"),
        );
        console.log("messaggio 101 mandato");
      });

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      tSocket.on("201", () => {
        console.log("messaggio 201 ricevuto");
        //showscreen userWarning
        visual.showScreen(visual.screens.userIdWarning);
        /*
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      utility.generateUser();
      socket.emit(
        "101",
        localStorage.getItem("userId"),
        localStorage.getItem("userName"),
      );*/
      });

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      tSocket.on("002", (callback) => {
        console.log("messaggio 003 ricevuto");
        callback(); // ← Questo riconosce il messaggio al server
      });
    });
    this.socket = tSocket;
    return tSocket;
  },
  changeUserName: function(userName) {
    this.socket.emit("102", userName)

  }
};
