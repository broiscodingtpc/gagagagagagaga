import * as THREE from 'three';

interface ReactionData {
  energy: number;
  sentiment: number;
  intensity: number;
  speaking: boolean;
}

export class HolographicButtons {
  public group: THREE.Group;
  private buttons: THREE.Group[] = [];
  private time: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Create holographic buttons
    this.createButton('Telegram', 0x00D4AA, new THREE.Vector3(-2, 1, 0));
    this.createButton('Twitter', 0x1DA1F2, new THREE.Vector3(2, 1, 0));
    this.createButton('DexScreener', 0x00FF88, new THREE.Vector3(-2, -1, 0));
    this.createButton('Whitepaper', 0x9945FF, new THREE.Vector3(2, -1, 0));
  }

  private createButton(label: string, color: number, position: THREE.Vector3) {
    const buttonGroup = new THREE.Group();

    // Create ring geometry
    const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 32);
    const ringMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uHover: { value: 0.0 }
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform vec3 uColor;
        uniform float uHover;

        varying vec2 vUv;

        void main() {
          float dist = length(vUv - 0.5);
          float ring = smoothstep(0.3, 0.35, dist) - smoothstep(0.0, 0.05, dist);

          // Pulsing animation
          float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
          ring *= 0.8 + (pulse * 0.4);

          // Hover effect
          ring *= 1.0 + (uHover * 0.5);

          gl_FragColor = vec4(uColor, ring);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    buttonGroup.add(ring);

    // Add text sprite
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;

    context.font = 'bold 24px monospace';
    context.fillStyle = '#ffffff';
    context.textAlign = 'center';
    context.fillText(label, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1.5, 0.4, 1);
    sprite.position.set(0, 0, 0.1);
    buttonGroup.add(sprite);

    buttonGroup.position.copy(position);
    this.buttons.push(buttonGroup);
    this.group.add(buttonGroup);
  }

  update(deltaTime: number, reactionData: ReactionData) {
    this.time += deltaTime;

    // Orbit buttons slowly
    this.buttons.forEach((button, index) => {
      const angle = this.time * 0.3 + (index * Math.PI * 0.5);
      const radius = 3;
      button.position.x = Math.cos(angle) * radius;
      button.position.z = Math.sin(angle) * radius;

      // Rotate button
      button.rotation.z = angle;

      // Scale based on energy
      const scale = 0.8 + (reactionData.energy * 0.4);
      button.scale.setScalar(scale);

      // Update ring shader
      const ring = button.children[0] as THREE.Mesh;
      const material = ring.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = this.time;
      material.uniforms.uHover.value = reactionData.intensity * 0.5;
    });

    // Rotate entire group
    this.group.rotation.y = this.time * 0.1;
  }

  dispose() {
    this.buttons.forEach(button => {
      button.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    });
    this.group.clear();
  }
}
