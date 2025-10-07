# ✅ MNEX Oracle - Pre-Deployment Checklist

## 📋 **Înainte de a face deploy, verifică:**

---

### **🔐 SECURITATE:**

- [ ] `.env` e în `.gitignore` ✅
- [ ] Repository GitHub e **PRIVATE** ✅
- [ ] Nu sunt API keys hardcoded în cod ✅
- [ ] Toate secretele vor fi în Railway Environment Variables ✅

---

### **🧪 TESTING LOCAL:**

- [ ] Web server merge: http://localhost:5173 ✅
- [ ] API server merge: http://localhost:8787 ✅
- [ ] Chat răspunde corect ✅
- [ ] Image generation funcționează ✅
- [ ] Telegram posting funcționează ✅
- [ ] Bot-ul e admin în canal @MorpheusNexusProject ✅

---

### **📁 FIȘIERE NECESARE:**

- [ ] `package.json` are `start:prod` script ✅
- [ ] `railway.json` există ✅
- [ ] `.gitignore` exclude `.env` ✅
- [ ] `web/src/lib/config.ts` folosește `VITE_API_URL` ✅
- [ ] `Procfile` există (optional pentru Railway) ✅

---

### **🔑 API KEYS PREGĂTITE:**

- [ ] Groq API Key: `gsk_X8...` ✅
- [ ] Telegram Bot Token: `7899...` ✅
- [ ] Hugging Face Key: `hf_KHn...` ✅
- [ ] Telegram Channel ID: `@MorpheusNexusProject` ✅

---

### **🤖 TELEGRAM:**

- [ ] Bot creat: @MorpheusNexusBOT ✅
- [ ] Canal creat: @MorpheusNexusProject ✅
- [ ] Bot e ADMIN în canal ✅
- [ ] Bot are permisiune "Post messages" ✅

---

### **📊 GROQ API:**

- [ ] Account creat pe console.groq.com ✅
- [ ] API Key valid ✅
- [ ] Model testat: `llama-3.3-70b-versatile` ✅
- [ ] Rate limits cunoscute: 30 RPM, 12K TPM ✅

---

### **🎨 HUGGING FACE:**

- [ ] Account creat pe huggingface.co ✅
- [ ] Access Token generat ✅
- [ ] Image generation testat ✅
- [ ] Rate limits cunoscute: 1000 requests/hour ✅

---

### **⚙️ BUILD TEST:**

```bash
cd D:\nexus\mnex-oracle

# Test production build:
npm run build:web

# Ar trebui să creeze: web/dist/
# Verifică că există: web/dist/index.html

# Test production server:
NODE_ENV=production npm run start

# Verifică că servește frontend-ul corect
```

- [ ] Build-ul web merge fără erori ✅
- [ ] Server-ul pornește în production mode ✅

---

## 🚀 **GATA PENTRU DEPLOY!**

Toate checkmark-urile bifate? Perfect! 🎉

---

## 📝 **NEXT STEPS:**

### **Deployment rapid (Railway):**
Citește și urmează: `DEPLOY_NOW.md`

### **Deployment detaliat:**
Citește: `DEPLOY_RAILWAY.md`

### **Alternative platforme:**
Citește: `DEPLOYMENT_GUIDE.md`

---

## 💡 **Tips înainte de deploy:**

### **1. Testează production mode local:**
```bash
# Build frontend
npm run build:web

# Start in production mode
set NODE_ENV=production
npm run start

# Test: http://localhost:8787
```

### **2. Verifică că .env nu e în Git:**
```bash
git status

# Nu ar trebui să vezi .env în lista de fișiere!
```

### **3. Verifică environment variables:**
```bash
# Toate keys-urile sunt setate în .env?
cat .env

# NU posta output-ul public!
```

---

## ⚠️ **IMPORTANT:**

### **NU deploy-ui dacă:**
- ❌ `.env` e în Git history
- ❌ API keys sunt hardcoded în cod
- ❌ Repository e PUBLIC cu secrete
- ❌ Local testing nu merge

### **✅ SIGUR să deploy-uiești dacă:**
- ✅ Repository e PRIVATE
- ✅ `.env` în `.gitignore`
- ✅ Toate API keys valide
- ✅ Local testing 100% functional

---

**Totul verificat? Start deployment acum! 🚀**

Urmează: `DEPLOY_NOW.md`

