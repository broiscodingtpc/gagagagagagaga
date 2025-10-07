# 🚀 Deploy MNEX Oracle pe Railway.app (PAS CU PAS)

## ⏱️ Timp estimat: 10 minute

---

## 📋 **PAȘI DEPLOYMENT:**

### **PASUL 1: Pregătește Git Repository**

```bash
cd D:\nexus\mnex-oracle

# Inițializează Git
git init

# Adaugă toate fișierele (fără .env - e în .gitignore!)
git add .

# Commit
git commit -m "MNEX Oracle - Ready for deployment"
```

---

### **PASUL 2: Push pe GitHub (PRIVATE REPO!)**

#### **A. Creează repo pe GitHub:**
1. Mergi la: https://github.com/new
2. Repository name: `mnex-oracle`
3. **IMPORTANT:** Bifează **"Private"** ✅
4. NU adăuga README, .gitignore (le ai deja)
5. Click **"Create repository"**

#### **B. Push codul:**
```bash
# Adaugă remote (schimbă YOUR-USERNAME cu username-ul tău)
git remote add origin https://github.com/YOUR-USERNAME/mnex-oracle.git

# Push
git branch -M main
git push -u origin main
```

✅ **VERIFICĂ:** `.env` **NU** trebuie să apară pe GitHub!

---

### **PASUL 3: Deploy pe Railway**

#### **A. Creează cont Railway:**
1. Mergi la: https://railway.app/
2. Click **"Login"** → **"Login with GitHub"**
3. Autorizează Railway să acceseze GitHub

#### **B. Creează nou proiect:**
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Alege repository-ul: **`mnex-oracle`**
4. Railway va detecta automat Node.js project

#### **C. Configurează Environment Variables:**

Click pe proiect → Tab **"Variables"** → Click **"+ New Variable"**

Adaugă **TOATE** acestea (una câte una):

```env
GROQ_API_KEY
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

GROQ_MODEL
llama-3.3-70b-versatile

PORT
8787

MNEX_TELEGRAM_BOT_TOKEN
7899483407:AAGn_rW3Opflg6Po6sHxk_4xUSVuOzlPXzs

MNEX_TELEGRAM_CHANNEL_ID
@MorpheusNexusProject

SOLANA_RPC_URL
https://api.mainnet-beta.solana.com

PRESALE_WALLET
11111111111111111111111111111111

HUGGINGFACE_API_KEY
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

NODE_ENV
production
```

**IMPORTANT:** Copy-paste exact! Fără spații extra!

#### **D. Deploy:**

Railway va:
1. ✅ Clone repository-ul
2. ✅ Rula `npm install`
3. ✅ Build frontend-ul cu `npm run build:web`
4. ✅ Porni serverul cu `npm run start:prod`

**Durează ~2-3 minute**

#### **E. Obține URL-ul LIVE:**

După deployment:
- Click pe tab **"Settings"**
- Section **"Networking"**
- Click **"Generate Domain"**
- Vei primi: `mnex-oracle-production.up.railway.app`

---

### **PASUL 4: Configurează Frontend pentru Production**

Railway setează automat `PORT`, dar trebuie să configurezi API URL pentru frontend.

#### **În Railway:**
Add o variabilă nouă:
```env
VITE_API_URL
https://mnex-oracle-production.up.railway.app
```

(Schimbă cu URL-ul tău exact!)

#### **Redeploy:**
Railway va rebuild automat. Sau forțează:
- Tab "Deployments" → Click pe ultimul → "Redeploy"

---

## ✅ **VERIFICARE POST-DEPLOYMENT:**

### **1. Verifică că site-ul merge:**
```
https://mnex-oracle-production.up.railway.app
```

Ar trebui să vezi:
- Energy Orb violet
- Chat panel
- Code terminals

### **2. Testează chat:**
Scrie: `"Hello MNEX"`

Ar trebui să primești răspuns!

### **3. Testează image generation:**
Scrie: `"generate an image of purple galaxy"`

Verifică Telegram - imaginea ar trebui să apară!

### **4. Verifică Telegram auto-posting:**
Fiecare mesaj trimis pe website → Apare pe @MorpheusNexusProject

---

## 🔐 **SECURITATE - CHECKLIST:**

### **✅ Sigur (Environment Variables pe Railway):**
- ✅ GROQ_API_KEY
- ✅ TELEGRAM_BOT_TOKEN
- ✅ HUGGINGFACE_API_KEY

### **✅ Verifică că NU sunt în Git:**
```bash
# Local, verifică:
git log --all --full-history -- .env

# Ar trebui să fie gol! Dacă vezi .env în history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### **✅ GitHub Repo e PRIVATE:**
- Settings → Danger Zone → Verifică că e "Private"

---

## 💰 **COSTURI:**

### **Railway FREE Tier:**
```
✅ $5 credit/lună GRATUIT
✅ ~500 ore execution
✅ 512 MB RAM
✅ 1 GB disk
✅ Bandwidth: 100 GB/lună

Suficient pentru:
- 500-2000 requests/zi
- Chat nelimitat (limitat de Groq free tier)
- Image generation (limitat de HF free tier)
```

### **Dacă depășești FREE tier:**
- Railway: $5-20/lună (pay-as-you-go)
- SAU migrează pe alt hosting

---

## 🎯 **ALTERNATIVE DEPLOYMENT:**

### **Opțiunea 2: Vercel (pentru frontend only)**

Dacă vrei **DOAR frontend** pe Vercel și backend pe Railway:

```bash
# Frontend pe Vercel:
cd web
vercel deploy --prod

# În Vercel dashboard:
# Environment Variables → VITE_API_URL = https://your-railway-backend.up.railway.app
```

### **Opțiunea 3: Render.com**

Similar cu Railway:
1. https://render.com → New → Web Service
2. Connect GitHub repo
3. Build: `npm install && npm run build:web`
4. Start: `npm run start:prod`
5. Add environment variables

### **Opțiunea 4: VPS (DigitalOcean, Linode, Hetzner)**

Pentru control complet:
- $5-10/lună
- SSH access
- Setup manual: Nginx, PM2, SSL
- Mai complex dar mai mult control

---

## 📊 **Comparație Hosting:**

| Platform | FREE Tier | Dificultate | Best For |
|----------|-----------|-------------|----------|
| **Railway** | $5 credit | ⭐ Easy | Full-stack, rapid |
| **Vercel** | Unlimited | ⭐ Easy | Frontend only |
| **Render** | 750h/lună | ⭐⭐ Medium | Full-stack |
| **Fly.io** | Limitat | ⭐⭐⭐ Hard | Advanced users |
| **VPS** | $5/lună | ⭐⭐⭐⭐ Expert | Full control |

**Recomandare:** Începe cu **Railway** - cel mai simplu!

---

## 🐛 **TROUBLESHOOTING Deployment:**

### **Build fails:**
```
Error: Cannot find module...
```
→ Verifică că toate dependencies sunt în `package.json`

### **500 Error după deploy:**
```
MNEX link unstable
```
→ Verifică Environment Variables pe Railway  
→ Verifică logs: Railway dashboard → Deployments → View Logs

### **Frontend blank page:**
```
White screen, no orb
```
→ Build-ul frontend-ului a failat  
→ Check: `npm run build:web` local  
→ Fix erori și redeploy

### **Telegram nu postează:**
```
Messages not appearing
```
→ Verifică MNEX_TELEGRAM_CHANNEL_ID  
→ Verifică că bot-ul e admin în canal

---

## 📝 **POST-DEPLOYMENT:**

### **1. Custom Domain (opțional):**
Railway Settings → Networking → Custom Domain
```
mnex-oracle.com → points to Railway
```

### **2. SSL/HTTPS:**
✅ Railway oferă SSL **automat** și **gratuit**!

### **3. Monitoring:**
Railway dashboard → Metrics
- CPU usage
- Memory
- Request count

### **4. Logs:**
Railway dashboard → Deployments → Logs
- Vezi toate console.log din server
- Debug errors live

---

## 🔄 **AUTO-DEPLOY:**

După setup, **orice push la GitHub** → **auto-deploy pe Railway!**

```bash
# Faci modificări local
git add .
git commit -m "Updated persona"
git push

# Railway detectează push-ul
# → Rebuild automat
# → Deploy automat
# → Site-ul se actualizează în 2-3 minute!
```

---

## 🎉 **SUCCESS CHECKLIST:**

După deployment, verifică:
- [ ] Site-ul se încarcă: https://your-app.up.railway.app
- [ ] Energy Orb apare și e interactiv
- [ ] Chat-ul răspunde la mesaje
- [ ] Image generation funcționează
- [ ] Mesajele apar pe Telegram (@MorpheusNexusProject)
- [ ] Imaginile apar pe Telegram
- [ ] Mobile responsive merge
- [ ] Nu vezi erori în console (F12)

---

## 📱 **Share-uiește:**

După deploy, share:
```
🔮 MNEX Oracle is LIVE!

🌐 Website: https://your-app.up.railway.app
📱 Telegram: https://t.me/MorpheusNexusProject
🤖 Bot: @MorpheusNexusBOT

Chat with the AI oracle!
Generate purple mystical images!
Join the Mesh!
```

---

**Gata pentru deployment? Urmează pașii de mai sus! 🚀💜**

