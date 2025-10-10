/**
 * HoloHead - Digital AI Head (High-Tech)
 * Clear facial features with geometric, tech-inspired design
 */

import * as THREE from 'three';
import type { MnexControlState } from './useMnexControl';
import type { AudioReactData } from './AudioReact';

export class HoloHead {
  public group: THREE.Group;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private time = 0;

  constructor() {
    this.group = new THREE.Group();

    // Fullscreen quad for raymarching
    const geometry = new THREE.PlaneGeometry(2, 2);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uEnergy: { value: 0.65 },
        uPulse: { value: 0 },
        uFlare: { value: 0 },
        uGlitch: { value: 0 },
        uSpeaking: { value: 0 },
        uEmotion: { value: 0 },
        uAudioAmp: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        
        varying vec2 vUv;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform float uTime;
        uniform float uEnergy;
        uniform float uPulse;
        uniform float uFlare;
        uniform float uGlitch;
        uniform float uSpeaking;
        uniform float uEmotion;
        uniform float uAudioAmp;

        // Noise functions
        float hash(vec3 p) {
          return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = hash(i + vec3(0,0,0));
          float b = hash(i + vec3(1,0,0));
          float c = hash(i + vec3(0,1,0));
          float d = hash(i + vec3(1,1,0));
          float e = hash(i + vec3(0,0,1));
          float g = hash(i + vec3(1,0,1));
          float h = hash(i + vec3(0,1,1));
          float k = hash(i + vec3(1,1,1));
          
          return mix(
            mix(mix(a,b,f.x), mix(c,d,f.x), f.y),
            mix(mix(e,g,f.x), mix(h,k,f.x), f.y),
            f.z
          );
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for(int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p *= 2.01;
            amplitude *= 0.5;
          }
          return value;
        }

        // Box SDF for geometric shapes
        float sdBox(vec3 p, vec3 b) {
          vec3 q = abs(p) - b;
          return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
        }

        float sdSphere(vec3 p, float r) {
          return length(p) - r;
        }

        float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
          vec3 pa = p - a, ba = b - a;
          float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          return length(pa - ba * h) - r;
        }

        // Smooth operations
        float opSmoothUnion(float d1, float d2, float k) {
          float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
          return mix(d2, d1, h) - k * h * (1.0 - h);
        }

        float opSmoothSubtraction(float d1, float d2, float k) {
          float h = clamp(0.5 - 0.5 * (d2 + d1) / k, 0.0, 1.0);
          return mix(d2, -d1, h) + k * h * (1.0 - h);
        }

        // Digital AI Head with clear facial structure
        float sdfHead(vec3 p) {
          // Mouse parallax
          p.xy += uMouse * 0.12;
          
          // Main head - more cubic/geometric
          float head = sdBox(p + vec3(0.0, 0.0, 0.0), vec3(0.45, 0.55, 0.5));
          
          // Smooth corners for organic feel
          head = head - 0.15;
          
          // Lower jaw - separate geometric piece
          vec3 jawPos = p + vec3(0.0, 0.35, 0.05);
          float jaw = sdBox(jawPos, vec3(0.35, 0.20, 0.40));
          jaw = jaw - 0.12;
          head = opSmoothUnion(head, jaw, 0.15);
          
          // EYE SOCKETS - large and prominent
          float eyeL = sdBox(p + vec3(-0.22, -0.15, 0.35), vec3(0.12, 0.14, 0.08));
          float eyeR = sdBox(p + vec3( 0.22, -0.15, 0.35), vec3(0.12, 0.14, 0.08));
          eyeL = eyeL - 0.05;
          eyeR = eyeR - 0.05;
          head = opSmoothSubtraction(eyeL, head, 0.08);
          head = opSmoothSubtraction(eyeR, head, 0.08);
          
          // NOSE - geometric ridge
          vec3 nosePos = p + vec3(0.0, 0.05, 0.45);
          float nose = sdBox(nosePos, vec3(0.06, 0.18, 0.08));
          nose = nose - 0.03;
          head = opSmoothUnion(head, nose, 0.08);
          
          // MOUTH - geometric slit
          if(uSpeaking > 0.01) {
            float mouthHeight = 0.05 + uSpeaking * 0.08;
            vec3 mouthPos = p + vec3(0.0, 0.30, 0.38);
            float mouth = sdBox(mouthPos, vec3(0.18, mouthHeight, 0.06));
            mouth = mouth - 0.03;
            head = opSmoothSubtraction(mouth, head, 0.06);
          }
          
          // Tech panel lines (forehead)
          float panel1 = sdBox(p + vec3(0.0, -0.35, 0.42), vec3(0.30, 0.02, 0.01));
          float panel2 = sdBox(p + vec3(0.0, -0.28, 0.43), vec3(0.25, 0.02, 0.01));
          head = opSmoothSubtraction(panel1, head, 0.02);
          head = opSmoothSubtraction(panel2, head, 0.02);
          
          return head;
        }

        // Raymarching
        vec4 raymarch(vec3 ro, vec3 rd) {
          float t = 0.0;
          vec3 pos = ro;
          
          for(int i = 0; i < 80; i++) {
            pos = ro + rd * t;
            float dist = sdfHead(pos);
            
            // Subtle energy distortion
            float energy_distort = (fbm(pos * 4.0 + uTime * 0.4) - 0.5) * 0.02;
            energy_distort *= (uEnergy + uPulse * 0.5);
            dist += energy_distort;
            
            if(dist < 0.001) {
              return vec4(pos, 1.0);
            }
            
            t += max(dist * 0.8, 0.003);
            if(t > 5.0) break;
          }
          
          return vec4(pos, 0.0);
        }

        // Calculate normal
        vec3 calcNormal(vec3 p) {
          float e = 0.001;
          float d = sdfHead(p);
          return normalize(vec3(
            sdfHead(p + vec3(e, 0, 0)) - d,
            sdfHead(p + vec3(0, e, 0)) - d,
            sdfHead(p + vec3(0, 0, e)) - d
          ));
        }

        // Tech scanlines
        float scanlines(vec2 uv, float time) {
          return sin(uv.y * 300.0 + time * 2.0) * 0.5 + 0.5;
        }

        void main() {
          vec2 uv = (vUv * 2.0 - 1.0);
          uv.x *= uResolution.x / uResolution.y;
          
          // Camera setup - frontal view with slight rotation
          float angle = sin(uTime * 0.1) * 0.08;
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          
          vec3 ro = vec3(0.0, 0.0, -2.5);
          vec3 rd = normalize(vec3(uv, 1.5));
          
          ro.xy *= rot;
          rd.xy *= rot;
          
          // Raymarch
          vec4 result = raymarch(ro, rd);
          
          // Background - deep tech space
          vec3 col = vec3(0.01, 0.0, 0.05);
          float grid = max(
            smoothstep(0.98, 1.0, sin(uv.x * 30.0)),
            smoothstep(0.98, 1.0, sin(uv.y * 30.0))
          );
          col += vec3(0.15, 0.05, 0.25) * grid * 0.15;
          
          if(result.w > 0.5) {
            vec3 pos = result.xyz;
            vec3 normal = calcNormal(pos);
            
            // Lighting
            vec3 lightDir = normalize(vec3(0.5, -0.3, -1.0));
            float diff = max(dot(normal, lightDir), 0.0);
            
            // Fresnel - edge glow
            float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
            
            // Digital energy pattern
            float pattern = fbm(pos * 8.0 + uTime * 0.3);
            pattern = pow(pattern, 2.0);
            
            // Base color - purple tech
            vec3 baseColor = vec3(0.25, 0.1, 0.4);
            vec3 edgeColor = vec3(0.6, 0.3, 1.0);
            
            // Eye glow - BRIGHT and clear
            float eyeGlowL = smoothstep(0.18, 0.0, length(pos - vec3(-0.22, -0.15, 0.42)));
            float eyeGlowR = smoothstep(0.18, 0.0, length(pos - vec3( 0.22, -0.15, 0.42)));
            float eyeGlow = max(eyeGlowL, eyeGlowR);
            eyeGlow *= (0.7 + 0.3 * sin(uTime * 2.0));
            eyeGlow *= (1.0 + uEnergy * 0.5 + uEmotion * 0.3);
            
            // Mouth glow when speaking
            float mouthGlow = 0.0;
            if(uSpeaking > 0.01) {
              mouthGlow = smoothstep(0.25, 0.0, length(pos - vec3(0.0, 0.30, 0.42)));
              mouthGlow *= uSpeaking * (0.6 + 0.4 * sin(uTime * 6.0));
            }
            
            // Tech panel glow
            float panelGlow = 0.0;
            panelGlow += smoothstep(0.08, 0.0, abs(pos.y + 0.35)) * smoothstep(0.32, 0.0, abs(pos.x));
            panelGlow += smoothstep(0.08, 0.0, abs(pos.y + 0.28)) * smoothstep(0.27, 0.0, abs(pos.x));
            panelGlow *= pattern * 0.5;
            
            // Combine lighting
            vec3 finalColor = baseColor * (0.3 + diff * 0.4);
            finalColor += edgeColor * fresnel * (0.5 + uEnergy * 0.5);
            finalColor += pattern * vec3(0.3, 0.15, 0.5) * (0.3 + uEnergy * 0.4);
            finalColor += vec3(0.8, 0.5, 1.0) * eyeGlow * 1.5; // Bright eyes
            finalColor += vec3(0.7, 0.4, 1.0) * mouthGlow * 0.8;
            finalColor += vec3(0.4, 0.2, 0.7) * panelGlow;
            
            // Flare effect
            finalColor += vec3(1.0, 0.7, 1.0) * uFlare * 0.6;
            
            // Scanlines for tech feel
            float scan = scanlines(vUv, uTime);
            finalColor *= (0.95 + scan * 0.05);
            
            col = mix(col, finalColor, 0.98);
          }
          
          // Vignette
          float vignette = length((vUv - 0.5) * 1.8);
          col *= smoothstep(1.3, 0.5, vignette);
          
          // Contrast & gamma
          col = pow(col, vec3(0.85));
          
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.group.add(this.mesh);
  }

  update(deltaTime: number, control: MnexControlState, audio: AudioReactData, mouse: THREE.Vector2): void {
    this.time += deltaTime;

    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uEnergy.value = control.energy / 100;
    this.material.uniforms.uPulse.value = control.pulse;
    this.material.uniforms.uFlare.value = control.flare;
    this.material.uniforms.uGlitch.value = control.glitch;
    this.material.uniforms.uSpeaking.value = control.speaking ? 1.0 : 0.0;
    
    let emotionValue = 0.0;
    if (control.emotion === 'alert') emotionValue = 0.5;
    else if (control.emotion === 'intense') emotionValue = 1.0;
    this.material.uniforms.uEmotion.value = emotionValue;
    
    this.material.uniforms.uAudioAmp.value = audio.amplitude;
    this.material.uniforms.uMouse.value.copy(mouse);
  }

  updateResolution(width: number, height: number): void {
    this.material.uniforms.uResolution.value.set(width, height);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
