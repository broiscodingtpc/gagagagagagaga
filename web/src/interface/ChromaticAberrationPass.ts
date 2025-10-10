import * as THREE from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js';

export class ChromaticAberrationPass extends Pass {
  public pass: THREE.ShaderPass;

  constructor() {
    super();

    const shader = {
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uIntensity: { value: 0.002 }
      },
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uIntensity;

        varying vec2 vUv;

        void main() {
          // Chromatic aberration effect
          float aberration = uIntensity;

          // Sample colors with offset
          vec2 rUv = vUv + vec2(aberration * sin(uTime), aberration * cos(uTime));
          vec2 gUv = vUv;
          vec2 bUv = vUv - vec2(aberration * sin(uTime), aberration * cos(uTime));

          vec4 r = texture2D(tDiffuse, rUv);
          vec4 g = texture2D(tDiffuse, gUv);
          vec4 b = texture2D(tDiffuse, bUv);

          gl_FragColor = vec4(r.r, g.g, b.b, (r.a + g.a + b.a) / 3.0);
        }
      `
    };

    this.pass = new THREE.ShaderPass(shader);
    this.pass.renderToScreen = true;
  }

  setIntensity(intensity: number) {
    this.pass.uniforms.uIntensity.value = intensity;
  }

  setTime(time: number) {
    this.pass.uniforms.uTime.value = time;
  }
}
