import * as THREE from 'three';

interface ReactionData {
  energy: number;
  sentiment: number;
  intensity: number;
  speaking: boolean;
}

interface AudioData {
  amplitude: number;
  frequency: number;
}

export class MnexHead {
  public group: THREE.Group;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private time: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Create geometry
    const geometry = new THREE.SphereGeometry(1, 64, 32);

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uEnergy: { value: 0.5 },
        uSentiment: { value: 0.0 },
        uIntensity: { value: 0.5 },
        uSpeaking: { value: false },
        uAmplitude: { value: 0.0 },
        uFrequency: { value: 0.0 }
      },
      vertexShader: /* glsl */`
        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
          vPosition = position;
          vNormal = normal;
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform float uEnergy;
        uniform float uSentiment;
        uniform float uIntensity;
        uniform bool uSpeaking;
        uniform float uAmplitude;
        uniform float uFrequency;

        varying vec3 vPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        // Noise functions
        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec3(1.0, 0.0, 0.0));
          float c = hash(i + vec3(0.0, 1.0, 0.0));
          float d = hash(i + vec3(1.0, 1.0, 0.0));
          vec3 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
        }

        float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.5;
          for(int i = 0; i < 5; i++) {
            v += a * noise(p);
            p *= 2.01;
            a *= 0.5;
          }
          return v;
        }

        // SDF Head geometry
        float sdfHead(vec3 p) {
          // Breathing animation
          float breathe = 1.0 + 0.1 * sin(uTime * 1.5);

          // Main skull sphere
          float skull = length(p) - (0.8 * breathe);

          // Jaw ellipsoid
          vec3 jawP = p + vec3(0.0, -0.2, 0.0);
          float jaw = (length(jawP / vec3(0.9, 0.7, 1.0)) - 1.0) * min(min(0.9, 0.7), 1.0);
          jaw *= breathe;

          // Combine skull and jaw
          float head = min(skull, jaw);

          // Eye cavities
          float eyeL = length(p + vec3(-0.3, 0.1, 0.6)) - 0.15;
          float eyeR = length(p + vec3(0.3, 0.1, 0.6)) - 0.15;
          head = max(head, -eyeL);
          head = max(head, -eyeR);

          // Nose bridge
          float nose = length(p + vec3(0.0, 0.0, 0.8)) - 0.05;

          // Mouth (when speaking)
          float mouthOpen = uSpeaking ? 0.3 : 0.0;
          float mouth = length(p + vec3(0.0, -0.1, 0.7)) - (0.1 + mouthOpen * 0.1);

          return min(head, min(nose, mouth));
        }

        vec3 calcNormal(vec3 p) {
          float e = 0.001;
          return normalize(vec3(
            sdfHead(p + vec3(e, 0, 0)) - sdfHead(p - vec3(e, 0, 0)),
            sdfHead(p + vec3(0, e, 0)) - sdfHead(p - vec3(0, e, 0)),
            sdfHead(p + vec3(0, 0, e)) - sdfHead(p - vec3(0, 0, e))
          ));
        }

        void main() {
          vec3 pos = vPosition;

          // Distance field rendering
          float d = sdfHead(pos);

          // Core glow
          float core = 1.0 - smoothstep(0.0, 0.3, abs(d));

          // Energy-based emission
          float energyGlow = uEnergy * 0.5;
          float sentimentGlow = (uSentiment + 1.0) * 0.5 * uIntensity;
          float speakingGlow = uSpeaking ? 0.3 : 0.0;
          float audioGlow = uAmplitude * 0.2;

          float totalGlow = core * (energyGlow + sentimentGlow + speakingGlow + audioGlow);

          // Color based on sentiment
          vec3 baseColor = vec3(0.5, 0.2, 1.0); // Purple base
          vec3 happyColor = vec3(0.8, 0.4, 1.0); // Brighter purple
          vec3 sadColor = vec3(0.3, 0.1, 0.8); // Darker purple

          vec3 color = mix(baseColor, mix(sadColor, happyColor, uSentiment * 0.5 + 0.5), totalGlow);

          // Rim lighting
          vec3 normal = calcNormal(pos);
          float rim = pow(1.0 - max(dot(normal, vec3(0, 0, 1)), 0.0), 2.0);
          color += vec3(0.8, 0.4, 1.0) * rim * 0.3;

          // Eyes glow when speaking
          if (uSpeaking) {
            float eyeGlow = 1.0 - smoothstep(0.1, 0.3, length(pos + vec3(-0.3, 0.1, 0.6)));
            eyeGlow += 1.0 - smoothstep(0.1, 0.3, length(pos + vec3(0.3, 0.1, 0.6)));
            color += vec3(1.0, 0.8, 1.0) * eyeGlow * 0.5;
          }

          // Audio reactivity
          float audioPulse = sin(uTime * uFrequency * 10.0) * uAmplitude;
          color += vec3(0.6, 0.3, 1.0) * audioPulse * 0.2;

          // Alpha based on distance
          float alpha = (1.0 - smoothstep(0.0, 0.5, abs(d))) * 0.8;

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.group.add(this.mesh);
  }

  update(deltaTime: number, reactionData: ReactionData, audioData: AudioData) {
    this.time += deltaTime;

    // Update shader uniforms
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uEnergy.value = reactionData.energy;
    this.material.uniforms.uSentiment.value = reactionData.sentiment;
    this.material.uniforms.uIntensity.value = reactionData.intensity;
    this.material.uniforms.uSpeaking.value = reactionData.speaking;
    this.material.uniforms.uAmplitude.value = audioData.amplitude;
    this.material.uniforms.uFrequency.value = audioData.frequency;

    // Subtle floating animation
    this.mesh.position.y = Math.sin(this.time * 0.5) * 0.1;

    // Scale based on energy
    const scale = 0.8 + (reactionData.energy * 0.4);
    this.mesh.scale.setScalar(scale);

    // Rotation based on sentiment
    this.mesh.rotation.y = reactionData.sentiment * 0.2;
  }

  dispose() {
    this.material.dispose();
    this.mesh.geometry.dispose();
    this.group.clear();
  }
}
