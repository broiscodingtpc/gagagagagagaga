import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

interface EnergyFaceProps {
  energy?: number;
}

export default function EnergyFace({ energy = 0.65 }: EnergyFaceProps){
  const mountRef = useRef<HTMLDivElement|null>(null);
  const [debug, setDebug] = useState(false); // press "D" to toggle

  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geo = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
      uTime:   { value: 0 },
      uRes:    { value: new THREE.Vector2(1,1) },
      uMouse:  { value: new THREE.Vector2(0.0, 0.0) },
      uEnergy: { value: energy },
      uDebug:  { value: 0.0 } // 0=beauty, 1=distance debug
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: /* glsl */`
        varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.0); }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        varying vec2 vUv;
        uniform vec2  uRes;
        uniform vec2  uMouse;
        uniform float uTime;
        uniform float uEnergy;
        uniform float uDebug;
        // --- noise/fbm ---
        float hash(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
        float noise(vec3 p){
          vec3 i=floor(p), f=fract(p);
          float a=hash(i+vec3(0,0,0));
          float b=hash(i+vec3(1,0,0));
          float c=hash(i+vec3(0,1,0));
          float d=hash(i+vec3(1,1,0));
          float e=hash(i+vec3(0,0,1));
          float g=hash(i+vec3(1,0,1));
          float h=hash(i+vec3(0,1,1));
          float k=hash(i+vec3(1,1,1));
          vec3  u=f*f*(3.0-2.0*f);
          return mix(mix(mix(a,b,u.x),mix(c,d,u.x),u.y),
                     mix(mix(e,g,u.x),mix(h,k,u.x),u.y),u.z);
        }
        float fbm(vec3 p){
          float v=0.0, a=0.5; 
          for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.01; a*=0.5; }
          return v;
        }
        // --- SDF primitives ---
        float sdSphere(vec3 p, float r){ return length(p)-r; }
        float sdEllipsoid(vec3 p, vec3 r){ return (length(p/r)-1.0)*min(min(r.x,r.y),r.z); }
        float sdCone(vec3 p, float h, float r){
          vec2 q = vec2(length(p.xz), p.y);
          vec2 k = normalize(vec2(r,h));
          float d = max(dot(q,k), -q.y);
          return d;
        }
        float opSmoothUnion(float d1, float d2, float k){
          float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
          return mix(d2, d1, h) - k*h*(1.0-h);
        }
        float opSmoothSub(float d1, float d2, float k){
          return opSmoothUnion(d1, -d2, k);
        }
        // --- head SDF ---
        float sdfHead(vec3 p){
          p.xy += (uMouse.xy*0.25);
          float skull = sdSphere(p, 0.55);
          float jaw   = sdEllipsoid(p + vec3(0.0, 0.15, 0.0), vec3(0.48, 0.35, 0.55));
          float head  = opSmoothUnion(skull, jaw, 0.2);
          float eyeL  = sdSphere(p + vec3(-0.18,-0.05,0.4), 0.12);
          float eyeR  = sdSphere(p + vec3( 0.18,-0.05,0.4), 0.12);
          head = opSmoothSub(head, eyeL, 0.12);
          head = opSmoothSub(head, eyeR, 0.12);
          float nose  = sdCone(p + vec3(0.0,0.0,0.45), 0.18, 0.10);
          head = opSmoothUnion(head, nose, 0.05);
          return head;
        }
        float march(vec3 ro, vec3 rd, out vec3 pos){
          float t=0.0;
          for(int i=0;i<120;i++){
            vec3 p = ro + rd*t;
            float d = sdfHead(p);
            d += (fbm(p*3.0 + uTime*0.6) - 0.5) * 0.05 * (0.5 + uEnergy*1.2); // turbulence
            if(d<0.001){ pos=p; return t; }
            t += max(d*0.7, 0.002);
            if(t>6.0) break;
          }
          pos = ro + rd*t; 
          return -1.0;
        }
        float mapOnly(vec3 p){ return sdfHead(p); }
        vec3 calcNormal(vec3 p){
          float e=0.002;
          float d=mapOnly(p);
          vec3 n=normalize(vec3(
            mapOnly(p+vec3(e,0,0))-d,
            mapOnly(p+vec3(0,e,0))-d,
            mapOnly(p+vec3(0,0,e))-d
          ));
          return n;
        }
        // circuits (simple tri-planar)
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
          vec2 uv = (vUv*2.0-1.0);
          uv.x *= uRes.x/uRes.y;

          // camera & slight auto-orbit
          float ang = 0.35 + 0.2*sin(uTime*0.3);
          mat2 R = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
          vec3 ro = vec3(0.0, 0.0, -2.2);
          vec3 rd = normalize(vec3(uv, 1.3));
          ro.xy = R * ro.xy; rd.xy = R * rd.xy;

          vec3 pos;
          float hit = march(ro, rd, pos);

          // distance debug view
          if(uDebug>0.5){
            if(hit>0.0){
              float d = mapOnly(pos);
              float g = smoothstep(0.02, 0.0, abs(d));
              gl_FragColor = vec4(vec3(g, 0.2, g), 1.0);
            } else {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
            return;
          }

          // background
          vec3 col = vec3(0.01, 0.0, 0.05);
          float bg = fbm(vec3(uv*2.0, uTime*0.2));
          col += vec3(0.35,0.2,0.7)*0.15*bg;

          if(hit>0.0){
            vec3 n = calcNormal(pos);
            float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
            float inner = fbm(pos*6.0 + uTime*0.8) * (0.6 + uEnergy*0.8);
            vec3 glow = vec3(0.65,0.5,1.0) * (0.25 + 0.75*inner);
            vec3 rim  = vec3(0.6,0.3,1.0) * (0.5 + 0.8*fres);

            float cLines = circuitsTriplanar(pos, n);
            vec3 circuitGlow = vec3(0.7,0.5,1.0) * cLines * 0.35;

            float el = eyeMask(pos, vec3(-0.18,-0.05,0.4), 0.09);
            float er = eyeMask(pos, vec3( 0.18,-0.05,0.4), 0.09);
            float eyes = clamp(el+er, 0.0, 1.0);
            vec3 eyeGlow = vec3(0.95,0.8,1.0)*(0.4 + 0.6*sin(uTime*5.0)) * eyes;

            vec3 face = glow*0.7 + rim*0.6 + circuitGlow + eyeGlow;

            float aura = smoothstep(0.0, 0.06, 0.06 - mapOnly(pos + rd*0.02));
            col = mix(col, face, 0.95) + vec3(0.5,0.3,1.0)*0.08*aura;
          }

          float r = length((vUv-0.5)*2.0);
          col *= smoothstep(1.15, 0.6, r);
          col = pow(col, vec3(0.9));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      transparent: true
    });

    const mesh = new THREE.Mesh(geo, material);
    scene.add(mesh);

    // Post FX
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1,1), 1.2, 0.4, 0.85);
    composer.addPass(bloom);

    // mouse
    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      material.uniforms.uMouse.value.set((x-0.5)*2.0, (0.5-y)*2.0);
    };
    window.addEventListener("mousemove", onMove);

    // resize
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false);
      material.uniforms.uRes.value.set(w, h);
      composer.setSize(w, h); bloom.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize); ro.observe(mount); onResize();

    // debug toggle (press D)
    const onKey = (e: KeyboardEvent) => {
      if(e.key.toLowerCase()==="d"){
        setDebug(v => {
          const nv = !v; material.uniforms.uDebug.value = nv ? 1.0 : 0.0; return nv;
        });
      }
    };
    window.addEventListener("keydown", onKey);

    let raf = 0;
    const tick = () => {
      material.uniforms.uTime.value += 0.016;
      material.uniforms.uEnergy.value = energy;
      composer.render();
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("keydown", onKey);
      ro.disconnect();
      mount.removeChild(renderer.domElement);
      geo.dispose(); material.dispose(); renderer.dispose();
    };
  }, [energy]);

  return <div ref={mountRef} style={{position:"fixed", inset:0, background:"transparent"}} title="Press D to debug" />;
}