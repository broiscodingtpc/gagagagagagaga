import * as THREE from 'three';

interface ReactionData {
  energy: number;
  sentiment: number;
  intensity: number;
  speaking: boolean;
}

export class ParticleFog {
  public mesh: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private time: number = 0;
  private particleCount = 1000;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0.5 },
        uIntensity: { value: 0.5 }
      },
      vertexShader: /* glsl */`
        uniform float uTime;
        uniform float uEnergy;
        uniform float uIntensity;

        attribute float size;
        attribute vec3 color;

        varying vec3 vColor;

        void main() {
          vColor = color;

          // Particle movement
          vec3 pos = position;

          // Slow floating motion
          pos.y += sin(uTime * 0.5 + position.x * 0.01) * 0.1;
          pos.x += cos(uTime * 0.3 + position.z * 0.01) * 0.05;

          // Energy-based expansion
          pos *= 1.0 + (uEnergy * 0.3);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = size * (300.0 / -mvPosition.z);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform float uEnergy;
        uniform float uIntensity;

        varying vec3 vColor;

        void main() {
          // Circular particles
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);

          if (dist > 0.5) discard;

          // Soft falloff
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

          // Pulsing glow
          float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
          alpha *= 0.3 + (pulse * 0.4) + (uEnergy * 0.3) + (uIntensity * 0.2);

          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // Create particle positions and attributes
    this.createParticles();
    this.mesh = new THREE.Points(this.geometry, this.material);
  }

  private createParticles() {
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;

      // Random spherical distribution
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Purple color variations
      const hue = 0.8 + (Math.random() * 0.2); // Purple range
      const saturation = 0.3 + (Math.random() * 0.4);
      const lightness = 0.4 + (Math.random() * 0.3);

      colors[i3] = hue;
      colors[i3 + 1] = saturation;
      colors[i3 + 2] = lightness;

      sizes[i] = Math.random() * 3 + 1;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  }

  update(deltaTime: number, reactionData: ReactionData) {
    this.time += deltaTime;

    // Update shader uniforms
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uEnergy.value = reactionData.energy;
    this.material.uniforms.uIntensity.value = reactionData.intensity;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
