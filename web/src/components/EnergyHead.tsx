// web/src/components/EnergyHead.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Optional: if you use postprocessing later, you can swap renderer.render→composer.render.
// This version keeps it dependency-free for quick testing.

type Props = {
  /** 0..1 initial energy (intensity of glow, turbulence, breathing) */
  energy?: number;
  /** Hide/show the head without unmounting */
  visible?: boolean;
  /** Respect reduced motion (disables glitch & heavy animation) */
  reducedMotion?: boolean;
  /** Style override for the container */
  style?: React.CSSProperties;
};

export default function EnergyHead({
  energy = 0.65,
  visible = true,
  reducedMotion,
  style,
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // DPR cap for perf
    const baseDPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(baseDPR);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // Fullscreen orthographic quad
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geo = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uEnergy: { value: energy }, // 0..1
      uGlitch: { value: 0.0 },    // 0 or 1 (mnexctl action)
      uPulse: { value: 0.0 },     // 0 or 1 (mnexctl action)
      uVisible: { value: visible ? 1.0 : 0.0 },
      uMotionScale: { value: reducedMotion ? 0.0 : 1.0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
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

        // ===== util: hash / noise / fbm =====
        float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1,311.7,74.7))) * 43758.5453); }
        float noise(vec3 p){
          vec3 i = floor(p), f = fract(p);
          float a = hash(i + vec3(0,0,0));
          float b = hash(i + vec3(1,0,0));
          float c = hash(i + vec3(0,1,0));
          float d = hash(i + vec3(1,1,0));
          float e = hash(i + vec3(0,0,1));
          float g = hash(i + vec3(1,0,1));
          float h = hash(i + vec3(0,1,1));
          float k = hash(i + vec3(1,1,1));
          vec3  u = f*f*(3.0-2.0*f);
          return mix(mix(mix(a,b,u.x),mix(c,d,u.x),u.y),
                     mix(mix(e,g,u.x),mix(h,k,u.x),u.y),u.z);
        }
        float fbm(vec3 p){
          float v = 0.0, a = 0.5;
          for (int i=0;i<5;i++){ v += a*noise(p); p *= 2.02; a *= 0.5; }
          return v;
        }

        // ===== SDF primitives =====
        float sdSphere(vec3 p, float r){ return length(p)-r; }
        float sdEllipsoid(vec3 p, vec3 r){
          float k0 = length(p/r);
          float k1 = min(min(r.x,r.y), r.z);
          return (k0 - 1.0) * k1;
        }
        // vertical cone (tip toward +y)
        float sdCone(vec3 p, float h, float r){
          vec2 q = vec2(length(p.xz), p.y);
          vec2 k = normalize(vec2(r, h));
          return max(dot(q, k), -q.y);
        }
        float sUnion(float a, float b){ return min(a,b); }
        float sSmoothUnion(float a, float b, float k){
          float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
          return mix(b, a, h) - k*h*(1.0-h);
        }
        float sSmoothSub(float a, float b, float k){
          return sSmoothUnion(a, -b, k);
        }

        // ===== head SDF (stylized) =====
        float sdfHead(vec3 p){
          // subtle mouse sway
          p.xy += uMouse.xy * 0.25;

          // skull + jaw
          float skull = sdSphere(p, 0.58);
          float jaw   = sdEllipsoid(p + vec3(0.0, 0.18, 0.0), vec3(0.50, 0.36, 0.58));
          float head  = sSmoothUnion(skull, jaw, 0.22);

          // carve eye sockets
          float eyeL = sdSphere(p + vec3(-0.20, -0.05, 0.38), 0.13);
          float eyeR = sdSphere(p + vec3( 0.20, -0.05, 0.38), 0.13);
          head = sSmoothSub(head, eyeL, 0.12);
          head = sSmoothSub(head, eyeR, 0.12);

          // small nose ridge
          float nose = sdCone(p + vec3(0.0, 0.02, 0.45), 0.18, 0.10);
          head = sUnion(head, nose);

          // lips hint (gentle indentation)
          float lip = sdEllipsoid(p + vec3(0.0, 0.18, 0.45), vec3(0.18, 0.06, 0.08));
          head = sSmoothSub(head, lip, 0.05);

          return head;
        }

        // Raymarch to surface
        float march(vec3 ro, vec3 rd, out vec3 pos){
          float t = 0.0;
          for (int i=0;i<110;i++){
            vec3 q = ro + rd*t;
            float d = sdfHead(q);

            // inner turbulence (energy & pulse)
            float pulse = (0.08 + 0.04*sin(uTime*2.0)) * uPulse * uMotionScale;
            float turb  = (fbm(q*3.0 + uTime*0.6) - 0.5) * (0.05 + uEnergy*0.06 + pulse);
            d += turb;

            if (d < 0.001) { pos = q; return t; }
            t += max(d*0.7, 0.002);
            if (t > 6.0) break;
          }
          pos = ro + rd*t;
          return -1.0;
        }

        float mapOnly(vec3 p){ return sdfHead(p); }

        vec3 calcNormal(vec3 p){
          float e=0.002;
          float d=mapOnly(p);
          vec3 n = normalize(vec3(
            mapOnly(p+vec3(e,0,0))-d,
            mapOnly(p+vec3(0,e,0))-d,
            mapOnly(p+vec3(0,0,e))-d
          ));
          return n;
        }

        // simple tri-planar circuit stripes
        float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float circuitLayer(vec2 uv){
          vec2 g = floor(uv) + vec2(hash2(floor(uv)), hash2(floor(uv)+1.0));
          float d = length(fract(uv)-fract(g));
          return smoothstep(0.015, 0.0, d);
        }
        float circuitsTriplanar(vec3 p, vec3 n){
          vec3 an = abs(n)+0.001; an /= (an.x+an.y+an.z);
          vec3 tp = p*6.0;
          float l = 0.0;
          l += an.x * circuitLayer(tp.yz);
          l += an.y * circuitLayer(tp.xz);
          l += an.z * circuitLayer(tp.xy);
          return clamp(l,0.0,1.0);
        }

        float eyeMask(vec3 p, vec3 c, float r){
          return smoothstep(r, r-0.02, length(p-c));
        }

        void main(){
          if (uVisible < 0.5) { discard; }

          vec2 uv = (vUv*2.0 - 1.0);
          uv.x *= uRes.x / uRes.y;

          // orbit the head slightly
          float orbit = 0.32 + 0.18*sin(uTime * 0.25) * uMotionScale;
          mat2 R = mat2(cos(orbit), -sin(orbit), sin(orbit), cos(orbit));

          vec3 ro = vec3(0.0, 0.0, -2.2);
          vec3 rd = normalize(vec3(uv, 1.28));

          ro.xy = R * ro.xy;
          rd.xy = R * rd.xy;

          // mild glitch jitter
          float g = uGlitch * uMotionScale * 0.005;
          ro.xy += vec2(
            sin(uTime*17.0)*g,
            cos(uTime*13.0)*g
          );

          vec3 pos;
          float hit = march(ro, rd, pos);

          // background void
          vec3 col = vec3(0.01, 0.0, 0.06);
          float bg = fbm(vec3(uv*2.0, uTime*0.2));
          col += vec3(0.35,0.2,0.7) * 0.12 * bg;

          if (hit > 0.0){
            vec3 n = calcNormal(pos);

            float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
            float inner = fbm(pos*6.0 + uTime*0.8) * (0.6 + uEnergy*0.8);

            // emission & rim (purple)
            vec3 glow = vec3(0.66,0.52,1.0) * (0.25 + 0.75*inner);
            vec3 rim  = vec3(0.62,0.35,1.0) * (0.45 + 0.85*fres);

            // circuits
            float cl = circuitsTriplanar(pos, n);
            vec3 circuitGlow = vec3(0.72,0.54,1.0) * cl * 0.35;

            // emissive eyes (track with mouse sway)
            float el = eyeMask(pos, vec3(-0.20,-0.05,0.38), 0.10);
            float er = eyeMask(pos, vec3( 0.20,-0.05,0.38), 0.10);
            float eyes = clamp(el+er, 0.0, 1.0);
            vec3 eyeGlow = vec3(0.98,0.86,1.0) * (0.4 + 0.6*sin(uTime*5.0)) * eyes;

            // slight lip motion while "speaking" (uPulse)
            float mouth = smoothstep(0.0, 0.1, abs(sin(uTime*6.0)) * uPulse * uMotionScale);
            vec3 mouthTint = vec3(0.9,0.6,1.0) * mouth * 0.2;

            vec3 face = glow*0.75 + rim*0.6 + circuitGlow + eyeGlow + mouthTint;

            // aura
            float aura = smoothstep(0.0, 0.06, 0.06 - mapOnly(pos + rd*0.02));
            col = mix(col, face, 0.96) + vec3(0.55,0.34,1.0) * 0.09 * aura;
          }

          // vignette
          float r = length((vUv - 0.5) * 2.0);
          col *= smoothstep(1.15, 0.62, r);

          // gamma
          col = pow(col, vec3(0.9));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    // pointer sway (doesn't block UI)
    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      material.uniforms.uMouse.value.set((x - 0.5) * 2.0, (0.5 - y) * 2.0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // mnexctl control (energy/actions)
    const onCtl = (e: Event) => {
      const d = (e as CustomEvent).detail || {};
      if (typeof d.energy === "number") {
        const mapped = Math.max(0, Math.min(1, d.energy / 100));
        material.uniforms.uEnergy.value = mapped;
      }
      const actions: string[] = Array.isArray(d.actions) ? d.actions : [];
      material.uniforms.uPulse.value = actions.includes("pulse") ? 1.0 : 0.0;
      material.uniforms.uGlitch.value = actions.includes("glitch") ? 1.0 : 0.0;
    };
    window.addEventListener("mnexctl", onCtl as any);

    // resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      material.uniforms.uRes.value.set(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);
    onResize();

    // animation loop with page-visibility throttle
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

