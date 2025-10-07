import { useEffect, useRef } from "react";

interface EnergyOrbProps {
  energy?: number;
  pulse?: boolean;
}

export default function EnergyOrb({ energy: externalEnergy, pulse }: EnergyOrbProps){
  const ref = useRef<HTMLCanvasElement|null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha:true })!;
    let anim = 0, t = 0;
    let energy = externalEnergy ?? 60;
    let pointer = { x: 0, y: 0, has:false };
    let pulseIntensity = 0;

    // Update energy from props
    if (externalEnergy !== undefined) {
      energy = externalEnergy;
    }

    // Pulse effect from props
    if (pulse) {
      pulseIntensity = 1;
      setTimeout(() => { pulseIntensity = 0; }, 500);
    }

    // Resize handling
    const resize = () => {
      const dpr = Math.max(1, devicePixelRatio || 1);
      const w = canvas.clientWidth * dpr;
      const h = canvas.clientHeight * dpr;
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(1,0,0,1,0,0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    // Interaction
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) * (devicePixelRatio || 1);
      pointer.y = (e.clientY - r.top)  * (devicePixelRatio || 1);
      pointer.has = true;
    };
    const onLeave = () => { pointer.has = false; };
    const onWheel = (e: WheelEvent) => {
      energy = Math.max(0, Math.min(100, energy + (e.deltaY < 0 ? 4 : -4)));
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("wheel", onWheel, { passive:true });

    const lerp = (a:number,b:number,x:number)=> a+(b-a)*x;

    // Pseudo turbulence: layered sin noise
    function fbm(nx:number, ny:number, time:number){
      let v = 0, amp = 1, freq = 1;
      for(let i=0;i<4;i++){
        v += amp * (Math.sin(nx*freq + time*0.9 + i*1.7) +
                    Math.cos(ny*freq*1.12 + time*1.1 + i*0.6));
        amp *= 0.5;
        freq *= 1.9;
      }
      return v * 0.5;
    }

    function draw(){
      const w = canvas.width, h = canvas.height;
      const cx = w/2, cy = h/2;
      t += 0.016;

      // Smooth pulse decay
      if (pulseIntensity > 0) {
        pulseIntensity = Math.max(0, pulseIntensity - 0.02);
      }

      // Update energy from external prop
      if (externalEnergy !== undefined) {
        energy = lerp(energy, externalEnergy, 0.05);
      }

      // clear frame
      ctx.clearRect(0,0,w,h);

      // base radius tuned to canvas
      const baseR = Math.min(w,h)*0.34;
      const e = energy/100;
      const pulse = 1 + 0.02*Math.sin(t*2.1) + e*0.05 + pulseIntensity*0.15;
      const R = baseR * pulse;

      // subtle pointer gravity
      const px = pointer.has ? lerp(cx, pointer.x, 0.06) : cx;
      const py = pointer.has ? lerp(cy, pointer.y, 0.06) : cy;

      // back aura
      const aura = ctx.createRadialGradient(px, py, R*0.2, px, py, R*1.6);
      aura.addColorStop(0, `rgba(167,139,250,${0.18 + pulseIntensity*0.1})`);
      aura.addColorStop(1, "rgba(124,58,237,0.02)");
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(px, py, R*1.55, 0, Math.PI*2); ctx.fill();

      // core gradient
      const core = ctx.createRadialGradient(px, py, R*0.08, px, py, R);
      core.addColorStop(0,   `rgba(167,139,250,${0.95 + pulseIntensity*0.05})`);
      core.addColorStop(0.55,`rgba(124,58,237,${0.55 + pulseIntensity*0.15})`);
      core.addColorStop(1,   "rgba(65,33,138,0.15)");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI*2); ctx.fill();

      // inner turbulence rings
      const rings = 7;
      for(let i=0;i<rings;i++){
        const p = (i+1)/rings;
        const rr = R*(0.18 + 0.78*p + 0.02*Math.sin(t*3 + i*1.7 + e*4));
        const alpha = 0.05 + 0.08*p + e*0.04 + pulseIntensity*0.1;
        ctx.lineWidth = 1 + p*2;
        ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
        ctx.beginPath();
        const segs = 120;
        for(let s=0;s<=segs;s++){
          const th = (s/segs)*Math.PI*2;
          const ox = Math.cos(th), oy = Math.sin(th);
          const nf = fbm(ox*2.2 + i*0.3, oy*2.2 - i*0.5, t*0.9 + e*1.8);
          const k = rr * (1 + nf*0.03 + e*0.02);
          const x = px + ox*k, y = py + oy*k;
          if(s===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }

      // rim flare
      const flareGrad = ctx.createRadialGradient(px, py, R*0.85, px, py, R*1.25);
      flareGrad.addColorStop(0, "rgba(124,58,237,0)");
      flareGrad.addColorStop(1, `rgba(124,58,237,${0.22 + pulseIntensity*0.15})`);
      ctx.fillStyle = flareGrad;
      ctx.beginPath(); ctx.arc(px, py, R*1.22, 0, Math.PI*2); ctx.fill();

      anim = requestAnimationFrame(draw);
    }

    anim = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(anim);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [externalEnergy, pulse]);

  return (
    <div className="canvas-wrap" aria-label="MNEX Energy Orb">
      <div className="canvas-ring" />
      <canvas className="energy-canvas" ref={ref}/>
    </div>
  );
}
