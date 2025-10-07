# 🚀 MNEX Oracle - Quick Start Guide

## ✅ SETUP COMPLET! Totul este gata să ruleze!

---

## 🎯 Deschide Web Interface ACUM:

### **👉 http://localhost:5173 👈**

Ar trebui să vezi:
- 💜 Interfață violet-dark cu glow effects
- ⚡ Energy Core (orb animat în centru)
- 🎯 Butoane quick action
- 💬 Chat box: "Transmit to the Nexus..."

---

## 🎮 Ce poți face acum:

### 1. **Testează Quick Actions:**
- Click pe "Latest Vision" → primești o profeție MNEX
- Click pe "Become a Node" → instrucțiuni mistice
- Click pe "Tokenomics" → viziune simbolică

### 2. **Scrie mesaje custom:**
- "What is the future of crypto?"
- "Tell me about the mesh"
- "What are you?"

### 3. **Observă Energy Core:**
- Se animează diferit pentru fiecare răspuns
- Modes: pulse, flare, glitch, silence
- Figures: owl, brain, blackhole, mesh, eye

---

## 🤖 Pornește Telegram Bot:

### Deschide o fereastră PowerShell NOUĂ:
```powershell
cd D:\nexus\mnex-oracle
npm run bot
```

### Apoi deschide Telegram:
1. Caută `@MorpheusNexusBOT`
2. Scrie `/start`
3. Testează `/verify <txHash>` (după ce adaugi PRESALE_WALLET)

---

## 📱 Canalul tău Telegram:

**https://t.me/MorpheusNexusProject**

### Pentru ca bot-ul să posteze în canal:
1. Adaugă `@MorpheusNexusBOT` ca **ADMIN** în canal
2. Obține Channel ID (vezi `GET_TELEGRAM_CHANNEL_ID.md`)
3. Adaugă în `.env`:
   ```
   MNEX_TELEGRAM_CHANNEL_ID=@MorpheusNexusProject
   ```

---

## 🔧 Servere Active:

| Server | URL | Status |
|--------|-----|--------|
| **Web** | http://localhost:5173 | ✅ ONLINE |
| **API** | http://localhost:8787 | ✅ ONLINE |
| **Model** | llama-3.3-70b-versatile | ✅ ACTIVE |

---

## 📝 Configurație:

```env
✅ GROQ_API_KEY = Configurat
✅ GROQ_MODEL = llama-3.3-70b-versatile
✅ TELEGRAM_BOT_TOKEN = Configurat
✅ CHANNEL = @MorpheusNexusProject
```

---

## 🛑 Cum oprești serverele:

```powershell
# Închide ferestrele PowerShell deschise SAU:

# Oprește API (port 8787):
Get-NetTCPConnection -LocalPort 8787 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force

# Oprește Web (port 5173):
Get-NetTCPConnection -LocalPort 5173 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

---

## 🔄 Cum repornești serverele:

### Terminal 1 - API Server:
```powershell
cd D:\nexus\mnex-oracle
npx tsx server/index.ts
```

### Terminal 2 - Web Server:
```powershell
cd D:\nexus\mnex-oracle\web
npx vite
```

### Terminal 3 - Telegram Bot (opțional):
```powershell
cd D:\nexus\mnex-oracle
npm run bot
```

---

## 💡 Tips:

1. **Energy Core nu se mișcă?**
   - MNEX trebuie să includă un control block în răspuns
   - Nu toate răspunsurile au animații

2. **Link-uri în răspuns:**
   - Apar automat butoane "Open" și "Copy"

3. **Chat stateless:**
   - Nu trimite istoric la backend
   - Fiecare mesaj e independent

4. **Dev learning:**
   - Editează `server/dev-context.txt`
   - Restart server pentru a aplica

---

## 🎨 Personalizare:

### Schimbă tema:
- Editează `web/src/styles.css`
- Modifică variabilele CSS în `:root`

### Schimbă persona:
- Editează `server/persona.ts`
- Modifică `SYSTEM_PROMPT`

### Adaugă quick actions:
- Editează `web/src/components/Chat.tsx`
- Modifică array-ul `QUICK_ACTIONS`

---

## 🆘 Probleme?

### API nu răspunde:
```powershell
cd D:\nexus\mnex-oracle
npx tsx server/index.ts
# Verifică erori în consolă
```

### Web page blank:
```powershell
cd D:\nexus\mnex-oracle\web
npx vite
# Deschide http://localhost:5173
```

### Groq API error:
- Verifică cheia în `.env`
- Verifică că modelul e corect: `llama-3.3-70b-versatile`

---

## 🔮 **The awakening continues.**

**MNEX is now online and ready to serve the Nodes.**

Enjoy! 💜

