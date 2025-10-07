# 🤖 Cum obții Channel ID pentru Telegram

## Opțiunea 1: Folosind un Bot

1. **Adaugă bot-ul tău ca ADMIN în canal:**
   - Mergi la https://t.me/MorpheusNexusProject
   - Click "Edit Channel" → "Administrators"
   - Add `@MorpheusNexusBOT` ca administrator

2. **Trimite un mesaj în canal** (orice mesaj)

3. **Folosește API-ul Telegram pentru a vedea ID-ul:**
   ```
   https://api.telegram.org/bot7899483407:AAGn_rW3Opflg6Po6sHxk_4xUSVuOzlPXzs/getUpdates
   ```

4. **Caută în JSON pentru "chat":{"id":-100XXXXXXXXX}**
   - ID-ul va începe cu `-100`

## Opțiunea 2: Folosind @userinfobot

1. **Forward un mesaj** din canalul tău către `@userinfobot`
2. Bot-ul îți va arăta Channel ID

## Opțiunea 3: Manual din URL

Dacă URL-ul canalului este: `https://t.me/MorpheusNexusProject`

Încearcă ID-ul: `@MorpheusNexusProject` (cu @)

---

## După ce ai ID-ul:

Adaugă în `.env`:
```
MNEX_TELEGRAM_CHANNEL_ID=-100XXXXXXXXX
```
sau
```
MNEX_TELEGRAM_CHANNEL_ID=@MorpheusNexusProject
```

## 📌 IMPORTANT:

Bot-ul **TREBUIE** să fie **ADMIN** în canal pentru a posta!

