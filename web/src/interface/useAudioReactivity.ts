import { useState, useEffect, useRef } from 'react';

interface AudioData {
  amplitude: number;
  frequency: number;
}

export function useAudioReactivity(enabled: boolean = false): AudioData {
  const [audioData, setAudioData] = useState<AudioData>({
    amplitude: 0,
    frequency: 0
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const initAudio = async () => {
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        // Start analysis loop
        const analyze = () => {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // Calculate average amplitude
            const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
            const amplitude = sum / dataArrayRef.current.length / 255;

            // Calculate dominant frequency (simplified)
            const frequency = dataArrayRef.current[4] / 255; // Use lower frequency bands

            setAudioData({
              amplitude: Math.min(amplitude, 1.0),
              frequency: frequency
            });
          }

          animationFrameRef.current = requestAnimationFrame(analyze);
        };

        analyze();

      } catch (error) {
        console.warn('Audio reactivity unavailable:', error);
        setAudioData({ amplitude: 0, frequency: 0 });
      }
    };

    initAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  // Fallback animation when audio is disabled
  useEffect(() => {
    if (enabled) return;

    const interval = setInterval(() => {
      const time = Date.now() * 0.001;
      setAudioData({
        amplitude: 0.1 + (Math.sin(time * 2) * 0.05), // Subtle pulsing
        frequency: 0.3 + (Math.sin(time * 1.5) * 0.1)
      });
    }, 50);

    return () => clearInterval(interval);
  }, [enabled]);

  return audioData;
}
