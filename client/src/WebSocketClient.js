
export function startConnection() {
  // Connessione al server
  const socket = io();
  socket.on("001", () => {
    console.log("messaggio 001 ricevuto");
    socket.emit("101", localStorage.getItem("userId"), localStorage.getItem("userName"))
  });
  return socket;
}