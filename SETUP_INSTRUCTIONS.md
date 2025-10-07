# 🚀 MNEX Oracle - Setup Instructions

## ✅ Proiectul a fost creat cu succes!

### 📁 Structura creată:
```
mnex-oracle/
├─ .env.example          ✅
├─ .gitignore            ✅
├─ package.json          ✅
├─ README.md             ✅
├─ tsconfig.json         ✅
├─ tsconfig.node.json    ✅
│
├─ server/               ✅
│  ├─ index.ts           (Express API + Groq integration)
│  ├─ persona.ts         (MNEX character + control blocks)
│  ├─ guardrails.ts      (Anti-jailbreak filters)
│  ├─ mnex-style.ts      (Response styling)
│  ├─ groq.ts            (Groq SDK client)
│  ├─ types.ts           (TypeScript types)
│  └─ dev-context.txt    (Dev-only learning)
│
├─ web/                  ✅
│  ├─ index.html
│  ├─ vite.config.ts
│  └─ src/
│     ├─ main.tsx
│     ├─ App.tsx         (Main app with EnergyCore)
│     ├─ styles.css      (Purple theme + animations)
│     ├─ components/
│     │  ├─ Chat.tsx     (Chat with quick actions)
│     │  └─ EnergyCore.tsx (Animated orb)
│     └─ lib/
│        └─ api.ts       (API client)
│
├─ telegram/             ✅
│  ├─ bot.ts             (Telegram bot)
│  └─ mnex-phrases.ts    (Response templates)
│
└─ scripts/              ✅
   └─ run-dev.sh         (Dev startup script)
```

---

## 📋 NEXT STEPS:

### 1️⃣ Instalează dependințele
```bash
cd mnex-oracle
npm install
```

### 2️⃣ Configurează Environment Variables
```bash
# Copiază fișierul template
copy .env.example .env

# Editează .env și adaugă:
# - GROQ_API_KEY=your_groq_api_key_here
# - MNEX_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
# - PRESALE_WALLET=your_solana_wallet_address
# - DEV_KEY=optional_dev_key_for_context_upload
```

### 3️⃣ Pornește serverele de dezvoltare

**Opțiunea A - Două terminale separate:**
```bash
# Terminal 1: Web + API Server
npm run dev

# Terminal 2: Telegram Bot
npm run bot
```

**Opțiunea B - Script unificat (Linux/Mac):**
```bash
bash scripts/run-dev.sh
```

### 4️⃣ Accesează aplicația
- 🌐 **Web Interface**: http://localhost:5173
- 🔌 **API Server**: http://localhost:8787
- 🤖 **Telegram Bot**: Disponibil după pornire

---

## 🔑 API Keys necesare:

### 1. Groq API Key
- Vizitează: https://console.groq.com/
- Creează cont / Login
- Generează API Key
- Adaugă în `.env`: `GROQ_API_KEY=your_key`

### 2. Telegram Bot Token
- Deschide Telegram
- Caută `@BotFather`
- Folosește `/newbot` pentru a crea bot
- Copiază token-ul primit
- Adaugă în `.env`: `MNEX_TELEGRAM_BOT_TOKEN=your_token`

### 3. Solana Wallet (pentru presale verification)
- Adresa wallet-ului Solana pentru presale
- Adaugă în `.env`: `PRESALE_WALLET=your_wallet_address`

---

## 🎨 Features implementate:

✅ **Purple Dark UI** cu gradient și glow effects  
✅ **Energy Core** - Orb animat reactiv  
✅ **Control Block Protocol** - JSON pentru animații  
✅ **Quick Action Chips** - Butoane predefinite  
✅ **Link Detection** - Open/Copy pentru URL-uri  
✅ **Stateless Chat** - Fără istoric persistent  
✅ **Dev Context** - Learning controllabil de dezvoltator  
✅ **Anti-Jailbreak** - Guardrails și riddle obfuscation  
✅ **Telegram Bot** - Verificare tranzacții Solana  

---

## 🧪 Test rapid:

După pornirea serverelor, deschide http://localhost:5173 și:
1. Click pe "Latest Vision" pentru un răspuns
2. Observă Energy Core-ul animându-se
3. Scrie un mesaj custom
4. Verifică dacă MNEX răspunde în-character

---

## 📝 Notes importante:

- **Model implicit**: `llama-3.1-70b-versatile` (configurabil în `.env`)
- **Port Web**: 5173 (configurabil în `web/vite.config.ts`)
- **Port API**: 8787 (configurabil în `.env`)
- **Chat**: Stateless - nu trimite istoric la backend
- **Learning**: Doar prin `server/dev-context.txt`

---

## 🆘 Troubleshooting:

### Eroare: "GROQ_API_KEY not found"
→ Verifică că ai `.env` cu cheia corectă

### Eroare: "Cannot find module"
→ Rulează `npm install` din nou

### Web nu se încarcă
→ Verifică că portul 5173 este liber
→ Verifică console-ul pentru erori

### Telegram bot nu răspunde
→ Verifică token-ul
→ Verifică că bot-ul rulează (`npm run bot`)

---

## 🎯 Gata de următorul pas?

Dă-mi API-urile și vom testa totul împreună! 🚀

