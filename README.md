# 🥚 Eggstein.exe
---

## 📡 Struttura dei Codici Messaggi

I messaggi scambiati tra **server** e **client** seguono questo schema:

| Range | Origine | Significato |
|-------|---------|-------------|
| `00N` | Server  | Messaggi dal server verso il o i client|
| `10N` | Client  | Messaggi dal client verso il server|
| `20N` | Server  | Errori lato server |
| `30N` | Client  | Errori lato client |

---

## 📨 Messaggi Attualmente Implementati

### 🔵 Messaggi Server → Client (00N)
| Codice | Descrizione | Contenuto |
|--------|-------------|-----------|
| **001**|`ciao negro! mandami il tuo UserID e il tuo UserName`|`vuoto`|
| **002**|`ping`|`vuoto`|
| **003**|`userName cambiato`|`vuoto`|
| **004**|`stanza creata`|`vuoto`|
| **005**|`broadcast delle stanze`|`<map(rooms)>`|


---

### 🟢 Messaggi Client → Server (10N)
| Codice | Descrizione | Contenuto |
|--------|-------------|-----------|
| **101**|`risposta al messaggio 001, manda lo userID e lo userName`|`<userId>`, `<userName>`|
| **102**|`manda al server lo userName cambiato`|`<UserName>`|
| **103**|`manda al server il rommId della stanza che vuole creare`|`<roomId>`|
| **104**|`manda al server il rommId della stanza in cui vuole entrare`|`<roomId>`|

---

### 🔴 Errori Server (20N)
| Codice | Descrizione | Contenuto |
|--------|-------------|-----------|
| **201**|`dice al client che esiste già una persona con quello userId`|`vuoto`|
| **202**|`dice al client che il suo userName non va bene`|`vuoto`|
| **203**|`dice al client che la stanza che vuole creare esiste già`|`vuoto`|
| **204**|`dice al client che la stanza in cui vuole entrare non esistes`|`vuoto`|

### 🟠 Errori Client (30N)
| Codice | Descrizione | Contenuto |
|--------|-------------|-----------|

http://25.37.171.45:3000
