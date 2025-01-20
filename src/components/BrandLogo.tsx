import React, { CSSProperties } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = "", size = "large" }) => {
  const sizeClasses = {
    small: "h-8",
    medium: "h-12",
    large: "h-16"
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className={`${sizeClasses[size]}`}
      >
        <path 
          d="M50 5 L61 40 L98 40 L68 62 L79 95 L50 75 L21 95 L32 62 L2 40 L39 40 Z" 
          fill="url(#logoGradient)"
          stroke="none"
        />
        <path 
          d="M30 55 L45 45 L60 65 L75 35" 
          stroke="white" 
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
            <stop offset="100%" style={{ stopColor: '#8B5CF6' }} />
          </linearGradient>
        </defs>
      </svg>
      <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
        ${size === 'small' ? 'text-xl' : size === 'medium' ? 'text-2xl' : 'text-3xl'}`}>
        AsterLend
      </h1>
    </div>
  );
};

export default BrandLogo;