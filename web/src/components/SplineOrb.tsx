import React, { useRef, useEffect } from 'react';

interface Props {
  energy?: number;
  visible?: boolean;
  speaking?: boolean;
  thinking?: boolean;
  emotion?: 'calm' | 'alert' | 'intense';
  learning?: boolean;
  style?: React.CSSProperties;
}

export default function SplineOrb({ 
  energy = 0.65,
  visible = true, 
  speaking = false,
  thinking = false,
  emotion = 'calm',
  learning = false,
  style 
}: Props) {
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    // Load Spline script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@splinetool/viewer@0.9.0/build/spline-viewer.js';
    script.type = 'module';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (viewerRef.current && visible) {
      // Set AI state
      const viewer = viewerRef.current;
      
      // Energy control
      viewer.setAttribute('energy', energy.toString());
      
      // Speaking state
      if (speaking) {
        viewer.setAttribute('speaking', 'true');
      } else {
        viewer.removeAttribute('speaking');
      }
      
      // Thinking state
      if (thinking) {
        viewer.setAttribute('thinking', 'true');
      } else {
        viewer.removeAttribute('thinking');
      }
      
      // Emotion state
      viewer.setAttribute('emotion', emotion);
      
      // Learning state
      if (learning) {
        viewer.setAttribute('learning', 'true');
      } else {
        viewer.removeAttribute('learning');
      }
    }
  }, [energy, visible, speaking, thinking, emotion, learning]);

  useEffect(() => {
    // Continuous pulse effect
    const interval = setInterval(() => {
      if (viewerRef.current && visible) {
        const viewer = viewerRef.current;
        viewer.setAttribute('pulse', 'true');
        setTimeout(() => {
          viewer.removeAttribute('pulse');
        }, 1000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    // Listen for mnexctl events
    const handleMnexControl = (event: CustomEvent) => {
      const { type, value } = event.detail;
      
      if (viewerRef.current) {
        const viewer = viewerRef.current;
        
        switch (type) {
          case 'energy':
            viewer.setAttribute('energy', (value / 100).toString());
            break;
          case 'speaking':
            if (value) {
              viewer.setAttribute('speaking', 'true');
            } else {
              viewer.removeAttribute('speaking');
            }
            break;
          case 'thinking':
            if (value) {
              viewer.setAttribute('thinking', 'true');
            } else {
              viewer.removeAttribute('thinking');
            }
            break;
          case 'emotion':
            viewer.setAttribute('emotion', value);
            break;
          case 'learning':
            if (value) {
              viewer.setAttribute('learning', 'true');
            } else {
              viewer.removeAttribute('learning');
            }
            break;
        }
      }
    };

    window.addEventListener('mnexctl', handleMnexControl as EventListener);
    
    return () => {
      window.removeEventListener('mnexctl', handleMnexControl as EventListener);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100vw",
        height: "100vh",
        zIndex: 1,
        pointerEvents: "none",
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
        
        /* Hide Spline watermark */
        spline-viewer::after,
        spline-viewer::before,
        spline-viewer > *::after,
        spline-viewer > *::before {
          display: none !important;
        }
        
        /* Hide any Spline branding */
        [class*="spline"],
        [id*="spline"],
        [class*="branding"],
        [id*="branding"] {
          display: none !important;
        }
        
        /* Hide watermark overlay */
        .spline-watermark,
        .spline-branding,
        .spline-logo {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
