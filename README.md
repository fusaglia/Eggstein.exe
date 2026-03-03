# 🥚 Eggstein.exe
---

## 📡 Struttura dei Codici Messaggi

I messaggi scambiati tra **server** e **client** seguono questo schema:

| Range | Origine | Significato |
|-------|---------|-------------|
| `00N` | Server  | Messaggi informativi del server |
| `10N` | Client  | Messaggi informativi del client |
| `20N` | Server  | Errori lato server |
| `30N` | Client  | Errori lato client |

---

## 📨 Messaggi Attualmente Implementati

### 🔵 Messaggi Server → Client (00N)
| Codice | Descrizione |
|--------|-------------|
| **001**|`ciao negro! mandami il tuo UserID e il tuo UserName`|
| **002**|`ping`|
| **003**|`userName cambiato`|


---

### 🟢 Messaggi Client → Server (10N)
| Codice | Descrizione |
|--------|-------------|
| **101**|`<userId>`, `<userName>`|
| **102**|`<UserName>`|

---

### 🔴 Errori Server (20N)
| Codice | Descrizione |
|--------|-------------|
| **201**|`blud cambia il tuo userId`|

### 🟠 Errori Client (30N)
| Codice | Descrizione |
|--------|-------------|


http://25.37.171.45:3000
