import { useState } from "react";
import EnergyOrb from "./components/EnergyOrb";
import ChatPanel from "./components/ChatPanel";
import CodeTerminals from "./components/CodeTerminals";
import "./styles.css";

export default function App(){
  const [orbEnergy, setOrbEnergy] = useState(60);
  const [orbPulse, setOrbPulse] = useState(false);

  const handleChatActivity = (type: 'sending' | 'receiving') => {
    if (type === 'sending') {
      setOrbEnergy(prev => Math.min(100, prev + 15));
      setOrbPulse(true);
      setTimeout(() => setOrbPulse(false), 800);
    } else if (type === 'receiving') {
      setOrbEnergy(prev => Math.max(40, prev - 10));
      setOrbPulse(true);
      setTimeout(() => setOrbPulse(false), 1200);
    }
  };

  return (
    <div className="mnex-root">
      <CodeTerminals />
      <div className="center-content">
        <EnergyOrb energy={orbEnergy} pulse={orbPulse} />
        <ChatPanel onActivity={handleChatActivity} />
      </div>
    </div>
  );
}
