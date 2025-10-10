# Spline Orb - Interactive Control Guide

## 🎮 Control Complet AI al Orb-ului Spline

Orb-ul Spline este acum **complet controlat de starea AI** și reacționează în timp real!

---

## ✨ Atribute Controlate

### 1. **Energy (0-1)**
- **Scop**: Intensitatea generală, scale, glow
- **Efect**: 
  - Scale: 0.8 → 1.2 (crește/scade dimensiunea)
  - Glow intensity: 0 → 1 (luminozitate)
  - Variabilă Spline: `energy` (0-100)

### 2. **Emotion (calm/alert/intense)**
- **Scop**: Culoare și mood
- **Culori**:
  - `calm` → `#6366f1` (Blue-purple soft)
  - `alert` → `#d946ef` (Magenta vibrant)
  - `intense` → `#ec4899` (Hot pink)
- **Variabilă Spline**: `color`

### 3. **Speaking (boolean)**
- **Scop**: Animație când AI vorbește
- **Efect**: Trigger `mouseDown` pe Sphere → Pulsează
- **Trigger**: `mnex-response` event cu `speaking: true`

### 4. **Thinking (boolean)**
- **Scop**: Animație când AI procesează
- **Efect**: Trigger `mouseHover` pe Sphere → Rotație mai rapidă
- **Trigger**: `mnex-thinking` event

### 5. **Visible (boolean)**
- **Scop**: Show/hide orb
- **Efect**: Montează/demontează componenta

---

## 🎯 Cum Funcționează

### Flow-ul de Date:

```
ChatPanel → Events → useMnexControl → controlState → SplineOrb → Spline API
```

### Event Listeners:

1. **`mnex-response`** (din ChatPanel)
   ```javascript
   {
     energy: 70,
     sentiment: 0.3,
     intensity: 60,
     speaking: true
   }
   ```
   → Orb pulsează și își schimbă culoarea

2. **`mnex-thinking`** (din ChatPanel)
   ```javascript
   { thinking: true }
   ```
   → Orb rotește mai rapid

3. **`mnexctl`** (manual testing)
   ```javascript
   {
     actions: ['pulse'],  // Trigger pulse
     energy: 90           // Set energy
   }
   ```
   → Control direct pentru testing

---

## 🛠️ Spline API Methods Used

### `splineApp.emitEvent(type, name, ...args)`
- **`mouseDown`** pe Sphere → Trigger pulse animation
- **`mouseHover`** pe Sphere → Trigger rotation

### `splineApp.setVariables(vars)`
- Set multiple variables at once:
  ```javascript
  {
    energy: 75,      // 0-100
    scale: 1.1,      // 0.8-1.2
    color: '#d946ef', // Hex color
    glow: 0.8        // 0-1
  }
  ```

### `splineApp.emitEventReverse(type, name)`
- Reverse animation (pentru glitch effect)

---

## 🧪 Testare Manuală

### Din Console Browser:

```javascript
// Test 1: Pulsează orb-ul
window.dispatchEvent(new CustomEvent('mnexctl', {
  detail: { actions: ['pulse'] }
}));

// Test 2: Crește energia
window.dispatchEvent(new CustomEvent('mnexctl', {
  detail: { energy: 95 }
}));

// Test 3: Simulează AI vorbind
window.dispatchEvent(new CustomEvent('mnex-response', {
  detail: {
    energy: 85,
    sentiment: 0.5,
    intensity: 80,
    speaking: true
  }
}));

// Test 4: Simulează AI gândind
window.dispatchEvent(new CustomEvent('mnex-thinking', {
  detail: true
}));

// Test 5: Glitch effect
window.dispatchEvent(new CustomEvent('mnexctl', {
  detail: { actions: ['glitch'] }
}));
```

---

## 📊 Debug Overlay

În stânga sus vei vedea un overlay cu:
- ✅ **Spline Loaded** - confirmare că scena s-a încărcat
- **Energy**: 0-100%
- **Emotion**: calm/alert/intense
- **Speaking**: 🗣️ sau 💤
- **Thinking**: 🧠 sau —

---

## 🎨 Customizare în Spline Editor

Pentru a face orb-ul **și mai controlabil**, poți:

### 1. Adaugă Variables în Spline:
- `energy` (Number, 0-100)
- `scale` (Number, 0.5-2.0)
- `color` (Color)
- `glow` (Number, 0-1)

### 2. Link Variables la Properties:
- **Scale** → Link la Transform Scale
- **Color** → Link la Material Color
- **Glow** → Link la Emission Intensity

### 3. Events Custom:
- Definește `onPulse` event care face orb-ul să pulseze
- Definește `onThink` event care face orb-ul să rotească

---

## 🚀 Integration Flow

### Când User Trimite Mesaj:

1. User scrie în chat
2. `ChatPanel` emit `mnex-thinking: true`
3. **Spline Orb** → rotește mai rapid
4. Backend procesează
5. `ChatPanel` emit `mnex-response` cu data
6. **Spline Orb** → pulsează + schimbă culoare
7. După răspuns → `speaking: false`
8. **Spline Orb** → revine la idle

---

## 📝 Props Disponibile

```typescript
<SplineOrb
  energy={0.75}              // 0-1 (intensitate)
  visible={true}             // show/hide
  speaking={false}           // pulsează când true
  thinking={false}           // rotește când true
  emotion="alert"            // 'calm' | 'alert' | 'intense'
  style={{...}}              // CSS override
/>
```

---

## 🔧 Advanced: Object-Specific Control

Dacă vrei să controlezi obiecte specifice din scenă:

```javascript
// Găsește obiect după nume
const sphere = splineApp.findObjectByName('Sphere');

// Schimbă proprietăți direct
sphere.scale.set(1.5, 1.5, 1.5);
sphere.material.color.set('#ff00ff');
sphere.material.emissiveIntensity = 2.0;

// Rotire
sphere.rotation.y += 0.01;

// Poziție
sphere.position.y = Math.sin(time) * 0.5;
```

---

## 🎬 Live Control Examples

### AI Răspunde Calm:
```javascript
{
  energy: 60,
  emotion: 'calm',
  speaking: true
}
→ Orb: albastru-purple, puls soft
```

### AI Răspunde Alert:
```javascript
{
  energy: 75,
  emotion: 'alert',
  speaking: true
}
→ Orb: magenta, puls mediu
```

### AI Răspunde Intens:
```javascript
{
  energy: 95,
  emotion: 'intense',
  speaking: true
}
→ Orb: hot pink, puls puternic
```

---

## ✅ Features Implementate

- [x] Load Spline scene
- [x] Access Spline API
- [x] Control prin props React
- [x] Energy mapping (scale + glow)
- [x] Emotion color mapping
- [x] Speaking trigger (pulse)
- [x] Thinking trigger (rotation)
- [x] Manual control via `mnexctl`
- [x] AI response integration
- [x] Debug overlay
- [x] Event listeners (mnex-response, mnex-thinking)

---

## 🚀 Next Level: Custom Spline Scene

Pentru control **maxim**, creează propriul tău Spline scene cu:

1. **Variables expuse**:
   - `energy`, `scale`, `color`, `glow`, `rotation_speed`, etc.

2. **Events custom**:
   - `onPulse`, `onGlitch`, `onCalm`, `onAlert`, `onIntense`

3. **Animații pregătite**:
   - Idle loop
   - Pulse animation
   - Think animation
   - Speak animation
   - Glitch effect

4. **Exportă** scene-ul și înlocuiește URL-ul în `SplineOrb.tsx`

---

**REFRESH BROWSER-UL ȘI VEZI ORBU CONTROLAT DE AI! 🎮✨**

Toate stările AI acum controlează orb-ul în timp real!

