import React, { useState } from "react";
import SplineOrb from "./components/SplineOrb";
import ChatPanel from "./components/ChatPanel";
import CodeTerminals from "./components/CodeTerminals";
import { HUD } from "./interface/HUD";
import { OrbitalLinks } from "./interface/OrbitalLinks";
import { WhitepaperModal } from "./interface/WhitepaperModal";
import { useMnexControl } from "./interface/useMnexControl";
import AdminDashboard from "./social/AdminDashboard";
import "./styles.css";
import "./interface/styles.css";

export default function App(){
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { state: controlState } = useMnexControl();
  const [fps] = useState(60);

  // Check if we're on admin route
  const isAdminRoute = window.location.pathname === '/admin';

  // Show admin dashboard if on admin route
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  return (
    <div style={{
      position:"fixed", 
      inset:0, 
      background:"radial-gradient(circle at 50% 50%, rgba(26,0,51,0.4) 0%, #07030b 70%)"
    }}>
      {/* Ambient particles effect */}
      <div className="ambient-particles" aria-hidden="true" />
      
      {/* Spline 3D Orb - Interactive & AI Controlled */}
      <SplineOrb 
        energy={controlState.energy / 100}
        visible={true}
        speaking={controlState.speaking}
        thinking={controlState.thinking}
        emotion={controlState.emotion}
      />
      
      {/* HUD Overlay */}
      <HUD
        control={controlState}
        fps={fps}
        audioEnabled={false}
        onToggleAudio={() => {}}
      />

      {/* Navigation Links */}
      <OrbitalLinks onWhitepaperClick={() => setWhitepaperOpen(true)} />
      
      {/* Code Terminals Background */}
      <CodeTerminals />
      
      {/* Chat Panel Overlay */}
      <div className="chat-overlay">
        <ChatPanel />
      </div>
      
      {/* Whitepaper Modal */}
      <WhitepaperModal 
        isOpen={whitepaperOpen} 
        onClose={() => setWhitepaperOpen(false)} 
      />
    </div>
  );
}
