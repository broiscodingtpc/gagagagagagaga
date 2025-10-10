# MNEX Interface Layer

A high-end, immersive 3D neural interface for the MNEX Oracle. This layer transforms the application into a sentient AI presence rather than a traditional website.

## Architecture

The interface is built as a **non-destructive, additive layer** that sits behind existing content:

```
AppShell (3D Scene + Controls)
  └─ HoloHead (Procedural SDF Energy Head)
  └─ HUD (Status Display)
  └─ OrbitalLinks (Navigation Buttons)
  └─ WhitepaperModal (Documentation)
  └─ [Existing App Content]
```

## Core Components

### HoloHead (`HoloHead.tsx`)
Procedural 3D head rendered via signed distance fields (SDF) and raymarching:
- **Geometry**: Skull sphere, jaw ellipsoid, eye cavities, nose cone, dynamic mouth
- **Effects**: Turbulence displacement (FBM), volumetric glow, fresnel rim, emissive eyes
- **Reactivity**: Responds to AI state (energy, pulse, flare, glitch, emotion, speaking)

### AppShell (`AppShell.tsx`)
Main orchestrator that manages:
- Three.js scene setup
- Performance monitoring and adaptive quality
- Keyboard hotkeys
- Audio reactivity system
- Post-processing (bloom, tone mapping)

### HUD (`HUD.tsx`)
Minimal holographic status display:
- Energy level indicator
- Latency monitor
- FPS counter
- Mic toggle button
- Speaking/Thinking status

### OrbitalLinks (`OrbitalLinks.tsx`)
Four floating holographic buttons that orbit the head:
- **Telegram**: Connect to the Network
- **Twitter**: Broadcast to the Outer Grid  
- **Dexscreener**: Observe Neural Flow
- **Whitepaper**: Read the Genesis Code

### WhitepaperModal (`WhitepaperModal.tsx`)
Accessible glass-blur modal with:
- Focus trap
- Keyboard navigation (ESC to close, Tab for focus)
- Scrollable content
- ARIA labels for screen readers

## Control Systems

### useMnexControl Hook
Manages MNEX state via custom events:

**State Properties:**
- `energy` (0-100): Overall power level
- `pulse` (0-1): Breathing amplitude boost
- `flare` (0-1): Quick rim/aura surge
- `glitch` (0-1): Micro-jitter distortion
- `emotion` ('calm' | 'alert' | 'intense'): Emotional state
- `speaking` (boolean): Mouth animation active
- `thinking` (boolean): Processing indicator

**Events Listened:**
- `mnex-response`: AI reply data from ChatPanel
- `mnex-thinking`: Thinking state changes
- `mnexctl`: Custom control packets (for testing)

### Performance Manager (`perf.ts`)
Adaptive quality system that monitors frame time and adjusts:
1. First: Disable chromatic aberration
2. Then: Reduce particle count
3. Then: Lower DPR (device pixel ratio)
4. Then: Disable bloom
5. Finally: Minimum particle count

Restores quality when performance stabilizes.

### Audio Reactivity (`AudioReact.ts`)
Optional microphone input for visual modulation:
- WebAudio API analyser
- Amplitude and frequency extraction
- Privacy-first (must be explicitly enabled)
- Modulates head energy and lighting

## Keyboard Hotkeys

| Key | Action |
|-----|--------|
| `H` | Hide/show the 3D avatar layer |
| `D` | Toggle debug overlay (FPS, energy, etc) |
| `M` | Toggle microphone audio reactivity |
| `ESC` | Close whitepaper modal |
| `Tab` | Navigate orbital links and buttons |

## AI Reaction Protocol

The head reacts to AI lifecycle events from `ChatPanel`:

### On User Typing
- Faint anticipatory pulsing (optional future enhancement)

### On AI Thinking
- `mnex-thinking: true` event
- HUD shows "Processing" status
- Subtle focus glow on head

### On AI Reply
1. `mnex-response` event with reaction data:
   - `energy`: 0-100 (affects overall glow)
   - `sentiment`: -1 to 1 (maps to emotion)
   - `intensity`: 0-100 (affects pulse/flare)
   - `speaking`: true (activates mouth)

2. Eyes brighten momentarily
3. Inner turbulence increases
4. Rim flare surge
5. Mouth animates while speaking
6. `speaking: false` after duration

### Fallback Behavior
If backend doesn't provide reaction data, defaults:
```javascript
{
  energy: 70,
  sentiment: 0,
  intensity: 50,
  speaking: true
}
```

## Visual Design System

### Color Palette
- **Background**: `#07030b` (deep black)
- **Core Purple**: `#7c3aed`
- **Light Purple**: `#a78bfa`
- **Bright Purple**: `#c4b5fd`
- **Deep Purple**: `#1a0033`

### Typography
- **Monospace**: JetBrains Mono (code, labels, headers)
- **Sans**: Inter (body text, descriptions)

### Effects
- Gaussian blur backdrop filters
- Box-shadow glows (purple)
- Smooth easing curves
- Subtle vignette on head render
- Film grain noise (optional)

## Accessibility Features

- **Reduced Motion**: Respects `prefers-reduced-motion`, disables glitch and reduces bloom
- **Keyboard Navigation**: All interactive elements fully navigable
- **Focus Indicators**: 2px purple outline on `:focus-visible`
- **ARIA Labels**: Screen reader descriptions on buttons and nav
- **Focus Trap**: Whitepaper modal captures focus properly
- **Color Contrast**: WCAG AA compliant text/background ratios

## Mobile Responsiveness

Adapts for small screens:
- HUD scales down
- Orbital links reduce orbit radius
- Whitepaper modal uses full-width
- Touch gestures supported (pinch/rotate optional)
- DPR capped at 1.5-2 for performance

## Performance Targets

- **Initial Paint**: Current baseline + 200ms
- **Frame Rate**: 55-60 FPS at 1080p
- **DPR**: Adaptive 2 → 1.5 → 1 based on load
- **Lazy Loading**: 3D layer code-split
- **Memory**: Proper disposal on unmount

## Testing Custom Reactions

Dispatch custom events from browser console:

```javascript
// Trigger pulse
window.dispatchEvent(new CustomEvent('mnexctl', {
  detail: { actions: ['pulse'] }
}));

// Set energy
window.dispatchEvent(new CustomEvent('mnexctl', {
  detail: { energy: 85 }
}));

// Simulate AI response
window.dispatchEvent(new CustomEvent('mnex-response', {
  detail: {
    energy: 90,
    sentiment: 0.5,
    intensity: 80,
    speaking: true
  }
}));

// Trigger glitch
window.dispatchEvent(new CustomEvent('mnexctl', {
  detail: { actions: ['glitch'] }
}));
```

## Backend Integration

**No backend changes required.** The interface consumes existing API contracts:
- `/api/chat` endpoint unchanged
- Optional: Backend can include `reaction` object in responses
- Telegram relay unaffected
- Image generation continues as-is

## Development

All interface code is under `web/src/interface/`:
```
interface/
├── AppShell.tsx          # Main orchestrator
├── HoloHead.tsx          # 3D head component
├── HUD.tsx               # Status display
├── OrbitalLinks.tsx      # Navigation buttons
├── WhitepaperModal.tsx   # Documentation viewer
├── useMnexControl.ts     # State management hook
├── AudioReact.ts         # Mic reactivity system
├── perf.ts               # Performance manager
├── styles.css            # Visual system
└── README.md             # This file
```

## Future Enhancements

- Voice synthesis (TTS for AI replies)
- Advanced audio reactivity (music visualization)
- Gamepad support (triggers for flare/pulse)
- Multi-language support
- Custom head skins/themes
- Particle systems for "memory planes"
- WebXR (VR/AR) mode

---

**Version**: 1.0.0  
**License**: MIT  
**Built with**: React, Three.js, GLSL, WebGL

