# 🔑 Cum obții Hugging Face API Key (GRATUIT)

## ⚠️ NECESAR pentru Image Generation!

Hugging Face a schimbat politica - acum **TOATE modelele de imagini cer API key**.

**Vestea bună:** E **100% GRATUIT** și durează 2 minute! 🎉

---

## 📋 PAȘI SIMPLI:

### **1. Creează cont (dacă nu ai):**
- Mergi la: https://huggingface.co/join
- Email + parolă
- Confirm email

### **2. Obține API Token:**
- Mergi la: https://huggingface.co/settings/tokens
- Sau: Settings → Access Tokens

### **3. Creează token nou:**
- Click: **"New token"**
- Name: `MNEX Image Generation`
- Type: **Read** (e suficient pentru inference)
- Click: **"Generate"**

### **4. Copiază token-ul:**
```
hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **5. Adaugă în `.env`:**
Deschide fișierul `.env` și adaugă:
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **6. Restart API server:**
- Închide fereastra PowerShell a API server-ului
- Deschide PowerShell nou:
```powershell
cd D:\nexus\mnex-oracle
npx tsx server/index.ts
```

---

## 🧪 TESTEAZĂ:

```powershell
cd D:\nexus\mnex-oracle
node test-sdxl.js
```

Ar trebui să vezi:
```
✅ Image generated! Size: 234.56 KB
✅ Image sent to Telegram!
🎉 SUCCESS!
```

---

## ✅ CE PRIMEȘTI:

- ✅ **GRATUIT** forever
- ✅ **Unlimited** requests (cu rate limiting rezonabil)
- ✅ **Priority queue** (generare mai rapidă)
- ✅ **Access la TOATE modelele** HF

---

## 📊 Rate Limits (FREE tier):

- **1000 requests/hour**
- **10,000 requests/day**

Mai mult decât suficient pentru testing! 🚀

---

## 💡 Alternative (dacă nu vrei HF API key):

### **Opțiunea 1: Folosește AI local (slow):**
- Instalează Automatic1111 sau ComfyUI
- Rulează pe GPU local
- API gratuită dar consumă resurse

### **Opțiunea 2: Alt serviciu:**
- Replicate.com (plătit dar ieftin)
- Stability AI (plătit)
- Leonardo.ai (limitat free tier)

---

**Recomandare:** Ia HF API key, e cel mai simplu și 100% gratuit! 🎨

