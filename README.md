# 🥚 Eggstein.exe


npx http-server .

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

---

### 🟢 Messaggi Client → Server (10N)
| Codice | Descrizione |
|--------|-------------|

---

### 🔴 Errori Server (20N)
| Codice | Descrizione |

### 🟠 Errori Client (30N)
| Codice | Descrizione |
|--------|-------------|