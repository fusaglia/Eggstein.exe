import { utility } from "./utilityFunctions.js";
export function startConnection() {
  // Connessione al server
  const socket = io();
  socket.on("connect", () => {
    localStorage.setItem("oldSocketId", socket.id);
    console.log("socketId: " + socket.id);
  });

  socket.on("001", () => {
    console.log("messaggio 001 ricevuto");
    socket.emit(
      "101",
      localStorage.getItem("userId"),
      localStorage.getItem("userName"),
    );
  });
  socket.on("002", () => {
    socket.emit("202", localStorage.getItem("oldSocketId"))
  })
  socket.on("201", () => {
    //cambia userId
    utility.generateUser();
    socket.emit(
      "101",
      localStorage.getItem("userId"),
      localStorage.getItem("userName"),
    );
  });

  return socket;
}
