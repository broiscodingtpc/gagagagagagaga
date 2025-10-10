import { useState, useEffect, useCallback } from 'react';

interface ReactionData {
  energy: number;
  sentiment: number;
  intensity: number;
  speaking: boolean;
}

export function useMnexReactions(): ReactionData {
  const [reactionData, setReactionData] = useState<ReactionData>({
    energy: 0.5,
    sentiment: 0.0,
    intensity: 0.5,
    speaking: false
  });

  const updateReactions = useCallback((newData: Partial<ReactionData>) => {
    setReactionData(prev => ({
      ...prev,
      ...newData,
      // Smooth transitions
      energy: THREE.MathUtils.lerp(prev.energy, newData.energy ?? prev.energy, 0.1),
      sentiment: THREE.MathUtils.lerp(prev.sentiment, newData.sentiment ?? prev.sentiment, 0.1),
      intensity: THREE.MathUtils.lerp(prev.intensity, newData.intensity ?? prev.intensity, 0.1)
    }));
  }, []);

  // Listen for AI response events
  useEffect(() => {
    const handleAIResponse = (event: CustomEvent) => {
      const { text, energy, sentiment, intensity, speaking } = event.detail;

      if (energy !== undefined) {
        updateReactions({
          energy: Math.max(0, Math.min(1, energy / 100)),
          sentiment: sentiment ? sentiment : 0,
          intensity: intensity ? intensity / 100 : 0.5,
          speaking: speaking || false
        });
      }
    };

    // Listen for mnex-response events
    window.addEventListener('mnex-response', handleAIResponse as EventListener);

    return () => {
      window.removeEventListener('mnex-response', handleAIResponse as EventListener);
    };
  }, [updateReactions]);

  // Idle animation when no responses
  useEffect(() => {
    const interval = setInterval(() => {
      setReactionData(prev => ({
        ...prev,
        energy: 0.3 + (Math.sin(Date.now() * 0.001) * 0.2), // Subtle breathing
        speaking: false
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return reactionData;
}
