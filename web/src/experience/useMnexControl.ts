import { useState, useEffect } from 'react';

interface MnexControlEvent {
  energy?: number;
  actions?: string[];
  figures?: string[];
}

interface MnexControlState {
  energy: number;
  pulse: boolean;
  flare: boolean;
  glitch: boolean;
}

export function useMnexControl(): MnexControlState {
  const [state, setState] = useState<MnexControlState>({
    energy: 0.65, // calm idle state
    pulse: false,
    flare: false,
    glitch: false
  });

  useEffect(() => {
    const handleMnexControl = (event: CustomEvent<MnexControlEvent>) => {
      const { energy, actions = [] } = event.detail;
      
      setState(prev => {
        const newState = { ...prev };
        
        // Update energy if provided
        if (typeof energy === 'number') {
          newState.energy = Math.max(0, Math.min(1, energy / 100));
        }
        
        // Update action flags
        newState.pulse = actions.includes('pulse');
        newState.flare = actions.includes('flare');
        newState.glitch = actions.includes('glitch');
        
        return newState;
      });
    };

    // Listen for mnexctl events
    window.addEventListener('mnexctl', handleMnexControl as EventListener);
    
    return () => {
      window.removeEventListener('mnexctl', handleMnexControl as EventListener);
    };
  }, []);

  return state;
}
