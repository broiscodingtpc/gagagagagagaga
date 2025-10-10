/**
 * AppShell - Non-destructive Layout Wrapper
 * Positions the immersive 3D layer behind existing content
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { HoloHeadV2 } from './HoloHeadV2';
import { EnergyFilaments } from './EnergyFilaments';
import { GridPlane } from './GridPlane';
import { HUD } from './HUD';
import { OrbitalLinks } from './OrbitalLinks';
import { WhitepaperModal } from './WhitepaperModal';
import { useMnexControl } from './useMnexControl';
import { AudioReactivity, type AudioReactData } from './AudioReact';
import { PerformanceManager, type PerformanceConfig } from './perf';

interface AppShellProps {
  children: React.ReactNode;
  enableAudioReact?: boolean;
}

export function AppShell({ children, enableAudioReact = false }: AppShellProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(enableAudioReact);
  const [fps, setFps] = useState(60);
  const [debugMode, setDebugMode] = useState(false);

  const { state: controlState, setThinking } = useMnexControl();
  const audioReactRef = useRef<AudioReactivity>(new AudioReactivity());
  const perfManagerRef = useRef<PerformanceManager | null>(null);

  // No keyboard hotkeys - interface is always alive and visible

  const handleToggleAudio = useCallback(async () => {
    const newState = await audioReactRef.current.toggle();
    setAudioEnabled(newState);
  }, []);

  // Three.js scene
  useEffect(() => {
    if (!mountRef.current || !isVisible) return;

    const mount = mountRef.current;
    let raf = 0;
    let lastTime = performance.now() / 1000;
    let frameCount = 0;
    let fpsUpdateTime = lastTime;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });

    let currentConfig: PerformanceConfig = {
      dpr: Math.min(window.devicePixelRatio, 2),
      bloomEnabled: !prefersReducedMotion,
      chromaticAberrationEnabled: !prefersReducedMotion,
      particleCount: prefersReducedMotion ? 500 : 1000,
      shadowsEnabled: false
    };

    renderer.setPixelRatio(currentConfig.dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a0033, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7c3aed, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Grid plane (background)
    const gridPlane = new GridPlane();
    scene.add(gridPlane.mesh);

    // Main HoloHead V2 (sentient AI)
    const holoHead = new HoloHeadV2();
    scene.add(holoHead.group);

    // Energy filaments connecting head to UI
    const energyFilaments = new EnergyFilaments();
    scene.add(energyFilaments.group);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    let bloomPass: UnrealBloomPass | null = null;
    if (currentConfig.bloomEnabled) {
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.3,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);
    }

    // Performance manager
    perfManagerRef.current = new PerformanceManager((newConfig) => {
      currentConfig = newConfig;
      renderer.setPixelRatio(newConfig.dpr);

      // Update bloom
      if (newConfig.bloomEnabled && !bloomPass) {
        bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          1.3,
          0.4,
          0.85
        );
        composer.addPass(bloomPass);
      } else if (!newConfig.bloomEnabled && bloomPass) {
        composer.removePass(bloomPass);
        bloomPass = null;
      }
    });

    // Mouse tracking
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);

    const onMouseMove = (event: MouseEvent) => {
      targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Window resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      holoHead.updateResolution(window.innerWidth, window.innerHeight);

      if (bloomPass) {
        bloomPass.resolution.set(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // Animation loop
    const animate = (currentTime: number) => {
      const time = currentTime / 1000;
      const deltaTime = time - lastTime;
      lastTime = time;

      frameCount++;

      // Update FPS every second
      if (time - fpsUpdateTime >= 1.0) {
        setFps(frameCount / (time - fpsUpdateTime));
        frameCount = 0;
        fpsUpdateTime = time;
      }

      // Record performance
      if (perfManagerRef.current) {
        perfManagerRef.current.recordFrame(deltaTime);
      }

      // Smooth mouse interpolation
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      // Camera parallax (subtle)
      camera.position.x = mouse.x * 0.3;
      camera.position.y = mouse.y * 0.2;
      camera.lookAt(0, 0, 0);

      // Get audio data
      const audioData: AudioReactData = audioEnabled
        ? audioReactRef.current.getData()
        : { amplitude: 0, frequency: 0, enabled: false };

      // Update Grid Plane
      gridPlane.update(deltaTime, controlState, mouse);

      // Update HoloHead
      holoHead.update(deltaTime, controlState, audioData, mouse);

      // Update Energy Filaments
      energyFilaments.update(deltaTime, controlState);

      // Update lighting based on energy
      pointLight.intensity = 0.7 + (controlState.energy / 100) * 0.5 + audioData.amplitude * 0.3;

      // Render
      composer.render();

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);

      // Cleanup
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();
      gridPlane.dispose();
      holoHead.dispose();
      energyFilaments.dispose();
      
      if (bloomPass) {
        bloomPass.dispose();
      }
    };
  }, [isVisible, controlState, audioEnabled]);

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {/* 3D Background Layer */}
      <div
        ref={mountRef}
        className="mnex-holo-layer"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 50%, rgba(26, 0, 51, 0.3) 0%, rgba(7, 3, 11, 1) 100%)'
        }}
      />

      {/* HUD Overlay */}
      <HUD
        control={controlState}
        fps={fps}
        audioEnabled={audioEnabled}
        onToggleAudio={handleToggleAudio}
      />

      {/* Orbital Navigation Links */}
      <OrbitalLinks onWhitepaperClick={() => setWhitepaperOpen(true)} />

      {/* Original App Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Whitepaper Modal */}
      <WhitepaperModal
        isOpen={whitepaperOpen}
        onClose={() => setWhitepaperOpen(false)}
      />

      {/* Debug Info */}
      {debugMode && (
        <div className="mnex-debug">
          <div>FPS: {Math.floor(fps)}</div>
          <div>Energy: {Math.floor(controlState.energy)}</div>
          <div>Emotion: {controlState.emotion}</div>
          <div>Speaking: {controlState.speaking ? 'Yes' : 'No'}</div>
          <div>Audio: {audioEnabled ? 'On' : 'Off'}</div>
          <div>DPR: {window.devicePixelRatio.toFixed(1)}</div>
        </div>
      )}
    </>
  );
}

