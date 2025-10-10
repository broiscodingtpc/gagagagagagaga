import React, { useState } from "react";
import SplineOrb from "./components/SplineOrb";
import { ProfessionalUI } from "./interface/ProfessionalUI";
import { ProfessionalChat } from "./interface/ProfessionalChat";
import { WhitepaperModal } from "./interface/WhitepaperModal";
import { useMnexControl } from "./interface/useMnexControl";
import AdminDashboard from "./social/AdminDashboard";
import "./styles.css";
import "./interface/styles.css";

export default function App(){
  // Professional UI v1.2.0 - High-end, mobile-optimized, clean files
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { state: controlState } = useMnexControl();

  // Check if we're on admin route
  const isAdminRoute = window.location.pathname === '/admin';

  // Show admin dashboard if on admin route
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  const handleAdminClick = () => {
    window.location.href = '/admin';
  };

  return (
    <div className="professional-app">
      {/* Professional Background */}
      <div className="app-background" />
      
      {/* Enhanced 3D Orb - High-end visual */}
      <SplineOrb 
        energy={controlState.energy / 100}
        visible={true}
        speaking={controlState.speaking}
        thinking={controlState.thinking}
        emotion={controlState.emotion}
        style={{
          filter: "contrast(1.3) brightness(1.2) saturate(1.4) drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))"
        }}
      />
      
      {/* Professional Navigation */}
      <ProfessionalUI 
        onWhitepaperClick={() => setWhitepaperOpen(true)}
        onAdminClick={handleAdminClick}
      />
      
      {/* Professional Chat Interface */}
      <ProfessionalChat />
      
      {/* Whitepaper Modal */}
      <WhitepaperModal 
        isOpen={whitepaperOpen} 
        onClose={() => setWhitepaperOpen(false)} 
      />

      {/* Professional App Styles */}
      <style jsx>{`
        .professional-app {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(26, 0, 51, 0.6) 0%, #0a0a0a 70%);
          overflow: hidden;
        }

        .app-background {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
          animation: backgroundPulse 20s ease-in-out infinite;
        }

        @keyframes backgroundPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .professional-app {
            background: radial-gradient(circle at 50% 50%, rgba(26, 0, 51, 0.8) 0%, #0a0a0a 70%);
          }
        }
      `}</style>
    </div>
  );
}
