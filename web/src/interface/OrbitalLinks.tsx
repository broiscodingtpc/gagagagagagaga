/**
 * Fixed Navigation Links - High-Tech Style
 * Simple, clean, fixed position links
 */

import React from 'react';

interface NavLink {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface OrbitalLinksProps {
  onWhitepaperClick: () => void;
}

export function OrbitalLinks({ onWhitepaperClick }: OrbitalLinksProps) {
  const links: NavLink[] = [
    {
      id: 'twitter',
      label: 'X (TWITTER)',
      href: 'https://x.com/MNEX_Ai'
    },
    {
      id: 'whitepaper',
      label: 'WHITEPAPER',
      onClick: onWhitepaperClick
    },
    {
      id: 'admin',
      label: 'ADMIN',
      href: '/admin'
    }
    // Telegram and Dexscreener will be added later
  ];

  const handleClick = (link: NavLink, e: React.MouseEvent) => {
    if (link.onClick) {
      e.preventDefault();
      link.onClick();
    } else if (link.href) {
      e.preventDefault();
      window.open(link.href, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <nav className="mnex-nav" aria-label="Main navigation">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href || '#'}
          onClick={(e) => handleClick(link, e)}
          className="mnex-nav-link"
          rel={link.href ? 'noopener noreferrer' : undefined}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
