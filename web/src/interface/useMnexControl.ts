/**
 * React Hook for MNEX Control System
 * Listens to AI reply lifecycle and custom control events
 */

import { useState, useEffect, useCallback } from 'react';

export interface MnexControlState {
  energy: number; // 0-100
  pulse: number; // 0-1
  flare: number; // 0-1
  glitch: number; // 0-1
  emotion: 'calm' | 'alert' | 'intense';
  speaking: boolean;
  thinking: boolean;
  actions: string[];
}

export interface MnexReactionEvent {
  energy?: number;
  sentiment?: number;
  intensity?: number;
  speaking?: boolean;
}

const EASE_FACTOR = 0.15;

export function useMnexControl() {
  const [state, setState] = useState<MnexControlState>({
    energy: 65,
    pulse: 0,
    flare: 0,
    glitch: 0,
    emotion: 'calm',
    speaking: false,
    thinking: false,
    actions: []
  });

  const [targetEnergy, setTargetEnergy] = useState(65);

  // Smooth energy transitions
  useEffect(() => {
    let raf = 0;
    const animate = () => {
      setState(prev => {
        const diff = targetEnergy - prev.energy;
        if (Math.abs(diff) < 0.1) return prev;
        
        return {
          ...prev,
          energy: prev.energy + diff * EASE_FACTOR
        };
      });
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [targetEnergy]);

  // Decay pulse/flare/glitch over time
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        pulse: Math.max(0, prev.pulse - 0.05),
        flare: Math.max(0, prev.flare - 0.08),
        glitch: Math.max(0, prev.glitch - 0.1)
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Listen for AI reaction events (from ChatPanel)
  useEffect(() => {
    const handleReaction = (event: Event) => {
      const detail = (event as CustomEvent<MnexReactionEvent>).detail;
      
      if (detail.energy !== undefined) {
        setTargetEnergy(detail.energy);
      }
      
      if (detail.speaking !== undefined) {
        setState(prev => ({ ...prev, speaking: detail.speaking! }));
      }

      if (detail.intensity !== undefined) {
        const intensity = detail.intensity / 100;
        setState(prev => ({
          ...prev,
          pulse: Math.min(1, prev.pulse + intensity * 0.3),
          flare: intensity > 0.6 ? Math.min(1, prev.flare + 0.4) : prev.flare
        }));
      }

      // Map sentiment to emotion
      if (detail.sentiment !== undefined) {
        let emotion: 'calm' | 'alert' | 'intense' = 'calm';
        if (Math.abs(detail.sentiment) > 0.3) {
          emotion = 'intense';
        } else if (Math.abs(detail.sentiment) > 0.1) {
          emotion = 'alert';
        }
        setState(prev => ({ ...prev, emotion }));
      }
    };

    window.addEventListener('mnex-response', handleReaction);
    return () => window.removeEventListener('mnex-response', handleReaction);
  }, []);

  // Listen for thinking state changes
  useEffect(() => {
    const handleThinking = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setState(prev => ({ ...prev, thinking: Boolean(detail) }));
    };

    window.addEventListener('mnex-thinking', handleThinking);
    return () => window.removeEventListener('mnex-thinking', handleThinking);
  }, []);

  // Listen for custom control packets (for testing/advanced use)
  useEffect(() => {
    const handleControl = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      
      if (detail.energy !== undefined) {
        setTargetEnergy(Math.min(100, Math.max(0, detail.energy)));
      }
      
      if (detail.actions && Array.isArray(detail.actions)) {
        detail.actions.forEach((action: string) => {
          switch (action) {
            case 'pulse':
              setState(prev => ({ ...prev, pulse: 1 }));
              break;
            case 'flare':
              setState(prev => ({ ...prev, flare: 1 }));
              break;
            case 'glitch':
              setState(prev => ({ ...prev, glitch: 1 }));
              break;
          }
        });
        
        setState(prev => ({ ...prev, actions: detail.actions }));
      }
    };

    window.addEventListener('mnexctl', handleControl);
    return () => window.removeEventListener('mnexctl', handleControl);
  }, []);

  // Trigger pulse action
  const triggerPulse = useCallback(() => {
    setState(prev => ({ ...prev, pulse: 1 }));
  }, []);

  // Trigger flare action
  const triggerFlare = useCallback(() => {
    setState(prev => ({ ...prev, flare: 1 }));
  }, []);

  // Trigger glitch action
  const triggerGlitch = useCallback(() => {
    setState(prev => ({ ...prev, glitch: 1 }));
  }, []);

  // Set thinking state
  const setThinking = useCallback((thinking: boolean) => {
    setState(prev => ({ ...prev, thinking }));
  }, []);

  return {
    state,
    triggerPulse,
    triggerFlare,
    triggerGlitch,
    setThinking
  };
}

