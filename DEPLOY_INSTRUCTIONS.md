# 🚀 Deploy MNEX Oracle on Railway.app

## Quick Steps:

### 1. Railway Setup
- Go to: https://railway.app/
- Login with GitHub
- New Project → Deploy from GitHub
- Select: `broiscodingtpc/gagagagagagaga`

### 2. Add Environment Variables

Railway Dashboard → Variables → Add these:

```
GROQ_API_KEY = (your key from local .env)
GROQ_MODEL = llama-3.3-70b-versatile
PORT = 8787
MNEX_TELEGRAM_BOT_TOKEN = (your token from local .env)
MNEX_TELEGRAM_CHANNEL_ID = @MorpheusNexusProject
SOLANA_RPC_URL = https://api.mainnet-beta.solana.com
PRESALE_WALLET = 11111111111111111111111111111111
HUGGINGFACE_API_KEY = (your HF key from local .env)
NODE_ENV = production
```

### 3. Generate Domain

Settings → Networking → Generate Domain

You'll get: `https://your-app.up.railway.app`

### 4. Update VITE_API_URL

Add one more variable:
```
VITE_API_URL = https://your-app.up.railway.app
```

(Replace with your actual Railway URL from step 3)

### 5. Done!

Railway will auto-deploy. Visit your URL in ~3 minutes!

---

## Security:
✅ API keys are encrypted on Railway  
✅ .env is NOT in Git  
✅ Secrets stay on server

---

For detailed guides, check local docs after deployment.

