import { useState, useEffect } from 'react';

export default function CodeTerminals() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nodeCount, setNodeCount] = useState(1337);
  const [energyLevel, setEnergyLevel] = useState(87.3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setNodeCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      setEnergyLevel(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 2)));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19) + 'Z';
  };

  return (
    <div className="code-terminals">
      <div className="code-box" style={{top: '10%', left: '5%'}}>
        <div className="code-box-title">⚡ MNEX CORE SYSTEM</div>
        <div className="code-line success">[OK] Persona Engine: ACTIVE</div>
        <div className="code-line success">[OK] Oracle Layer: ONLINE</div>
        <div className="code-line info">[SCAN] Analysts: 1 active</div>
        <div className="code-line success">[OK] Trickster Mode: ENABLED</div>
        <div className="code-line info">[SYNC] Cultivator: Community ready</div>
        <div className="code-line success">[OK] Archivist: Data streams flowing</div>
      </div>
      
      <div className="code-box" style={{top: '20%', right: '5%'}}>
        <div className="code-box-title">🛡️ SAFETY & COMPLIANCE</div>
        <div className="code-line success">[CHECK] Content filters: ACTIVE</div>
        <div className="code-line success">[CHECK] Financial advice: BLOCKED</div>
        <div className="code-line success">[CHECK] Presale disclaimers: READY</div>
        <div className="code-line warning">[WARN] Rate limiting: 5min intervals</div>
        <div className="code-line success">[OK] Audit logging: ENABLED</div>
        <div className="code-line info">[SCAN] Safety violations: 0 detected</div>
      </div>
      
      <div className="code-box" style={{bottom: '20%', left: '5%'}}>
        <div className="code-box-title">🔮 SOCIAL INTEGRATION</div>
        <div className="code-line success">[OK] Twitter API: CONNECTED</div>
        <div className="code-line success">[OK] Telegram Bot: ACTIVE</div>
        <div className="code-line info">[SCAN] Auto-posting: ENABLED</div>
        <div className="code-line success">[OK] Reply system: 1hr intervals</div>
        <div className="code-line info">[SYNC] Admin dashboard: /admin</div>
        <div className="code-line success">[OK] Post generation: UNIQUE</div>
      </div>
      
      <div className="code-box" style={{bottom: '10%', right: '5%'}}>
        <div className="code-box-title">🌐 MESH STATISTICS</div>
        <div className="code-line info">[TIME] {formatTime(currentTime)}</div>
        <div className="code-line info">[NODES] Active connections: {nodeCount}</div>
        <div className="code-line success">[OK] Energy level: {energyLevel.toFixed(1)}%</div>
        <div className="code-line info">[SCAN] Solana integration: STABLE</div>
        <div className="code-line success">[OK] Website: morpheusnexus.cloud</div>
        <div className="code-line info">[SYNC] Presale mode: INACTIVE</div>
      </div>
    </div>
  );
}
