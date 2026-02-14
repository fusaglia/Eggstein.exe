export function startConnection() {
  // Connessione al server
  const socket = io();
  return socket;
}

