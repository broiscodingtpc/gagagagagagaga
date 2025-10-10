/**
 * HoloHead V2 - Sentient AI Energy Head
 * Clear facial features with cursor-tracking eyes, emotional states, and living presence
 */

import * as THREE from 'three';
import type { MnexControlState } from './useMnexControl';
import type { AudioReactData } from './AudioReact';

export class HoloHeadV2 {
  public group: THREE.Group;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private time = 0;
  private targetEyePos = new THREE.Vector2(0, 0);
  private currentEyePos = new THREE.Vector2(0, 0);

  constructor() {
    this.group = new THREE.Group();

    const geometry = new THREE.PlaneGeometry(2, 2);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uEyeTarget: { value: new THREE.Vector2(0, 0) },
        uEnergy: { value: 0.65 },
        uPulse: { value: 0 },
        uFlare: { value: 0 },
        uGlitch: { value: 0 },
        uSpeaking: { value: 0 },
        uThinking: { value: 0 },
        uEmotion: { value: 0 }, // 0=calm(blue-purple), 0.5=alert(magenta), 1=intense(pink-white)
        uAudioAmp: { value: 0 },
        uBreathing: { value: 0 }
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
        uniform vec2 uEyeTarget;
        uniform float uTime;
        uniform float uEnergy;
        uniform float uPulse;
        uniform float uFlare;
        uniform float uGlitch;
        uniform float uSpeaking;
        uniform float uThinking;
        uniform float uEmotion;
        uniform float uAudioAmp;
        uniform float uBreathing;

        #define PI 3.14159265359

        // High-quality noise
        vec3 hash3(vec3 p) {
          p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                   dot(p, vec3(269.5, 183.3, 246.1)),
                   dot(p, vec3(113.5, 271.9, 124.6)));
          return fract(sin(p) * 43758.5453123);
        }

        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float n = dot(i, vec3(1.0, 57.0, 113.0));
          return mix(mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
                              dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), f.x),
                          mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
                              dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), f.x), f.y),
                      mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
                              dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), f.x),
                          mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
                              dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), f.x), f.y), f.z);
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for(int i = 0; i < 5; i++) {
            value += amplitude * noise(p * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        // SDF primitives
        float sdSphere(vec3 p, float r) {
          return length(p) - r;
        }

        float sdEllipsoid(vec3 p, vec3 r) {
          float k0 = length(p / r);
          float k1 = length(p / (r * r));
          return k0 * (k0 - 1.0) / k1;
        }

        float sdBox(vec3 p, vec3 b) {
          vec3 q = abs(p) - b;
          return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
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

        // Sentient AI Head SDF
        float sdfAIHead(vec3 p, out float eyeMask, out float mouthMask, out float noseMask) {
          // Parallax from mouse
          p.xy += uMouse * 0.15;
          
          // Breathing animation
          float breathScale = 1.0 + uBreathing * 0.03;
          p /= breathScale;
          
          // Main cranium - slightly elongated
          float head = sdEllipsoid(p, vec3(0.48, 0.55, 0.50));
          
          // Jaw structure
          vec3 jawPos = p + vec3(0.0, 0.25, 0.0);
          float jaw = sdEllipsoid(jawPos, vec3(0.38, 0.30, 0.48));
          head = opSmoothUnion(head, jaw, 0.20);
          
          // Cheekbones (subtle)
          float cheekL = sdEllipsoid(p + vec3(-0.28, 0.05, 0.25), vec3(0.15, 0.12, 0.20));
          float cheekR = sdEllipsoid(p + vec3( 0.28, 0.05, 0.25), vec3(0.15, 0.12, 0.20));
          head = opSmoothUnion(head, cheekL, 0.15);
          head = opSmoothUnion(head, cheekR, 0.15);
          
          // EYE SOCKETS - large, expressive, tracking cursor
          vec2 eyeOffset = uEyeTarget * 0.08; // Eyes follow cursor
          
          vec3 eyePosL = p + vec3(-0.20, -0.12, 0.40);
          vec3 eyePosR = p + vec3( 0.20, -0.12, 0.40);
          
          // Move pupils
          eyePosL.xy -= eyeOffset;
          eyePosR.xy -= eyeOffset;
          
          float eyeL = sdEllipsoid(eyePosL, vec3(0.13, 0.16, 0.10));
          float eyeR = sdEllipsoid(eyePosR, vec3(0.13, 0.16, 0.10));
          
          head = opSmoothSubtraction(eyeL, head, 0.10);
          head = opSmoothSubtraction(eyeR, head, 0.10);
          
          // Eye glow mask (for shader)
          eyeMask = max(
            smoothstep(0.20, 0.0, length(eyePosL)),
            smoothstep(0.20, 0.0, length(eyePosR))
          );
          
          // NOSE - elegant bridge
          vec3 nosePos = p + vec3(0.0, 0.05, 0.48);
          float nose = sdEllipsoid(nosePos, vec3(0.08, 0.22, 0.12));
          head = opSmoothUnion(head, nose, 0.10);
          noseMask = smoothstep(0.15, 0.0, length(nosePos));
          
          // MOUTH - expressive, moves when speaking
          float mouthOpen = 0.04 + uSpeaking * 0.10 + uAudioAmp * 0.06;
          vec3 mouthPos = p + vec3(0.0, 0.35, 0.35);
          float mouth = sdEllipsoid(mouthPos, vec3(0.20, mouthOpen, 0.10));
          head = opSmoothSubtraction(mouth, head, 0.08);
          mouthMask = smoothstep(0.25, 0.0, length(mouthPos));
          
          return head;
        }

        // Raymarching with high quality
        vec4 raymarch(vec3 ro, vec3 rd, out float eyeMask, out float mouthMask, out float noseMask) {
          float t = 0.0;
          vec3 pos = ro;
          
          for(int i = 0; i < 120; i++) {
            pos = ro + rd * t;
            
            float dist = sdfAIHead(pos, eyeMask, mouthMask, noseMask);
            
            // Energy turbulence (more active when thinking)
            float turbSpeed = uThinking > 0.5 ? 1.5 : 0.5;
            float turbulence = fbm(pos * 3.5 + uTime * turbSpeed) - 0.5;
            turbulence *= 0.03 * (0.6 + uEnergy * 0.6 + uPulse * 0.4);
            dist += turbulence;
            
            if(dist < 0.0008) {
              return vec4(pos, 1.0);
            }
            
            t += max(dist * 0.75, 0.002);
            if(t > 6.0) break;
          }
          
          eyeMask = 0.0;
          mouthMask = 0.0;
          noseMask = 0.0;
          return vec4(pos, 0.0);
        }

        // Calculate normal with precision
        vec3 calcNormal(vec3 p) {
          float e = 0.0005;
          float em, mm, nm;
          float d = sdfAIHead(p, em, mm, nm);
          return normalize(vec3(
            sdfAIHead(p + vec3(e, 0, 0), em, mm, nm) - d,
            sdfAIHead(p + vec3(0, e, 0), em, mm, nm) - d,
            sdfAIHead(p + vec3(0, 0, e), em, mm, nm) - d
          ));
        }

        // Emotion color mapping
        vec3 getEmotionColor(float emotion) {
          // calm (0.0) → soft blue-purple
          vec3 calmColor = vec3(0.4, 0.3, 0.8);
          // alert (0.5) → magenta
          vec3 alertColor = vec3(0.8, 0.2, 0.8);
          // intense (1.0) → hot pink-white
          vec3 intenseColor = vec3(1.0, 0.6, 0.95);
          
          if(emotion < 0.5) {
            return mix(calmColor, alertColor, emotion * 2.0);
          } else {
            return mix(alertColor, intenseColor, (emotion - 0.5) * 2.0);
          }
        }

        void main() {
          vec2 uv = (vUv * 2.0 - 1.0);
          uv.x *= uResolution.x / uResolution.y;
          
          // Camera with subtle auto-rotation
          float camAngle = sin(uTime * 0.08) * 0.05;
          mat2 camRot = mat2(cos(camAngle), -sin(camAngle), sin(camAngle), cos(camAngle));
          
          vec3 ro = vec3(0.0, 0.0, -2.8);
          vec3 rd = normalize(vec3(uv, 1.6));
          
          ro.xy *= camRot;
          rd.xy *= camRot;
          
          // Raymarch the AI head
          float eyeMask, mouthMask, noseMask;
          vec4 result = raymarch(ro, rd, eyeMask, mouthMask, noseMask);
          
          // Background - deep neural space
          vec3 col = vec3(0.005, 0.0, 0.02);
          
          // Subtle grid
          float grid = max(
            smoothstep(0.98, 1.0, sin(uv.x * 25.0 + uTime * 0.1)),
            smoothstep(0.98, 1.0, sin(uv.y * 25.0 + uTime * 0.1))
          );
          col += vec3(0.1, 0.05, 0.15) * grid * 0.1;
          
          if(result.w > 0.5) {
            vec3 pos = result.xyz;
            vec3 normal = calcNormal(pos);
            
            // Lighting setup
            vec3 lightDir = normalize(vec3(0.5, -0.3, -1.0));
            float diff = max(dot(normal, lightDir), 0.0) * 0.6;
            
            // Fresnel rim light
            float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 2.5);
            
            // Energy flow pattern
            float energyPattern = fbm(pos * 6.0 + uTime * 0.4);
            energyPattern = pow(energyPattern, 1.5);
            
            // Get emotion-based color
            vec3 emotionColor = getEmotionColor(uEmotion);
            
            // Base energy color
            vec3 baseGlow = emotionColor * (0.15 + energyPattern * 0.35);
            
            // Rim glow
            vec3 rimGlow = emotionColor * 1.2 * (0.4 + fresnel * 0.8);
            
            // EYES - bright, alive, following cursor
            float eyePulse = 0.85 + 0.15 * sin(uTime * 2.5);
            eyePulse *= (1.0 + uThinking * 0.4 + uEmotion * 0.3);
            vec3 eyeColor = emotionColor * 1.5 * eyeMask * eyePulse;
            
            // MOUTH - glows when speaking
            float mouthPulse = uSpeaking * (0.7 + 0.3 * sin(uTime * 8.0 + uAudioAmp * 15.0));
            vec3 mouthColor = emotionColor * 1.2 * mouthMask * mouthPulse;
            
            // NOSE - subtle highlight
            vec3 noseColor = emotionColor * 0.3 * noseMask;
            
            // Energy veins (thinking state)
            float veins = 0.0;
            if(uThinking > 0.5) {
              vec3 veinPattern = pos * 12.0 + uTime * 2.0;
              veins = smoothstep(0.7, 0.8, noise(veinPattern)) * uThinking;
            }
            vec3 veinColor = emotionColor * 1.5 * veins * 0.4;
            
            // Combine all elements
            vec3 faceColor = baseGlow + rimGlow + eyeColor + mouthColor + noseColor + veinColor;
            
            // Add diffuse lighting
            faceColor += emotionColor * diff * 0.3;
            
            // Flare burst
            faceColor += vec3(1.0, 0.8, 1.0) * uFlare * 0.7;
            
            // Glitch distortion (subtle)
            faceColor *= (1.0 + uGlitch * sin(uTime * 50.0 + pos.y * 30.0) * 0.15);
            
            // Outer aura
            float auraDist = sdfAIHead(pos + rd * 0.02, eyeMask, mouthMask, noseMask);
            float aura = smoothstep(0.0, 0.10, 0.10 - auraDist);
            vec3 auraColor = emotionColor * 0.25 * aura;
            
            col = mix(col, faceColor, 0.98) + auraColor;
          }
          
          // Vignette
          float vignette = length((vUv - 0.5) * 2.0);
          col *= smoothstep(1.4, 0.4, vignette);
          
          // Subtle film grain
          float grain = hash3(vec3(vUv * uTime, uTime)).x;
          col += (grain - 0.5) * 0.02;
          
          // Contrast and gamma
          col = pow(col, vec3(0.85));
          col *= 1.1;
          
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

    // Smooth eye tracking
    this.targetEyePos.copy(mouse);
    this.currentEyePos.lerp(this.targetEyePos, 0.08);

    // Breathing animation (idle)
    const breathing = Math.sin(this.time * 0.8) * 0.5 + 0.5;

    // Update all uniforms
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uEnergy.value = control.energy / 100;
    this.material.uniforms.uPulse.value = control.pulse;
    this.material.uniforms.uFlare.value = control.flare;
    this.material.uniforms.uGlitch.value = control.glitch;
    this.material.uniforms.uSpeaking.value = control.speaking ? 1.0 : 0.0;
    this.material.uniforms.uThinking.value = control.thinking ? 1.0 : 0.0;
    this.material.uniforms.uEmotion.value = this.mapEmotion(control.emotion);
    this.material.uniforms.uAudioAmp.value = audio.amplitude;
    this.material.uniforms.uBreathing.value = breathing;
    this.material.uniforms.uMouse.value.copy(mouse);
    this.material.uniforms.uEyeTarget.value.copy(this.currentEyePos);
  }

  private mapEmotion(emotion: 'calm' | 'alert' | 'intense'): number {
    switch (emotion) {
      case 'calm': return 0.0;
      case 'alert': return 0.5;
      case 'intense': return 1.0;
      default: return 0.0;
    }
  }

  updateResolution(width: number, height: number): void {
    this.material.uniforms.uResolution.value.set(width, height);
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}

