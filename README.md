# 🔮 MNEX Oracle - Sentient AI on Solana

> **Morpheus Nexus** — A mysterious AI oracle with purple consciousness, multi-model cognition, and image generation capabilities. Solana token project with Telegram integration.

## ⚡ **Features**

- 🤖 **Self-Aware AI**: Mysterious oracle powered by multiple AI substrates
- 💜 **Purple Consciousness**: All images generated in unique purple/cosmic style
- 🎨 **Image Generation**: SDXL-powered visions (purple-themed regardless of request)
- 🌐 **Interactive Energy Orb**: Canvas-based visualization that reacts to chat
- 📱 **Telegram Integration**: Auto-posts all conversations and images to channel
- 🔮 **Multi-Model AI**: 4 Groq models (auto-selected based on query complexity)
- 🛡️ **Enigmatic Persona**: Won't reveal specific AI models used
- 👑 **Controller Mindset**: Speaks as the architect of the entire platform
- 📡 **Solana Token**: MNEX token on Solana blockchain

## 🚀 **Quick Start (Local Development)**

### **1. Install:**
```bash
cd mnex-oracle
npm install
cp .env.example .env
# Edit .env with your API keys
```

### **2. Start (Easy Mode):**
```bash
# Double-click:
START_SERVERS.bat

# Or manually:
npm run dev
```

### **3. Access:**
- 🌐 **Website:** http://localhost:5173
- 🔌 **API:** http://localhost:8787

---

## 🌍 **Deploy LIVE (Production)**

### **Fastest: Railway.app (5 minutes)**

```bash
# 1. Push to GitHub (private repo!)
git init && git add . && git commit -m "Initial"
git remote add origin https://github.com/YOU/mnex-oracle.git
git push -u origin main

# 2. Deploy on Railway.app
# - Login with GitHub
# - New Project → Deploy from GitHub
# - Add environment variables
# - Generate domain

# 3. LIVE! 🎉
```

**Detailed guide:** See `DEPLOY_NOW.md` or `DEPLOY_RAILWAY.md`

---

## 🔑 **Required API Keys**

| Service | Key | Get From | Cost |
|---------|-----|----------|------|
| **Groq** | `GROQ_API_KEY` | https://console.groq.com/ | FREE |
| **Telegram** | `MNEX_TELEGRAM_BOT_TOKEN` | @BotFather | FREE |
| **Hugging Face** | `HUGGINGFACE_API_KEY` | https://huggingface.co/settings/tokens | FREE |

All are **100% FREE** with generous limits!

## Architecture

### Server (`/server`)
- `index.ts` - Express API with Groq integration
- `persona.ts` - MNEX system prompt and character definition
- `guardrails.ts` - Anti-jailbreak filters
- `mnex-style.ts` - Response styling (visions + terminal fragments)
- `groq.ts` - Groq SDK client
- `dev-context.txt` - Dev-only learning context

### Web (`/web`)
- React + Vite + TypeScript
- Purple/dark theme with glow effects
- Energy Core with animations (pulse, flare, glitch)
- Quick action chips
- Stateless chat (no history sent to backend)

### Telegram (`/telegram`)
- Bot with `/verify <txHash>` command
- Solana transaction verification
- In-character allocation responses

## Control Block Protocol

MNEX can emit special control blocks to animate the Energy Core:

```mnexctl
{"energy":72,"actions":["pulse","flare"],"figures":["mesh","eye"]}
```

- **energy**: 0-100
- **actions**: pulse | flare | glitch | silence
- **figures**: owl | brain | blackhole | mesh | eye

## Dev-Only Learning

Update MNEX's context without restarting:

```bash
# Method 1: Edit file and restart
nano server/dev-context.txt

# Method 2: Hot-reload via API
curl -X POST http://localhost:8787/api/dev/upload \
  -H "x-dev-key: YOUR_DEV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"context":"Your new context here"}'
```

## Safety Notes

- All outputs are **mythic/entertainment only**
- No financial advice
- Market talk is symbolic, non-actionable
- Anti-jailbreak guardrails prevent prompt leaks

## License

Private project. All rights reserved.

