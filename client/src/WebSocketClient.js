import { utility } from "./utilityFunctions.js";
import { visual } from "./htmlCallFunctions.js";
import { mainObjects } from "./main.js";
export const socketFuncions = {
  socket: null,
  roomList: null,
  isReady: false,
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

      tSocket.on("202", () => {
        console.log("messaggio 202 ricevuto");
        // Username non valido: per ora riusa la schermata warning esistente.
        visual.showScreen(visual.screens.userIdWarning);
      });

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      tSocket.on("002", (callback) => {
        console.log("messaggio 002 ricevuto");
        callback(); // ← Questo riconosce il messaggio al server
      });
      tSocket.on("003", () => {
        console.log("messaggo 003 ricevuto");
        console.log("userName cambiato");
        localStorage.setItem("userName", visual.userNameTemp);
        visual.hideScreen(visual.screens.userNameChoosingScreen);
        visual.showScreen(visual.screens.lobbyScreen);
      });
    });
    tSocket.on("005", (tRoomList) => {
      if (!tRoomList) return;
      this.roomList = tRoomList;
      //se roomList è vuoto, return, altrimenti aggiorna la lista delle stanze disponibili
      if (tRoomList.length == 0) {
        visual.elements.availableRoomsList.innerHTML = "";
        console.log("Lista stanze aggiornata: nessuna stanza disponibile");
        return;
      }
      console.log("messaggio 005 ricevuto");
      console.log("Lista stanze aggiornata:", tRoomList);
      visual.elements.availableRoomsList.innerHTML = "";
      tRoomList.forEach((room) => {
        const listItem = document.createElement("li");
        listItem.textContent = `ID: ${room.roomId} - Players: ${room.players}/${room.maxPlayer} - Password: ${room.password} - Mappa: ${room.mappa}`;
        listItem.classList.add("clickable-room");
        listItem.setAttribute("role", "button");
        listItem.tabIndex = 0;

        const joinRoomFromList = () => {
          visual.elements.roomIdInput.value = room.roomId;
          visual.hideElement(visual.elements.passwordError);
          if (room.password === "Yes") {
            visual.showElement(visual.elements.passwordCard);
            return;
          }
          this.joinRoom(room.roomId);
        };

        listItem.addEventListener("click", joinRoomFromList);
        listItem.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            joinRoomFromList();
          }
        });
        visual.elements.availableRoomsList.appendChild(listItem);
      });
    });
    tSocket.on("007", (room) => {
      console.log("messaggio 007 ricevuto");
      console.log("Informazioni stanza:", room);
      mainObjects.reloadRoom(room);
      visual.resetStartCountdown();
      visual.hideElement(visual.elements.passwordCard);
      visual.showScreen(visual.screens.roomScreen);
    });
    tSocket.on("008", (user) => {
      console.log("messaggio 008 ricevuto");
      console.log("Informazioni utente entrato nella mia stanza:", user);
      mainObjects.addUserToRoom(user);
    });
    tSocket.on("009", (bool) => {
      console.log("messaggio 009 ricevuto");
      this.isReady = bool;
      visual.changeIsReady(bool);
    });
    tSocket.on("010", (userId, isReady) => {
      console.log("messaggio 010 ricevuto");
      console.log("Lo user " + userId + " è " + (isReady ? "ready" : "unready"));
      mainObjects.setUserIsReady(userId, isReady);
    });
    tSocket.on("012", (userId) => {
      //il player userId ha lasciato la stanza
      console.log("messaggio 012 ricevuto");
      console.log("Lo user " + userId + " ha lasciato la stanza");
      mainObjects.removeUserFromRoom(userId);
    });
    tSocket.on("013", (second, callback) => {
      console.log("messaggio 013 ricevuto");
      console.log("Secondi rimanenti: " + second);
      visual.showStartCountdown(second);
      callback(this.isReady);
    });
    tSocket.on("209", () => {
      console.log("messaggio 209 ricevuto");
      //errore nell'inizzializzazione della partita, qualcuno ha tolto il pronto o si è disconnesso
      visual.resetStartCountdown();
    });
    tSocket.on("014", (roomId) => {
      console.log("messaggio 014 ricevuto");
      visual.showScreen(visual.screens.gameScreen);
      visual.hideElement(visual.elements.gameTitle);
      visual.hideElement(visual.elements.debugHeader);
      console.log("La partita nella stanza è iniziata");
      mainObjects.startGame();
    });
    this.socket = tSocket;
    return tSocket;
  },

  changeUserName: function (userName) {
    this.socket.emit("102", userName);
    console.log("messaggio 102 mandato");
  },

  createRoom: async function (roomId, attributes) {
    visual.elements.createRoomBtn.disabled = true;
    await this.socket
      .timeout(3000)
      .emit("103", roomId, attributes, (err, response) => {
        if (err) console.error("err: " + err);
        if (response) console.log("response: " + response);
      });
    console.log("messaggio 103 mandato");
    visual.elements.createRoomBtn.disabled = false;
    this.joinRoom(roomId, attributes.password);
    return;
  },

  joinRoom: async function (roomId, password) {
    visual.elements.joinRoomBtn.disabled = true;
    await this.socket
      .timeout(3000)
      .emit("104", roomId, password, (err, response) => {
        if (err) console.error("err: " + err);
        if (response) {
          switch (response) {
            case "006":
              visual.hideElement(visual.elements.passwordCard);
              visual.showScreen(visual.screens.roomScreen);
              break;
            case "206":
              console.log("password sbagliata");
              visual.showElement(visual.elements.passwordCard);
              visual.showElement(visual.elements.passwordError);
              break;
            default:
              console.log("errore sconosciuto: " + response);
          }
        }
      });
    console.log("messaggio 104 mandato");
    visual.elements.joinRoomBtn.disabled = false;
    return;
  },
  readyUnready: async function () {
    visual.elements.readyBtn.disabled = true;
    await this.socket.timeout(3000).emit("105", (err, response, isReady) => {
      console.log("messaggio 105 mandato");
      if (err) console.error("err: " + err);
      if (response) {
        console.log("messaggio " + response + " ricevuto");
        console.log("isReady: " + isReady);
        switch (response) {
          case "009":
            this.isReady = isReady;
            visual.changeIsReady(isReady);
            break;
          default:
            console.log("errore sconosciuto: " + response);
        }
      }
    });
    visual.elements.readyBtn.disabled = false;
  },
  leaveRoom: async function () {
    visual.elements.leaveRoomBtn.disabled = true;
    await this.socket.timeout(3000).emit("106", (err, response) => {
      console.log("messaggio 106 mandato");
      if (err) console.error("err: " + err);
      switch (response) {
        case "011":
          visual.resetStartCountdown();
          visual.showScreen(visual.screens.lobbyScreen);
          mainObjects.leaveRoom();
          break;
        case "206":
          console.log("non sono in nessuna stanza: " + response);
          break;
        default:
          console.log("errore sconosciuto: " + response);
      }
    });
    visual.elements.leaveRoomBtn.disabled = false;
  },
};
