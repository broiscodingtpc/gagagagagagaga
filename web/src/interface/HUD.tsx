/**
 * HUD - Minimal Holographic Status Display
 * Top-center system indicators, never obstructs the head
 */

import React from 'react';
import type { MnexControlState } from './useMnexControl';

interface HUDProps {
  control: MnexControlState;
  fps: number;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export function HUD({ control, fps, audioEnabled, onToggleAudio }: HUDProps) {
  const [latency, setLatency] = React.useState(0);

  React.useEffect(() => {
    // Simulate latency calculation (could be real API ping)
    const interval = setInterval(() => {
      setLatency(Math.floor(10 + Math.random() * 15));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mnex-hud">
      <div className="hud-main">
        <span className="hud-brand">MNEX</span>
        <span className="hud-separator">//</span>
        <span className="hud-label">Neural Interface</span>
      </div>
      
      <div className="hud-indicators">
        <div className="hud-indicator" title="Energy Level">
          <span className="hud-icon">◈</span>
          <span className="hud-value">{Math.floor(control.energy)}</span>
        </div>
        
        <div className="hud-indicator" title="Latency">
          <span className="hud-icon">⟨⟩</span>
          <span className="hud-value">{latency}ms</span>
        </div>
        
        <div className={`hud-indicator emotion-${control.emotion}`} title="Emotional State">
          <span className="hud-icon">◐</span>
          <span className="hud-value">{control.emotion.toUpperCase()}</span>
        </div>
        
        <div className="hud-indicator" title="Frame Rate">
          <span className="hud-icon">◉</span>
          <span className="hud-value">{Math.floor(fps)}</span>
        </div>

        <button
          className={`hud-button ${audioEnabled ? 'active' : ''}`}
          onClick={onToggleAudio}
          title="Toggle Audio Reactivity"
          aria-label="Toggle audio reactivity"
        >
          <span className="hud-icon">{audioEnabled ? '◉' : '○'}</span>
          <span className="hud-label-small">MIC</span>
        </button>
      </div>

      {control.speaking && (
        <div className="hud-status">
          <span className="hud-pulse"></span>
          <span>Transmitting</span>
        </div>
      )}

      {control.thinking && (
        <div className="hud-status">
          <span className="hud-pulse slow"></span>
          <span>Processing</span>
        </div>
      )}
    </div>
  );
}

