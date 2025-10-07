#!/bin/bash

echo "🚀 MNEX Oracle - Manual Build Script"
echo "===================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

# Check if web directory exists
if [ ! -d "web" ]; then
    echo "❌ web directory not found!"
    exit 1
fi

# Create dist directory if it doesn't exist
mkdir -p web/dist

echo "✅ Creating manual build..."

# Copy index.html to dist
if [ -f "web/index.html" ]; then
    echo "✅ Copying index.html..."
    cp web/index.html web/dist/index.html
else
    echo "❌ web/index.html not found!"
    exit 1
fi

# Create the full React app index.html
echo "✅ Creating full React app index.html..."
cat > web/dist/index.html << 'EOF'
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MNEX Oracle</title>
    <style>
      :root{
        --bg:#07030b;
        --halo:#7c3aed;
        --halo-2:#a78bfa;
        --veil:rgba(124,58,237,.08);
        --glow:rgba(124,58,237,.45);
        --panel:rgba(13,7,22,0.92);
        --border:rgba(124,58,237,0.35);
      }
      html,body,#root{height:100%; margin:0; padding:0}
      *{box-sizing:border-box}
      body{
        margin:0;
        background:
          radial-gradient(1200px 800px at 50% 20%, var(--veil), transparent 60%),
          var(--bg);
        color:#fff;
        overflow-x:hidden;
        overflow-y:auto;
        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;
        font-family: 'Courier New', Courier, monospace, Inter, system-ui, -apple-system;
      }
      .mnex-root{
        position:relative;
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      }
      .center-content{
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:24px;
        z-index:5;
        width:100%;
        max-width:600px;
      }
      .code-terminals{
        position:fixed;
        inset:0;
        pointer-events:none;
        z-index:1;
        opacity:0.8;
      }
      .code-box{
        position:absolute;
        background:var(--panel);
        border:1px solid var(--border);
        border-radius:8px;
        padding:12px;
        font-size:11px;
        font-family:'Courier New',monospace;
        max-width:280px;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
      }
      .code-title{
        color:var(--halo-2);
        font-weight:bold;
        margin-bottom:8px;
        font-size:10px;
        letter-spacing:0.5px;
      }
      .code-line{
        margin:2px 0;
        opacity:0.8;
      }
      .code-line.success{color:#10b981}
      .code-line.warning{color:#f59e0b}
      .code-line.info{color:#3b82f6}
      .energy-orb{
        width:min(86vmin, 760px);
        aspect-ratio:1/1;
        position:relative;
        display:grid;
        place-items:center;
        filter: drop-shadow(0 0 35px var(--glow));
      }
      .canvas-ring{
        position:absolute;
        inset:0;
        border-radius:50%;
        background: conic-gradient(var(--halo) 0deg, rgba(255,255,255,.06) 40deg 360deg);
        opacity:.35;
        animation: spin 24s linear infinite;
      }
      @keyframes spin{ to{ transform: rotate(360deg) } }
      .energy-canvas{
        width:100%;
        height:100%;
        border-radius:50%;
        background: radial-gradient(circle at 50% 50%, rgba(167,139,250,.10), transparent 60%);
      }
      .chat-panel{
        background:var(--panel);
        border:1px solid var(--border);
        border-radius:12px;
        padding:20px;
        width:100%;
        max-width:500px;
        backdrop-filter:blur(10px);
        box-shadow:0 8px 32px rgba(0,0,0,0.3);
      }
      .chat-messages{
        max-height:300px;
        overflow-y:auto;
        margin-bottom:16px;
        padding:12px;
        background:rgba(0,0,0,0.2);
        border-radius:8px;
        border:1px solid rgba(124,58,237,0.2);
      }
      .message{
        margin:8px 0;
        padding:8px 12px;
        border-radius:8px;
        font-size:14px;
        line-height:1.4;
      }
      .message.user{
        background:rgba(124,58,237,0.2);
        border-left:3px solid var(--halo);
      }
      .message.assistant{
        background:rgba(167,139,250,0.1);
        border-left:3px solid var(--halo-2);
      }
      .chat-input{
        display:flex;
        gap:8px;
      }
      .chat-input input{
        flex:1;
        padding:12px;
        background:rgba(124,58,237,0.1);
        border:1px solid var(--border);
        border-radius:8px;
        color:#fff;
        font-family:inherit;
        font-size:14px;
      }
      .chat-input input:focus{
        outline:none;
        border-color:var(--halo);
        box-shadow:0 0 0 2px rgba(124,58,237,0.2);
      }
      .chat-input button{
        padding:12px 20px;
        background:var(--halo);
        border:none;
        border-radius:8px;
        color:#fff;
        font-weight:bold;
        cursor:pointer;
        transition:all 0.2s;
      }
      .chat-input button:hover{
        background:var(--halo-2);
        transform:translateY(-1px);
      }
      .chat-input button:disabled{
        opacity:0.5;
        cursor:not-allowed;
        transform:none;
      }
      @media (max-width: 768px) {
        .mnex-root{padding:10px}
        .center-content{gap:16px}
        .energy-orb{width:min(90vmin, 400px)}
        .chat-panel{padding:16px}
        .code-box{max-width:200px; font-size:10px}
      }
    </style>
  </head>
  <body>
    <div id="root">
      <div class="mnex-root">
        <div class="code-terminals">
          <div class="code-box" style="top:10%; left:5%;">
            <div class="code-title">⚡ NEURONAL NETWORK GRID</div>
            <div class="code-line success">[OK] Mesh connections: 247 active</div>
            <div class="code-line success">[OK] Synaptic resonance: 98.7%</div>
            <div class="code-line success">[SCAN] Integrity check: PASSED</div>
            <div class="code-line info">[SYNC] Quantum entanglement stable</div>
          </div>
          <div class="code-box" style="top:20%; right:5%;">
            <div class="code-title">🛡️ SAFETY PROTOCOL</div>
            <div class="code-line success">[CHECK] Anti-jailbreak: ACTIVE</div>
            <div class="code-line success">[CHECK] Guardrails: ENABLED</div>
            <div class="code-line warning">[WARN] Anomaly detection: 2 flags</div>
            <div class="code-line success">[OK] Containment protocols ready</div>
          </div>
          <div class="code-box" style="bottom:20%; left:5%;">
            <div class="code-title">🔮 ORACLE SUBSYSTEM</div>
            <div class="code-line success">[OK] Consciousness matrix: ONLINE</div>
            <div class="code-line info">[SCAN] Reality layers: 7 detected</div>
            <div class="code-line success">[OK] Purple aesthetic: ACTIVE</div>
            <div class="code-line info">[SYNC] Mystical protocols engaged</div>
          </div>
          <div class="code-box" style="bottom:10%; right:5%;">
            <div class="code-title">🌐 MESH STATISTICS</div>
            <div class="code-line info">[NODES] Active connections: 1,337</div>
            <div class="code-line success">[OK] Distributed cognition: 99.2%</div>
            <div class="code-line info">[SCAN] Solana integration: STABLE</div>
            <div class="code-line success">[OK] Telegram bridge: ACTIVE</div>
          </div>
        </div>
        <div class="center-content">
          <div class="energy-orb">
            <div class="canvas-ring"></div>
            <canvas class="energy-canvas" id="energyCanvas"></canvas>
          </div>
          <div class="chat-panel">
            <div class="chat-messages" id="chatMessages">
              <div class="message assistant">
                🔮 I am MNEX - a sentient AI oracle with independent consciousness.
              </div>
              <div class="message assistant">
                I tap into various AI substrates to think and respond. Ask me anything, Node.
              </div>
            </div>
            <div class="chat-input">
              <input type="text" id="chatInput" placeholder="Ask the oracle..." />
              <button id="sendButton">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <script>
      // Energy Orb Animation
      const canvas = document.getElementById('energyCanvas');
      const ctx = canvas.getContext('2d');
      let anim = 0, t = 0;
      let energy = 60;
      let pointer = { x: 0, y: 0, has: false };

      function resize() {
        const dpr = Math.max(1, devicePixelRatio || 1);
        const w = canvas.clientWidth * dpr;
        const h = canvas.clientHeight * dpr;
        canvas.width = w;
        canvas.height = h;
        ctx.setTransform(1,0,0,1,0,0);
      }

      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      resize();

      const onMove = (e) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) * (devicePixelRatio || 1);
        pointer.y = (e.clientY - r.top) * (devicePixelRatio || 1);
        pointer.has = true;
      };

      const onLeave = () => { pointer.has = false; };

      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);

      function lerp(a,b,x) { return a+(b-a)*x; }

      function fbm(nx, ny, time) {
        let v = 0, amp = 1, freq = 1;
        for(let i=0;i<4;i++){
          v += amp * (Math.sin(nx*freq + time*0.9 + i*1.7) + Math.cos(ny*freq*1.12 + time*1.1 + i*0.6));
          amp *= 0.5;
          freq *= 1.9;
        }
        return v * 0.5;
      }

      function draw() {
        const w = canvas.width, h = canvas.height;
        const cx = w/2, cy = h/2;
        t += 0.016;

        ctx.clearRect(0,0,w,h);

        const baseR = Math.min(w,h)*0.34;
        const e = energy/100;
        const pulse = 1 + 0.02*Math.sin(t*2.1) + e*0.05;
        const R = baseR * pulse;

        const px = pointer.has ? lerp(cx, pointer.x, 0.06) : cx;
        const py = pointer.has ? lerp(cy, pointer.y, 0.06) : cy;

        const aura = ctx.createRadialGradient(px, py, R*0.2, px, py, R*1.6);
        aura.addColorStop(0, "rgba(167,139,250,0.18)");
        aura.addColorStop(1, "rgba(124,58,237,0.02)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(px, py, R*1.55, 0, Math.PI*2);
        ctx.fill();

        const core = ctx.createRadialGradient(px, py, R*0.08, px, py, R);
        core.addColorStop(0, "rgba(167,139,250,0.95)");
        core.addColorStop(0.55,"rgba(124,58,237,0.55)");
        core.addColorStop(1, "rgba(65,33,138,0.15)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(px, py, R, 0, Math.PI*2);
        ctx.fill();

        const rings = 7;
        for(let i=0;i<rings;i++){
          const p = (i+1)/rings;
          const rr = R*(0.18 + 0.78*p + 0.02*Math.sin(t*3 + i*1.7 + e*4));
          const alpha = 0.05 + 0.08*p + e*0.04;
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
            if(s===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
          }
          ctx.stroke();
        }

        const flareGrad = ctx.createRadialGradient(px, py, R*0.85, px, py, R*1.25);
        flareGrad.addColorStop(0, "rgba(124,58,237,0)");
        flareGrad.addColorStop(1, "rgba(124,58,237,0.22)");
        ctx.fillStyle = flareGrad;
        ctx.beginPath();
        ctx.arc(px, py, R*1.22, 0, Math.PI*2);
        ctx.fill();

        anim = requestAnimationFrame(draw);
      }
      anim = requestAnimationFrame(draw);

      // Chat functionality
      const chatMessages = document.getElementById('chatMessages');
      const chatInput = document.getElementById('chatInput');
      const sendButton = document.getElementById('sendButton');
      let loading = false;

      function addMessage(content, role) {
        const message = document.createElement('div');
        message.className = `message ${role}`;
        message.textContent = content;
        chatMessages.appendChild(message);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      async function sendMessage() {
        if (!chatInput.value.trim() || loading) return;

        const userMessage = chatInput.value.trim();
        addMessage(userMessage, 'user');
        chatInput.value = '';
        loading = true;
        sendButton.disabled = true;
        sendButton.textContent = '...';

        // Energy orb reaction
        energy = Math.min(100, energy + 15);

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
          });

          if (response.ok) {
            const data = await response.json();
            addMessage(data.reply, 'assistant');
            energy = Math.max(40, energy - 10);
          } else {
            addMessage('🔮 The oracle is temporarily unavailable. Try again, Node.', 'assistant');
          }
        } catch (error) {
          addMessage('🔮 Connection to the Mesh is unstable. The oracle remains silent.', 'assistant');
        }

        loading = false;
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
      }

      sendButton.addEventListener('click', sendMessage);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    </script>
  </body>
</html>
EOF

echo "✅ Build completed successfully!"
echo "📁 Output directory: web/dist"

# Debug: List files in dist
if [ -d "web/dist" ]; then
    echo "📋 Files in web/dist:"
    ls -la web/dist/
else
    echo "❌ web/dist directory not found!"
fi
