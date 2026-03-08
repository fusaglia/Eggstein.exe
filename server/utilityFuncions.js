//import {users} from "./server.js";
export const utility = {
  handleReconnection: function (userId) {},

  handleFirstConnection: function (userId) {},
  checkUserName: function (userName) {
    let regex = new RegExp("^[a-zA-Z0-9_]+$");
    if (!userName) {
      console.log("UserName nullo");
    } else if (!regex.test(userName)) {
      console.log("UserName non valido");
    } else if (userName.length < 5) {
      console.log("UserName troppo corto");
    } else if (userName.length > 21) {
      console.log("UserName troppo lungo");
    } else {
      console.log("UserName valido");
      return true;
    }
    return false;
  },
  getRoomList: function (rooms) {
    const roomList = [];
      rooms.forEach((value, key) => {
        roomList.push({
          roomId: value.roomId,
          players: value.players.size,
          maxPlayer: value.maxPlayer,
          password: value.password ? true : false,
        });
      });
      return roomList;
  },
};
