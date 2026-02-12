// 🆔 Generazione ID utente persistente
let userId = localStorage.getItem("userId");
let userName = localStorage.getItem("userName");

if (!userId) {
  // genera un ID unico e sicuro con timestamp
  userId = `${crypto.randomUUID()}`;
  localStorage.setItem("userId", userId);
}

// aggiungi controllo per verificare che questo userid non sia già collegato al server con altro socket (con un'altra istanza del client aka un'altra scheda aperta)

console.log("UserID locale:", userId);

// chiedi all'utente di inserire un nome utente se non è già presente
if (!userName) {
  userName = prompt("Inserisci il tuo nome utente:");
    if (userName) {
        localStorage.setItem("userName", userName);
    } else {
        userName = "Utente" + Math.floor(Math.random() * 1000); // nome utente di default se l'utente non inserisce nulla
        localStorage.setItem("userName", userName);
    }
}

console.log("UserName locale:", userName);

// Connessione al server
const socket = io();