import { useState, useEffect } from 'react';

interface MnexControlState {
  energy: number;
  speaking: boolean;
  thinking: boolean;
  emotion: 'calm' | 'alert' | 'intense';
}

export function useMnexControl() {
  const [state, setState] = useState<MnexControlState>({
    energy: 65,
    speaking: false,
    thinking: false,
    emotion: 'calm'
  });

  useEffect(() => {
    // Listen for mnexctl events
    const handleMnexControl = (event: CustomEvent) => {
      const { type, value } = event.detail;
      
      switch (type) {
        case 'energy':
          setState(prev => ({ ...prev, energy: Math.max(0, Math.min(100, value)) }));
          break;
        case 'speaking':
          setState(prev => ({ ...prev, speaking: value }));
          break;
        case 'thinking':
          setState(prev => ({ ...prev, thinking: value }));
          break;
        case 'emotion':
          setState(prev => ({ ...prev, emotion: value }));
          break;
      }
    };

    window.addEventListener('mnexctl', handleMnexControl as EventListener);
    
    return () => {
      window.removeEventListener('mnexctl', handleMnexControl as EventListener);
    };
  }, []);

  return { state };
}
