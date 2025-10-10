import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ChromaticAberrationPass } from './ChromaticAberrationPass';
import { MnexHead } from './MnexHead';
import { HolographicButtons } from './HolographicButtons';
import { ParticleFog } from './ParticleFog';
import { useMnexReactions } from './useMnexReactions';
import { useAudioReactivity } from './useAudioReactivity';

interface MnexInterfaceProps {
  enableAudioReact?: boolean;
}

export default function MnexInterface({ enableAudioReact = false }: MnexInterfaceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high');

  // Get AI reaction data
  const reactionData = useMnexReactions();

  // Audio reactivity (optional)
  const audioData = useAudioReactivity(enableAudioReact);

  useEffect(() => {
    if (!mountRef.current || !isVisible) return;

    const mount = mountRef.current;
    let raf = 0;
    let lastTime = 0;
    let frameCount = 0;
    let fps = 60;

    // Performance monitoring
    const performanceCheckInterval = setInterval(() => {
      if (frameCount > 0) {
        fps = frameCount / (performance.now() / 1000 - lastTime);
        frameCount = 0;
        lastTime = performance.now() / 1000;

        if (fps < 55 && performanceMode !== 'low') {
          setPerformanceMode('low');
        } else if (fps < 50 && performanceMode !== 'medium') {
          setPerformanceMode('medium');
        } else if (fps > 58 && performanceMode !== 'high') {
          setPerformanceMode('high');
        }
      }
    }, 1000);

    // Three.js setup
    const renderer = new THREE.WebGLRenderer({
      antialias: performanceMode === 'high',
      alpha: true,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceMode === 'low' ? 1 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x220033, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x7c3aed, 1, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    // Particle fog background
    const particleFog = new ParticleFog();
    scene.add(particleFog.mesh);

    // Main MNEX head
    const mnexHead = new MnexHead();
    scene.add(mnexHead.group);

    // Holographic buttons
    const holographicButtons = new HolographicButtons();
    scene.add(holographicButtons.group);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Bloom pass (performance dependent)
    if (performanceMode !== 'low') {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        performanceMode === 'high' ? 1.5 : 1.0,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);
    }

    // Chromatic aberration pass
    const chromaticAberrationPass = new ChromaticAberrationPass();
    composer.addPass(chromaticAberrationPass.pass);

    // Mouse tracking for camera
    const mouse = { x: 0, y: 0 };
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update camera position for parallax
      camera.position.x = mouse.x * 0.5;
      camera.position.y = mouse.y * 0.3;
      camera.lookAt(0, 0, 0);
    };

    // Keyboard controls
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'i' || event.key === 'I') {
        setIsVisible(prev => !prev);
      }
    };

    // Window resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      composer.setSize(window.innerWidth, window.innerHeight);

      if (composer.passes.length > 1) {
        const bloomPass = composer.passes[1] as any;
        if (bloomPass) {
          bloomPass.resolution.set(window.innerWidth, window.innerHeight);
        }
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    // Animation loop
    const animate = (currentTime: number) => {
      if (!isVisible) {
        raf = requestAnimationFrame(animate);
        return;
      }

      frameCount++;
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update head with reaction data
      mnexHead.update(deltaTime, reactionData, audioData);

      // Update particle fog
      particleFog.update(deltaTime, reactionData);

      // Update holographic buttons
      holographicButtons.update(deltaTime, reactionData);

      // Update lighting
      pointLight.intensity = 0.8 + (reactionData.energy * 0.4) + (audioData.amplitude * 0.2);

      // Render
      composer.render();

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(performanceCheckInterval);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);

      // Cleanup
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      composer.dispose();

      particleFog.dispose();
      mnexHead.dispose();
      holographicButtons.dispose();
    };
  }, [isVisible, performanceMode, reactionData, audioData]);

  if (!isVisible) return null;

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        background: 'transparent'
      }}
      aria-hidden="true"
    />
  );
}
