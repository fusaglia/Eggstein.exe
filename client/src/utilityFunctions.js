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
  generateUser: function () {
    let userId = localStorage.getItem("userId");
    let userName = localStorage.getItem("userName");
    if (!userId || userId == "") {
      userId = this.generateUUID();
    }
    if (!userName || userName == userId.substring(0, 10)) {
      userName = userId.substring(0, 10);
      localStorage.setItem("userName", userName);
    }
    localStorage.setItem("userId", userId);
  },
};
