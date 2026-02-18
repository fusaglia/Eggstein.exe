import { utility } from "./utilityFunctions.js";
import { visual } from "./htmlCallFunctions.js";

export function startConnection() {
  // Connessione al server
  const socket = io();
  socket.on("connect", () => {
    localStorage.setItem("oldSocketId", socket.id);
    console.log("socketId: " + socket.id);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.on("001", () => {
      console.log("messaggio 001 ricevuto");
      socket.emit(
        "101",
        localStorage.getItem("userId"),
        localStorage.getItem("userName"),
      );
      console.log("messaggio 101 mandato");
    });

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.on("201", () => {
      console.log("messaggio 201 ricevuto")
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
    socket.on("002", (callback) => {
      console.log("messaggio 003 ricevuto");
      callback(); // ← Questo riconosce il messaggio al server
    });

  });




  return socket;
}
