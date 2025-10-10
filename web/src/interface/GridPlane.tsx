/**
 * GridPlane - Animated parallax grid with AI heartbeat pulses
 * Creates depth and living environment feel
 */

import * as THREE from 'three';
import type { MnexControlState } from './useMnexControl';

export class GridPlane {
  public mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private time = 0;

  constructor() {
    const geometry = new THREE.PlaneGeometry(20, 20, 100, 100);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0.65 },
        uPulse: { value: 0 },
        uThinking: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uEnergy;
        uniform float uPulse;
        uniform float uThinking;
        uniform vec2 uMouse;
        
        varying vec2 vUv;
        varying float vDistortion;
        
        // Simple noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = hash(i + vec2(0.0, 0.0));
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        void main() {
          vUv = uv;
          
          vec3 pos = position;
          
          // Distance from center
          float dist = length(uv - vec2(0.5));
          
          // AI heartbeat pulse
          float heartbeat = sin(uTime * 1.5) * 0.5 + 0.5;
          heartbeat *= uEnergy;
          
          // Thinking ripples
          float ripple = sin(dist * 15.0 - uTime * 3.0) * 0.5 + 0.5;
          ripple *= uThinking * 0.3;
          
          // Manual pulse (from control)
          float manualPulse = uPulse * sin(dist * 20.0 - uTime * 10.0);
          
          // Wave distortion
          float wave = noise(uv * 5.0 + uTime * 0.2) * 0.3;
          wave += noise(uv * 2.0 - uTime * 0.1) * 0.5;
          
          // Mouse interaction
          float mouseDist = length(uv - (uMouse * 0.5 + 0.5));
          float mouseInfluence = smoothstep(0.3, 0.0, mouseDist) * 0.15;
          
          // Combine distortions
          float distortion = (heartbeat * 0.08 + ripple + manualPulse * 0.15 + wave * 0.05 + mouseInfluence) * (1.0 - dist * 0.5);
          pos.z += distortion;
          
          vDistortion = distortion;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uEnergy;
        varying vec2 vUv;
        varying float vDistortion;
        
        void main() {
          // Grid lines
          vec2 grid = abs(fract(vUv * 40.0) - 0.5);
          float line = min(grid.x, grid.y);
          float gridMask = smoothstep(0.02, 0.0, line);
          
          // Energy color (purple to cyan based on energy)
          vec3 color = mix(
            vec3(0.3, 0.1, 0.6),  // Low energy purple
            vec3(0.2, 0.5, 0.8),  // High energy cyan
            uEnergy
          );
          
          // Fade edges
          float fade = smoothstep(0.0, 0.3, length(vUv - vec2(0.5)));
          fade = 1.0 - fade;
          
          // Highlight distorted areas
          color += vec3(0.4, 0.3, 0.8) * vDistortion * 2.0;
          
          // Final color
          vec3 finalColor = color * gridMask * fade;
          
          // Transparency based on distance and grid
          float alpha = gridMask * fade * (0.15 + uEnergy * 0.15);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.4; // Tilt for perspective
    this.mesh.position.y = -1.5;
    this.mesh.position.z = -2;
  }

  update(deltaTime: number, control: MnexControlState, mouse: THREE.Vector2): void {
    this.time += deltaTime;

    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uEnergy.value = control.energy / 100;
    this.material.uniforms.uPulse.value = control.pulse;
    this.material.uniforms.uThinking.value = control.thinking ? 1.0 : 0.0;
    this.material.uniforms.uMouse.value.copy(mouse);

    // Slow rotation for parallax effect
    this.mesh.rotation.z = Math.sin(this.time * 0.1) * 0.05;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

