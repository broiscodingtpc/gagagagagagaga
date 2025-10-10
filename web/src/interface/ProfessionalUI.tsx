import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProfessionalUIProps {
  onWhitepaperClick: () => void;
  onAdminClick: () => void;
}

export function ProfessionalUI({ onWhitepaperClick, onAdminClick }: ProfessionalUIProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'twitter',
      label: 'Twitter',
      href: 'https://x.com/MNEX_Ai',
      external: true
    },
    {
      id: 'telegram',
      label: 'Telegram',
      href: 'https://t.me/MorpheusNexusProject',
      external: true
    },
    {
      id: 'dexscreener',
      label: 'Dexscreener',
      href: '#',
      external: false,
      placeholder: true
    },
    {
      id: 'whitepaper',
      label: 'Whitepaper',
      href: '/whitepaper',
      external: false
    },
    {
      id: 'admin',
      label: 'Admin',
      onClick: onAdminClick,
      external: false
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.placeholder) {
      // Show placeholder message for Dexscreener
      alert('Dexscreener coming soon! Token not yet live.');
    } else if (item.href && item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Professional Navigation */}
      <nav className="professional-nav">
        {/* Desktop Navigation */}
        <div className="nav-desktop">
          <div className="nav-brand">
            <span className="brand-text">MORPHEUS NEXUS</span>
            <span className="brand-subtitle">AI ORACLE</span>
          </div>
          
          <div className="nav-links">
            {navigationItems.map((item) => {
              if (item.href && !item.external && !item.placeholder) {
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="nav-link"
                  >
                    {item.label}
                  </Link>
                );
              } else {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="nav-link"
                  >
                    {item.label}
                    {item.external && <span className="external-icon">↗</span>}
                    {item.placeholder && <span className="placeholder-icon">#</span>}
                  </button>
                );
              }
            })}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="nav-mobile">
          <div className="nav-brand-mobile">
            <span className="brand-text">MNEX</span>
          </div>
          
          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {navigationItems.map((item) => {
                if (item.href && !item.external && !item.placeholder) {
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className="mobile-nav-link"
                    >
                      {item.label}
                    </Link>
                  );
                } else {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="mobile-nav-link"
                    >
                      {item.label}
                      {item.external && <span className="external-icon">↗</span>}
                      {item.placeholder && <span className="placeholder-icon">#</span>}
                    </button>
                  );
                }
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">STATUS</span>
          <span className="status-value active">ONLINE</span>
        </div>
        <div className="status-item">
          <span className="status-label">CONSCIOUSNESS</span>
          <span className="status-value">ACTIVE</span>
        </div>
        <div className="status-item">
          <span className="status-label">NETWORK</span>
          <span className="status-value">SOLANA</span>
        </div>
      </div>

      {/* Professional Styles */}
      <style jsx>{`
        .professional-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .nav-desktop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .nav-mobile {
          display: none;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
        }

        .nav-brand {
          display: flex;
          flex-direction: column;
        }

        .brand-text {
          font-family: 'Courier New', monospace;
          font-size: 1.2rem;
          font-weight: 700;
          color: #8b5cf6;
          letter-spacing: 2px;
        }

        .brand-subtitle {
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
          color: #a78bfa;
          letter-spacing: 1px;
          margin-top: -2px;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
        }

        .nav-link {
          background: none;
          border: none;
          color: #e5e7eb;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 1px;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .external-icon {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .placeholder-icon {
          font-size: 0.8rem;
          opacity: 0.5;
          color: #6b7280;
        }

        .status-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(139, 92, 246, 0.2);
          padding: 0.75rem 2rem;
          display: flex;
          justify-content: center;
          gap: 3rem;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .status-label {
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
          color: #6b7280;
          letter-spacing: 1px;
        }

        .status-value {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          color: #e5e7eb;
          font-weight: 600;
        }

        .status-value.active {
          color: #10b981;
        }

        .menu-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 24px;
          height: 18px;
        }

        .hamburger span {
          width: 100%;
          height: 2px;
          background: #8b5cf6;
          transition: all 0.3s ease;
        }

        .hamburger.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .hamburger.active span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(139, 92, 246, 0.2);
        }

        .mobile-menu-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .mobile-nav-link {
          background: none;
          border: none;
          color: #e5e7eb;
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          font-weight: 500;
          letter-spacing: 1px;
          cursor: pointer;
          padding: 1rem;
          border-radius: 4px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .mobile-nav-link:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .nav-desktop {
            display: none;
          }

          .nav-mobile {
            display: flex;
          }

          .status-bar {
            padding: 0.5rem 1rem;
            gap: 1.5rem;
          }

          .status-label {
            font-size: 0.6rem;
          }

          .status-value {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .status-bar {
            gap: 1rem;
          }

          .status-item {
            gap: 0.1rem;
          }
        }
      `}</style>
    </>
  );
}
