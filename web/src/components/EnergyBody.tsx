/**
 * EnergyBody - Full AI Holographic Body
 * Inspired by cosmic neural entity with purple energy, circuit lines, and aura
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  energy?: number;
  visible?: boolean;
  reducedMotion?: boolean;
  style?: React.CSSProperties;
};

export default function EnergyBody({
  energy = 0.65,
  visible = true,
  reducedMotion,
  style,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const baseDPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(baseDPR);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geo = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uEnergy: { value: energy },
      uGlitch: { value: 0.0 },
      uPulse: { value: 0.0 },
      uVisible: { value: visible ? 1.0 : 0.0 },
      uMotionScale: { value: reducedMotion ? 0.0 : 1.0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
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

        uniform vec2  uRes;
        uniform vec2  uMouse;
        uniform float uTime;
        uniform float uEnergy;
        uniform float uGlitch;
        uniform float uPulse;
        uniform float uVisible;
        uniform float uMotionScale;

        #define PI 3.14159265359

        // High-quality hash & noise
        vec3 hash3(vec3 p) {
          p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
                   dot(p, vec3(269.5, 183.3, 246.1)),
                   dot(p, vec3(113.5, 271.9, 124.6)));
          return fract(sin(p) * 43758.5453123);
        }

        float noise(vec3 p) {
          vec3 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(dot(hash3(i+vec3(0,0,0)), f-vec3(0,0,0)),
                    dot(hash3(i+vec3(1,0,0)), f-vec3(1,0,0)), f.x),
                mix(dot(hash3(i+vec3(0,1,0)), f-vec3(0,1,0)),
                    dot(hash3(i+vec3(1,1,0)), f-vec3(1,1,0)), f.x), f.y),
            mix(mix(dot(hash3(i+vec3(0,0,1)), f-vec3(0,0,1)),
                    dot(hash3(i+vec3(1,0,1)), f-vec3(1,0,1)), f.x),
                mix(dot(hash3(i+vec3(0,1,1)), f-vec3(0,1,1)),
                    dot(hash3(i+vec3(1,1,1)), f-vec3(1,1,1)), f.x), f.y), f.z);
        }

        float fbm(vec3 p) {
          float v = 0.0, a = 0.5;
          for(int i=0; i<6; i++) {
            v += a * noise(p);
            p *= 2.03;
            a *= 0.5;
          }
          return v;
        }

        // SDF primitives for body
        float sdSphere(vec3 p, float r) { return length(p) - r; }
        
        float sdEllipsoid(vec3 p, vec3 r) {
          float k0 = length(p / r);
          float k1 = min(min(r.x, r.y), r.z);
          return (k0 - 1.0) * k1;
        }

        float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
          vec3 pa = p - a, ba = b - a;
          float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          return length(pa - ba * h) - r;
        }

        float smin(float a, float b, float k) {
          float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
          return mix(b, a, h) - k * h * (1.0 - h);
        }

        // Full humanoid body SDF
        float sdfBody(vec3 p) {
          // Mouse sway
          p.xy += uMouse.xy * 0.15;
          
          // HEAD
          vec3 headPos = p - vec3(0.0, 0.85, 0.0);
          float head = sdEllipsoid(headPos, vec3(0.18, 0.22, 0.18));
          
          // Eyes glow
          float eyeL = sdSphere(headPos - vec3(-0.08, 0.05, 0.15), 0.04);
          float eyeR = sdSphere(headPos - vec3( 0.08, 0.05, 0.15), 0.04);
          
          // NECK
          float neck = sdCapsule(p, vec3(0.0, 0.63, 0.0), vec3(0.0, 0.75, 0.0), 0.08);
          
          // TORSO (upper + lower)
          vec3 torsoPos = p - vec3(0.0, 0.25, 0.0);
          float torso = sdEllipsoid(torsoPos, vec3(0.22, 0.38, 0.15));
          
          // Core chakra glow (center of chest)
          float core = sdSphere(p - vec3(0.0, 0.35, 0.12), 0.08);
          
          // ARMS
          float armL = sdCapsule(p, vec3(-0.22, 0.50, 0.0), vec3(-0.35, -0.05, 0.05), 0.065);
          float armR = sdCapsule(p, vec3( 0.22, 0.50, 0.0), vec3( 0.35, -0.05, 0.05), 0.065);
          
          // HANDS
          float handL = sdSphere(p - vec3(-0.36, -0.10, 0.05), 0.08);
          float handR = sdSphere(p - vec3( 0.36, -0.10, 0.05), 0.08);
          
          // PELVIS
          vec3 pelvisPos = p - vec3(0.0, -0.15, 0.0);
          float pelvis = sdEllipsoid(pelvisPos, vec3(0.20, 0.15, 0.13));
          
          // LEGS
          float legL = sdCapsule(p, vec3(-0.10, -0.25, 0.0), vec3(-0.12, -0.85, 0.0), 0.08);
          float legR = sdCapsule(p, vec3( 0.10, -0.25, 0.0), vec3( 0.12, -0.85, 0.0), 0.08);
          
          // FEET
          float footL = sdEllipsoid(p - vec3(-0.12, -0.92, 0.05), vec3(0.08, 0.05, 0.12));
          float footR = sdEllipsoid(p - vec3( 0.12, -0.92, 0.05), vec3(0.08, 0.05, 0.12));
          
          // Combine all parts smoothly
          float body = head;
          body = smin(body, neck, 0.05);
          body = smin(body, torso, 0.12);
          body = smin(body, armL, 0.08);
          body = smin(body, armR, 0.08);
          body = smin(body, handL, 0.06);
          body = smin(body, handR, 0.06);
          body = smin(body, pelvis, 0.10);
          body = smin(body, legL, 0.08);
          body = smin(body, legR, 0.08);
          body = smin(body, footL, 0.06);
          body = smin(body, footR, 0.06);
          
          return body;
        }

        // Raymarch
        vec4 march(vec3 ro, vec3 rd) {
          float t = 0.0;
          vec3 pos;
          
          for(int i = 0; i < 100; i++) {
            pos = ro + rd * t;
            float d = sdfBody(pos);
            
            // Energy turbulence
            float turb = (fbm(pos * 2.5 + uTime * 0.4) - 0.5) * 0.04;
            turb *= (0.5 + uEnergy * 0.7 + uPulse * 0.4);
            d += turb;
            
            if(d < 0.001) return vec4(pos, 1.0);
            t += max(d * 0.8, 0.002);
            if(t > 5.0) break;
          }
          
          return vec4(pos, 0.0);
        }

        // Normal calculation
        vec3 calcNormal(vec3 p) {
          float e = 0.001;
          float d = sdfBody(p);
          return normalize(vec3(
            sdfBody(p + vec3(e,0,0)) - d,
            sdfBody(p + vec3(0,e,0)) - d,
            sdfBody(p + vec3(0,0,e)) - d
          ));
        }

        // Neural circuit pattern
        float circuits(vec3 p, vec3 n) {
          vec3 ap = abs(n) + 0.001;
          ap /= (ap.x + ap.y + ap.z);
          
          vec3 q = p * 8.0;
          float c = 0.0;
          
          // Horizontal lines
          c += ap.y * smoothstep(0.02, 0.0, abs(fract(q.x) - 0.5) - 0.45);
          c += ap.x * smoothstep(0.02, 0.0, abs(fract(q.y) - 0.5) - 0.45);
          
          // Vertical lines
          c += ap.z * smoothstep(0.02, 0.0, abs(fract(q.y) - 0.5) - 0.45);
          
          // Nodes at intersections
          vec3 id = floor(q);
          float node = smoothstep(0.08, 0.0, length(fract(q) - 0.5));
          c += node * (0.5 + 0.5 * sin(uTime * 2.0 + id.x + id.y + id.z));
          
          return clamp(c, 0.0, 1.0);
        }

        void main() {
          if(uVisible < 0.5) { discard; }

          vec2 uv = (vUv * 2.0 - 1.0);
          uv.x *= uRes.x / uRes.y;

          // Camera setup
          float camDist = 2.8;
          vec3 ro = vec3(0.0, 0.0, -camDist);
          vec3 rd = normalize(vec3(uv, 1.6));

          // Slight rotation
          float angle = sin(uTime * 0.15) * 0.08 * uMotionScale;
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          ro.xy *= rot;
          rd.xy *= rot;

          // Glitch
          if(uGlitch > 0.5) {
            float g = 0.01 * uMotionScale;
            ro.xy += vec2(sin(uTime * 25.0), cos(uTime * 23.0)) * g;
          }

          // Raymarch
          vec4 result = march(ro, rd);

          // BACKGROUND - Cosmic neural space
          vec3 col = vec3(0.02, 0.0, 0.08);
          
          // Radial energy waves
          float radial = length(uv);
          float waves = sin(radial * 20.0 - uTime * 2.0) * 0.5 + 0.5;
          waves *= smoothstep(1.5, 0.5, radial);
          col += vec3(0.3, 0.15, 0.5) * waves * 0.15;
          
          // Particle field
          vec3 starField = hash3(vec3(floor(uv * 50.0), floor(uTime * 0.5)));
          col += starField * 0.08;

          if(result.w > 0.5) {
            vec3 pos = result.xyz;
            vec3 normal = calcNormal(pos);

            // Lighting
            vec3 lightDir = normalize(vec3(0.5, 1.0, -0.5));
            float diff = max(dot(normal, lightDir), 0.0) * 0.4;

            // Fresnel glow
            float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 2.5);

            // Inner energy flow
            float flow = fbm(pos * 4.0 + uTime * 0.5);
            flow = pow(flow, 1.5);

            // BASE COLOR - Deep purple to bright violet
            vec3 baseColor = mix(
              vec3(0.15, 0.05, 0.35),  // Dark purple
              vec3(0.45, 0.25, 0.70),  // Medium purple
              flow * (0.5 + uEnergy * 0.5)
            );

            // CIRCUIT LINES
            float circuitPattern = circuits(pos, normal);
            vec3 circuitGlow = vec3(0.70, 0.45, 1.0) * circuitPattern * (0.8 + uEnergy * 0.4);

            // FRESNEL RIM
            vec3 rimColor = vec3(0.85, 0.60, 1.0) * fresnel * (0.6 + uEnergy * 0.6);

            // CORE CHAKRA GLOW (chest center)
            float coreGlow = smoothstep(0.15, 0.0, length(pos - vec3(0.0, 0.35, 0.12)));
            coreGlow *= (0.8 + 0.2 * sin(uTime * 3.0));
            vec3 coreColor = vec3(1.0, 0.85, 1.0) * coreGlow * 1.5;

            // EYES GLOW
            vec3 headPos = pos - vec3(0.0, 0.85, 0.0);
            float eyeGlowL = smoothstep(0.08, 0.0, length(headPos - vec3(-0.08, 0.05, 0.15)));
            float eyeGlowR = smoothstep(0.08, 0.0, length(headPos - vec3( 0.08, 0.05, 0.15)));
            float eyeGlow = max(eyeGlowL, eyeGlowR);
            eyeGlow *= (0.7 + 0.3 * sin(uTime * 4.0));
            vec3 eyeColor = vec3(1.0, 0.9, 1.0) * eyeGlow;

            // PULSE effect
            float pulseWave = sin(length(pos) * 10.0 - uTime * 5.0) * 0.5 + 0.5;
            pulseWave *= uPulse;
            vec3 pulseColor = vec3(0.9, 0.7, 1.0) * pulseWave * 0.3;

            // COMBINE
            vec3 finalColor = baseColor * (0.3 + diff);
            finalColor += circuitGlow;
            finalColor += rimColor;
            finalColor += coreColor;
            finalColor += eyeColor;
            finalColor += pulseColor;

            // OUTER AURA (like in the image)
            float auraDist = sdfBody(pos + rd * 0.03);
            float aura = smoothstep(0.0, 0.15, 0.15 - auraDist);
            vec3 auraColor = vec3(0.50, 0.30, 0.85) * aura * 0.25;

            col = mix(col, finalColor, 0.95) + auraColor;
          }

          // COSMIC RAYS (emanating from body)
          float rays = 0.0;
          float rayAngle = atan(uv.y, uv.x);
          for(int i = 0; i < 12; i++) {
            float a = float(i) * PI / 6.0 + uTime * 0.1;
            float rayDist = abs(rayAngle - a);
            rayDist = min(rayDist, abs(rayAngle - a + PI * 2.0));
            rayDist = min(rayDist, abs(rayAngle - a - PI * 2.0));
            rays += smoothstep(0.02, 0.0, rayDist) * (0.5 + 0.5 * sin(uTime * 2.0 + float(i)));
          }
          rays *= smoothstep(0.3, 1.0, length(uv)) * smoothstep(1.8, 1.2, length(uv));
          col += vec3(0.4, 0.25, 0.7) * rays * 0.15 * uEnergy;

          // Vignette
          float vignette = smoothstep(1.4, 0.3, length(uv));
          col *= vignette;

          // Gamma
          col = pow(col, vec3(0.85));

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    // Mouse tracking
    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      material.uniforms.uMouse.value.set((x - 0.5) * 2.0, (0.5 - y) * 2.0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Control events
    const onCtl = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      if (typeof d.energy === "number") {
        material.uniforms.uEnergy.value = Math.max(0, Math.min(1, d.energy / 100));
      }
      const actions: string[] = Array.isArray(d.actions) ? d.actions : [];
      material.uniforms.uPulse.value = actions.includes("pulse") ? 1.0 : 0.0;
      material.uniforms.uGlitch.value = actions.includes("glitch") ? 1.0 : 0.0;
    };
    window.addEventListener("mnexctl", onCtl as any);

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      material.uniforms.uRes.value.set(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);
    onResize();

    // Animation loop
    let raf = 0;
    const tick = () => {
      if (document.hidden) { raf = requestAnimationFrame(tick); return; }
      material.uniforms.uTime.value += 0.016;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mnexctl", onCtl as any);
      ro.disconnect();
      mount.removeChild(renderer.domElement);
      geo.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [energy, visible, reducedMotion]);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "transparent",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

