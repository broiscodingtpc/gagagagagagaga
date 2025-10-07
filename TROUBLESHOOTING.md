# 🔧 TROUBLESHOOTING - Image Generation + Telegram

## ❌ Problema: Imaginile nu apar pe Telegram

### 🔍 Checklist rapid:

#### **1. Verifică că bot-ul e ADMIN în canal**

**IMPORTANT:** Asta e problema #1 în 90% din cazuri!

```
1. Deschide Telegram → @MorpheusNexusProject
2. Click pe numele canalului (sus)
3. "Administrators" → Verifică dacă @MorpheusNexusBOT e pe listă
4. Dacă NU → "Add Administrator"
5. Caută: @MorpheusNexusBOT
6. Bifează: ✅ Post messages
7. Save
```

#### **2. Verifică console-ul API server-ului**

Deschide fereastra PowerShell unde rulează `npx tsx server/index.ts`

Ar trebui să vezi:
```
[MNEX] Telegram notifications enabled for @MorpheusNexusProject
[MNEX] server online on :8787
[IMAGE-GEN] Generating: "..."
[IMAGE-GEN] Success! Size: 2345678 bytes
[MNEX] Image sent to Telegram!
```

Dacă vezi erori:
```
[MNEX] Telegram notification failed: ...
[MNEX] Image send failed: ...
```

→ Bot-ul NU e admin în canal!

#### **3. Testează manual bot-ul**

```
1. Deschide Telegram
2. Caută @MorpheusNexusBOT
3. Scrie: /start
4. Ar trebui să primești: "MNEX relay online..."
```

Dacă bot-ul NU răspunde → Token invalid sau bot offline

#### **4. Verifică .env**

Asigură-te că ai:
```env
MNEX_TELEGRAM_BOT_TOKEN=7899483407:AAGn_rW3Opflg6Po6sHxk_4xUSVuOzlPXzs
MNEX_TELEGRAM_CHANNEL_ID=@MorpheusNexusProject
```

#### **5. Testează doar Telegram (fără imagini)**

```
1. Deschide: http://localhost:5173
2. Scrie un mesaj normal: "Hello"
3. Verifică canalul Telegram
```

Dacă mesajul TEXT apare → Telegram funcționează!  
Dacă NU apare → Bot nu e admin sau token greșit

---

## 🎨 Problema specifică: Imagini

### **Erori posibile:**

#### **A) Hugging Face API e slow sau down**

Hugging Face FREE tier poate fi foarte slow în:
- Peak hours (US/EU daytime)
- Prima cerere (model loading)
- Traffic mare

**Fix:**  
Așteaptă 30-60 secunde, apoi verifică din nou Telegram

#### **B) Rate limit hit**

HF free tier poate avea limits temporary

**Fix:**  
Așteaptă 5 minute, încearcă din nou

#### **C) Image generation failează**

**Fix:**  
Adaugă Hugging Face API token pentru priority queue:

```
1. Mergi la: https://huggingface.co/settings/tokens
2. Creează token NOU (free)
3. Adaugă în .env:
   HUGGINGFACE_API_KEY=hf_xxxxxxxxxx
4. Restart API server
```

---

## 🧪 TEST COMPLET:

### **Test 1: Verifică servere**
```powershell
cd D:\nexus\mnex-oracle
netstat -ano | findstr ":8787 :5173"
```

Ar trebui să vezi ambele porturi LISTENING

### **Test 2: Testează API direct**
```powershell
node test-image-telegram.js
```

Ar trebui să vezi:
```
✅ API Response
🎨 Image generation started!
```

### **Test 3: Verifică Telegram bot**
```
Telegram → @MorpheusNexusBOT → /start
```

Ar trebui să răspundă instant

### **Test 4: Verifică canal permissions**
```
Telegram → @MorpheusNexusProject → Info → Administrators
```

Ar trebui să vezi @MorpheusNexusBOT în listă

---

## 🔥 FIX RAPID - PORNEȘTE TOT DE LA ZERO:

```powershell
# 1. Oprește tot
Get-Process -Name node,tsx -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Deschide 2 terminale PowerShell NOI

# Terminal 1 - API Server:
cd D:\nexus\mnex-oracle
npx tsx server/index.ts

# Terminal 2 - Telegram Bot:
cd D:\nexus\mnex-oracle  
npm run bot

# 3. Deschide browser:
http://localhost:5173

# 4. Testează:
Scrie: "generate an image of purple sphere"

# 5. Verifică Telegram:
https://t.me/MorpheusNexusProject
```

---

## 📝 DEBUG MODE:

Editează `server/image-gen.ts` și adaugă mai multe log-uri:

```typescript
export async function generateImage(prompt: string): Promise<Buffer | null> {
  try {
    console.log(`🎨 [IMAGE-GEN] START: "${prompt}"`);
    console.log(`🔗 [IMAGE-GEN] API URL: ${HF_API_URL}`);
    console.log(`🔑 [IMAGE-GEN] Has token: ${!!HF_TOKEN}`);
    
    // ... rest of code
    
    console.log(`✅ [IMAGE-GEN] Response status: ${response.status}`);
    console.log(`📦 [IMAGE-GEN] Buffer size: ${buffer.length} bytes`);
    
    return buffer;
  } catch (err) {
    console.error("❌ [IMAGE-GEN] FULL ERROR:", err);
    return null;
  }
}
```

Restart API server și vezi exact unde failează.

---

## 💡 SOLUȚII COMUNE:

### **Problemă: "Image send failed: 403 Forbidden"**
→ Bot-ul NU e admin în canal!

### **Problemă: "Image generation timeout"**
→ HF API e slow, așteaptă mai mult

### **Problemă: "Cannot find module 'node-fetch'"**
→ Run: `npm install node-fetch@2`

### **Problemă: "Telegram bot not responding"**
→ Token invalid sau bot-ul offline

### **Problemă: "No images appearing at all"**
→ Verifică că TOATE comenzile se rulează din `D:\nexus\mnex-oracle`

---

## 🆘 ULTIMUL RESORT:

Dacă nimic nu funcționează:

```powershell
# Reinstalează totul:
cd D:\nexus\mnex-oracle
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
npm run dev
```

---

**Cel mai probabil e simplu: bot-ul NU e admin în canal! 📱**

