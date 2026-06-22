import React from 'react';

interface NeonLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function NeonLogo({ className = '', size = 'md' }: NeonLogoProps) {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48'
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${sizeMap[size]} ${className}`}>
      {/* Outer Glow Ring container */}
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-neon-flicker"
      >
        <defs>
          {/* Intense Neon Red Radial Glow filter */}
          <filter id="neon-red-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="7" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Golden Yellow Glow filter for text */}
          <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix type="matrix" values="
              1 0 0 0 1
              0 0.8 0 0 0.8
              0 0 0 0 0
              0 0 0 1 0" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Yellow/Orange Text Gradient */}
          <linearGradient id="yellow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Red/Crimson Ring Gradient */}
          <linearGradient id="red-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Double Neon Red Outer Rings */}
        <circle
          cx="80"
          cy="80"
          r="66"
          fill="none"
          stroke="url(#red-gradient)"
          strokeWidth="3.5"
          filter="url(#neon-red-glow)"
          opacity="0.95"
        />
        <circle
          cx="80"
          cy="80"
          r="61"
          fill="none"
          stroke="#fca5a5"
          strokeWidth="1.2"
          filter="url(#neon-red-glow)"
          opacity="0.8"
        />

        {/* Scattered Graffiti Splatters around the border */}
        <path d="M40 35 L42 37" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M125 45 L127 43" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        <path d="M115 115 L119 117" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 120 L37 118" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

        {/* Little decorative diamonds */}
        <polygon points="80,18 82,20 80,22 78,20" fill="#facc15" />
        <polygon points="138,80 140,82 138,84 136,82" fill="#ef4444" />
        <polygon points="80,138 82,140 80,142 78,140" fill="#facc15" />
        <polygon points="22,80 24,82 22,84 20,82" fill="#ef4444" />

        {/* Graffiti Style custom stylized Text */}
        {/* Background glow shadow for title */}
        <text
          x="80"
          y="71"
          fontFamily="Impact, sans-serif"
          fontWeight="900"
          fontSize="17px"
          fill="#000"
          stroke="#ef4444"
          strokeWidth="4"
          textAnchor="middle"
          transform="rotate(-8 80 75)"
          letterSpacing="0.5"
        >
          MONITORING
        </text>
        <text
          x="80"
          y="71"
          fontFamily="Impact, sans-serif"
          fontWeight="900"
          fontSize="17px"
          fill="url(#yellow-gradient)"
          textAnchor="middle"
          transform="rotate(-8 80 75)"
          letterSpacing="0.5"
          filter="url(#gold-glow)"
        >
          MONITORING
        </text>

        {/* Text 2: PRODUCKI */}
        <text
          x="80"
          y="93"
          fontFamily="Impact, sans-serif"
          fontWeight="900"
          fontSize="22px"
          fill="#000"
          stroke="#dc2626"
          strokeWidth="5"
          textAnchor="middle"
          transform="rotate(-8 80 75)"
          letterSpacing="1"
        >
          PRODUKSI
        </text>
        <text
          x="80"
          y="93"
          fontFamily="Impact, sans-serif"
          fontWeight="900"
          fontSize="22px"
          fill="url(#yellow-gradient)"
          textAnchor="middle"
          transform="rotate(-8 80 75)"
          letterSpacing="1"
          filter="url(#gold-glow)"
        >
          PRODUKSI
        </text>

        {/* Drip vector details at the bottom of text */}
        <path 
          d="M75 92 L75 101 M85 91 L85 106 M96 90 L96 98 M62 86 L62 93" 
          stroke="#facc15" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
}
