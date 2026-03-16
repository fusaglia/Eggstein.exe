import { utility } from "./utilityFunctions.js";
import { visual } from "./htmlCallFunctions.js";
export const socketFuncions = {
  socket: null,
  roomList: null,
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
        visual.elements.availableRoomsList.appendChild(listItem);
      });
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
        if (err) console.error(err);
        if (response) console.log(response);
      });
    console.log("messaggio 103 mandato");
    visual.elements.createRoomBtn.disabled = false;
    return;
  },

  joinRoom: async function (roomId, password) {
    visual.elements.joinRoomBtn.disabled = true;
    await this.socket.timeout(3000).emit("104", roomId, password, (err, response) => {
      if (err) console.error(err);
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
            console.log("messaggio 104 ricevuto");
        }
      }
      
    });
    console.log("messaggio 104 mandato");
    visual.elements.joinRoomBtn.disabled = false;
    return;
  },
};

