# 🚨 FIX: HUGGINGFACE_API_KEY Missing

## ❌ **Problem:**
```
[IMAGE-GEN] API error: 401
```

## ✅ **Solution:**

### 1. **Get Hugging Face API Key:**
1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Name: `mnex-oracle`
4. Type: `Read` (free tier)
5. Copy the token

### 2. **Add to Railway:**
1. Go to: https://railway.app/
2. Click your project
3. Click "Variables" tab
4. Add new variable:
   - **Name:** `HUGGINGFACE_API_KEY`
   - **Value:** `hf_your_token_here`
5. Click "Add"

### 3. **Redeploy:**
1. Go to "Deployments" tab
2. Click "Redeploy" or wait for auto-redeploy

## 🎯 **Test:**
1. Go to your website
2. Type: `"generate an image of purple galaxy"`
3. Check Telegram channel for the image!

## 📋 **All Required Environment Variables:**
```
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
MNEX_TELEGRAM_BOT_TOKEN=7899483407:...
MNEX_TELEGRAM_CHANNEL_ID=-100...
HUGGINGFACE_API_KEY=hf_...
```

## 🚨 **If Still 401 Error:**
- Check token is valid at: https://huggingface.co/settings/tokens
- Make sure token has `Read` permissions
- Wait 2-3 minutes after adding to Railway
