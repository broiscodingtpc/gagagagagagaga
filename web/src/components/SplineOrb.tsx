/**
 * SplineOrb - Interactive 3D Animated Orb from Spline
 * Fully controlled by AI state with custom attributes
 */

import { useEffect, useRef, useState } from "react";

type Props = {
  energy?: number; // 0-1
  visible?: boolean;
  speaking?: boolean;
  thinking?: boolean;
  emotion?: 'calm' | 'alert' | 'intense';
  style?: React.CSSProperties;
};

interface SplineApplication {
  emitEvent: (eventType: string, eventName: string, ...args: any[]) => void;
  emitEventReverse: (eventType: string, eventName: string) => void;
  setVariable: (objectName: string, variableName: string, value: any) => void;
  setVariables: (variables: Record<string, any>) => void;
  setBackgroundColor: (color: string) => void;
  play: () => void;
  stop: () => void;
}

export default function SplineOrb({ 
  energy = 0.65,
  visible = true, 
  speaking = false,
  thinking = false,
  emotion = 'calm',
  style 
}: Props) {
  const viewerRef = useRef<any>(null);
  const [splineApp, setSplineApp] = useState<SplineApplication | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Spline script
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@splinetool/viewer@1.10.77/build/spline-viewer.js";
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize Spline app when viewer loads
  useEffect(() => {
    if (!viewerRef.current) return;

    const onLoad = (e: any) => {
      console.log('[Spline] Scene loaded!');
      setSplineApp(e.target.spline);
      setIsLoaded(true);
    };

    viewerRef.current.addEventListener('load', onLoad);

    return () => {
      if (viewerRef.current) {
        viewerRef.current.removeEventListener('load', onLoad);
      }
    };
  }, []);

  // Control orb based on AI state
  useEffect(() => {
    if (!splineApp || !isLoaded) return;

    try {
      // ENERGY CONTROL - Scale and glow intensity
      const scale = 0.8 + (energy * 0.4); // 0.8 to 1.2 scale
      const glowIntensity = energy;

      // EMOTION COLOR MAPPING - Deep purple theme
      let emotionColor = '#4c1d95'; // Default deep purple
      switch(emotion) {
        case 'calm':
          emotionColor = '#5b21b6'; // Deep purple
          break;
        case 'alert':
          emotionColor = '#7c3aed'; // Medium purple
          break;
        case 'intense':
          emotionColor = '#a855f7'; // Bright purple
          break;
      }

      // SPEAKING - Pulse animation
      if (speaking) {
        splineApp.emitEvent('mouseDown', 'Sphere'); // Trigger pulse
        console.log('[Spline] Speaking - pulse triggered');
      }

      // THINKING - Rotate faster
      if (thinking) {
        splineApp.emitEvent('mouseHover', 'Sphere'); // Trigger rotation
        console.log('[Spline] Thinking - rotation triggered');
      }

      // Set variables if supported
      console.log('[Spline] Setting variables:', { 
        energy, 
        emotion, 
        speaking, 
        thinking,
        scale,
        emotionColor
      });

      // Try to set custom variables (may not work if not defined in Spline)
      splineApp.setVariables?.({
        energy: energy * 100,
        scale: scale,
        color: emotionColor,
        glow: glowIntensity
      });

      // Try to access and modify the sphere directly for deep purple color
      try {
        const sphere = splineApp.findObjectByName?.('Sphere');
        if (sphere && sphere.material) {
          // Set deep purple color
          sphere.material.color?.setHex?.(parseInt(emotionColor.replace('#', '0x')));
          
          // Set emissive for glow
          if (sphere.material.emissive) {
            sphere.material.emissive.setHex?.(parseInt(emotionColor.replace('#', '0x')));
            sphere.material.emissiveIntensity = 0.5 + (energy * 0.5);
          }
        }
      } catch (err) {
        console.warn('[Spline] Could not access sphere directly:', err);
      }

    } catch (error) {
      console.warn('[Spline] Error setting variables:', error);
    }
  }, [splineApp, isLoaded, energy, speaking, thinking, emotion]);

  // Continuous pulse effect - breathing animation
  useEffect(() => {
    if (!splineApp || !isLoaded) return;

    let pulseInterval: any;
    
    // Pulse every 2 seconds for "alive" feel
    const startPulse = () => {
      pulseInterval = setInterval(() => {
        try {
          splineApp.emitEvent('mouseDown', 'Sphere');
          console.log('[Spline] Breathing pulse');
        } catch (err) {
          console.warn('[Spline] Pulse error:', err);
        }
      }, 2000); // Every 2 seconds
    };

    startPulse();

    return () => {
      if (pulseInterval) clearInterval(pulseInterval);
    };
  }, [splineApp, isLoaded]);

  // Listen to mnexctl events
  useEffect(() => {
    if (!splineApp || !isLoaded) return;

    const handleControl = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      
      if (detail.actions?.includes('pulse')) {
        splineApp.emitEvent('mouseDown', 'Sphere');
        console.log('[Spline] Manual pulse triggered');
      }
      
      if (detail.actions?.includes('glitch')) {
        // Trigger shake or glitch effect
        splineApp.emitEventReverse('mouseDown', 'Sphere');
        console.log('[Spline] Glitch effect triggered');
      }
    };

    window.addEventListener('mnexctl', handleControl);
    return () => window.removeEventListener('mnexctl', handleControl);
  }, [splineApp, isLoaded]);

  // Listen to AI response events
  useEffect(() => {
    if (!splineApp || !isLoaded) return;

    const handleResponse = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      
      if (detail.speaking) {
        splineApp.emitEvent('mouseDown', 'Sphere');
        console.log('[Spline] AI speaking - pulse');
      }
    };

    window.addEventListener('mnex-response', handleResponse);
    return () => window.removeEventListener('mnex-response', handleResponse);
  }, [splineApp, isLoaded]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "auto",
        ...style,
      }}
    >
      <spline-viewer 
        ref={viewerRef}
        url="https://prod.spline.design/6UFZXPV-2mbsPkuM/scene.splinecode"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          filter: "contrast(1.2) brightness(1.1) saturate(1.3)",
          background: "transparent"
        }}
      />
      
      {/* COMPLETELY HIDE Spline watermark */}
      <style>{`
        /* Hide all Spline branding elements */
        spline-viewer,
        spline-viewer * {
          position: relative;
        }
        
        /* Block bottom-right corner completely */
        spline-viewer::after {
          content: '';
          position: absolute !important;
          bottom: 0 !important;
          right: 0 !important;
          width: 250px !important;
          height: 80px !important;
          background: #07030b !important;
          pointer-events: none !important;
          z-index: 999999999 !important;
        }
        
        /* Hide any links, logos, watermarks */
        spline-viewer a,
        spline-viewer a *,
        spline-viewer .logo,
        spline-viewer .logo *,
        spline-viewer [class*="logo"],
        spline-viewer [class*="Logo"],
        spline-viewer [class*="watermark"],
        spline-viewer [class*="Watermark"],
        spline-viewer [class*="branding"],
        spline-viewer [class*="Branding"],
        spline-viewer [href*="spline"],
        spline-viewer [href*="Spline"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          left: -9999px !important;
        }
        
        /* Additional shadow DOM penetration */
        spline-viewer::part(logo),
        spline-viewer::part(watermark) {
          display: none !important;
        }
      `}</style>
      
      {/* Debug overlay */}
      {isLoaded && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
          opacity: 0.7
        }}>
          <div>🎮 Spline Loaded</div>
          <div>Energy: {Math.floor(energy * 100)}%</div>
          <div>Emotion: {emotion}</div>
          <div>Speaking: {speaking ? '🗣️' : '💤'}</div>
          <div>Thinking: {thinking ? '🧠' : '—'}</div>
        </div>
      )}
    </div>
  );
}

// TypeScript declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          url: string;
          ref?: React.Ref<any>;
        },
        HTMLElement
      >;
    }
  }
}

