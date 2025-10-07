# 🚀 MNEX Oracle - Deployment Guide

## 🌐 Deploy pe Railway.app (RECOMANDAT)

Railway este **cel mai simplu** și **GRATUIT** pentru proiecte mici!

---

## 📋 **PAȘI DEPLOYMENT:**

### **1. Pregătește Git Repository (dacă nu ai):**

```bash
cd D:\nexus\mnex-oracle
git init
git add .
git commit -m "MNEX Oracle - Initial deployment"
```

Apoi push pe GitHub (private repo):
```bash
# Creează repo pe github.com (private!)
git remote add origin https://github.com/username/mnex-oracle.git
git branch -M main
git push -u origin main
```

---

### **2. Deploy pe Railway:**

#### **A. Creează cont:**
- Mergi la: https://railway.app/
- Sign up with GitHub
- Conectează-ți contul GitHub

#### **B. Creează nou proiect:**
- Click: **"New Project"**
- Select: **"Deploy from GitHub repo"**
- Alege: **mnex-oracle** repository

#### **C. Configurează Environment Variables:**

Click pe proiect → **Variables** → Add toate acestea:

```env
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile
PORT=8787

MNEX_TELEGRAM_BOT_TOKEN=7899483407:AAGn_rW3Opflg6Po6sHxk_4xUSVuOzlPXzs
MNEX_TELEGRAM_CHANNEL_ID=@MorpheusNexusProject

SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRESALE_WALLET=11111111111111111111111111111111

HUGGINGFACE_API_KEY=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

NODE_ENV=production
```

#### **D. Deploy:**
- Railway va detecta automat `package.json`
- Va rula `npm install`
- Va porni cu `npm run start:prod`
- Deployment automat! 🎉

#### **E. Obține URL:**
- Railway îți dă URL: `https://mnex-oracle-production.up.railway.app`
- Sau configurează custom domain

---

## 🔐 **SECURITATE - Environment Variables:**

### **✅ CE e SIGUR:**
Toate secretele sunt în **Railway Environment Variables**:
- ✅ GROQ_API_KEY
- ✅ TELEGRAM_BOT_TOKEN
- ✅ HUGGINGFACE_API_KEY

**NU sunt în cod!** Sunt pe serverele Railway, criptate.

### **❌ CE să NU faci:**
- ❌ Nu pune `.env` în Git
- ❌ Nu commit-ezi API keys în cod
- ❌ Nu dezvălui TOKEN-urile public

### **✅ `.gitignore` deja include:**
```
.env
.env.local
*.log
```

---

## 🌐 **Configurare Frontend pentru Production:**

Railway va seta automat:
```env
VITE_API_URL=https://mnex-oracle-production.up.railway.app
```

Frontend-ul va folosi automat URL-ul corect (din `config.ts`)!

---

## 💰 **COSTURI Railway (FREE tier):**

```
✅ $5 credit lunar GRATUIT
✅ ~500 ore execution/lună
✅ 512 MB RAM
✅ 1 GB disk
✅ Custom domain GRATUIT

Suficient pentru:
- 100-1000 users/zi
- Chat nelimitat
- Image generation (cu HF API)
- Telegram bot
```

Dacă depășești: upgrade la $5-10/lună (opțional)

---

## 🎯 **ALTERNATIVE:**

### **Opțiunea 2: Vercel (Frontend) + Railway (Backend)**

**Frontend pe Vercel:**
```bash
cd web
vercel deploy
# Setează VITE_API_URL în Vercel dashboard
```

**Backend pe Railway:**
- Doar `server/` folder
- Environment variables acolo

**Pro:**
- Frontend ultra-fast (CDN global)
- Backend separat

**Con:**
- Mai complicat de configurat

---

### **Opțiunea 3: Render.com**

Similar cu Railway:
- Free tier: 750h/lună
- Deploy din GitHub
- Environment variables
- Custom domain

**Deploy:**
1. https://render.com → New Web Service
2. Connect GitHub repo
3. Build: `npm install && npm run build:web`
4. Start: `npm run start:prod`
5. Add environment variables

---

### **Opțiunea 4: Fly.io**

Pentru users avansați:
```bash
flyctl launch
flyctl secrets set GROQ_API_KEY=xxx
flyctl deploy
```

**Pro:**
- Mai mult control
- Edge locations

**Con:**
- Mai complex

---

## 📁 **Ce am pregătit pentru deployment:**

✅ `railway.json` - Configurație Railway  
✅ `package.json` - Script-uri production  
✅ `web/src/lib/config.ts` - API URL dinamic  
✅ `.railwayignore` - Exclude fișiere test  
✅ `.gitignore` - Exclude `.env` și secrete

---

## 🧪 **TEST înainte de deployment:**

```bash
# Build production local:
cd D:\nexus\mnex-oracle
npm run build:web

# Test production mode:
NODE_ENV=production npm run start

# Verifică că merge pe localhost:8787
```

---

## 📋 **CHECKLIST pentru GO LIVE:**

### **Înainte de deploy:**
- [ ] Push code pe GitHub (private repo!)
- [ ] Verifică că `.env` NU e în Git
- [ ] Test local: `npm run build:web && npm run start`
- [ ] Verifică că toate API keys sunt valide

### **După deploy:**
- [ ] Setează environment variables pe Railway
- [ ] Verifică că site-ul merge
- [ ] Testează chat
- [ ] Testează image generation
- [ ] Verifică Telegram auto-posting
- [ ] Add custom domain (opțional)

---

## 🎯 **RECOMMENDATION FINALĂ:**

**Pentru tine:** Începe cu **Railway.app**

**De ce:**
1. **FREE** pentru început
2. **Simplu** - deploy în 5 minute
3. **Sigur** - environment variables criptate
4. **Scalabil** - upgrade când crești
5. **Auto-deploy** - push la Git = deploy automat

---

## 📝 **NEXT STEPS:**

### **1. Creează GitHub repo (private):**
```bash
cd D:\nexus\mnex-oracle
git init
git add .
git commit -m "Initial commit - MNEX Oracle"
# Create repo on github.com (PRIVATE!)
git remote add origin https://github.com/your-username/mnex-oracle.git
git push -u origin main
```

### **2. Deploy pe Railway:**
- https://railway.app/new
- Connect GitHub
- Select mnex-oracle repo
- Add environment variables
- Deploy! 🚀

### **3. Update Telegram bot pentru LIVE URL:**
După deployment, Railway îți dă URL (ex: `mnex-oracle.up.railway.app`)

---

**Vrei să continui cu Railway deployment acum?** 🚀

