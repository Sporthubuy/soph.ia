import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'isotype';
  className?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

/**
 * SOPH.IA Logo - Constellation Design System
 * Official brand mark per SOPH.IA_Brand_Guide_Oficial.md
 */
export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const dimensions = sizes[size];

  if (variant === 'isotype') {
    return (
      <svg
        width={dimensions}
        height={dimensions}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="SOPH.IA"
      >
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="3" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="18.5" cy="5.5" r="1.2" fill="currentColor" opacity="0.7" />
        <circle cx="21" cy="12" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="18.5" cy="18.5" r="1.2" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="21" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="5.5" cy="18.5" r="1.2" fill="currentColor" opacity="0.7" />
        <circle cx="3" cy="12" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" opacity="0.7" />

        <line x1="12" y1="12" x2="12" y2="3" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="18.5" y2="5.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="18.5" y2="18.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="5.5" y2="18.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="5.5" y2="5.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />

        <line x1="12" y1="3" x2="18.5" y2="5.5" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        <line x1="18.5" y1="5.5" x2="21" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        <line x1="21" y1="12" x2="18.5" y2="18.5" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        <line x1="18.5" y1="18.5" x2="12" y2="21" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        <line x1="12" y1="21" x2="5.5" y2="18.5" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        <line x1="5.5" y1="18.5" x2="3" y2="12" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        <line x1="3" y1="12" x2="5.5" y2="5.5" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        <line x1="5.5" y1="5.5" x2="12" y2="3" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={dimensions}
        height={dimensions}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SOPH.IA Logo"
      >
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="3" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="18.5" cy="5.5" r="1.2" fill="currentColor" opacity="0.7" />
        <circle cx="21" cy="12" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="18.5" cy="18.5" r="1.2" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="21" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="5.5" cy="18.5" r="1.2" fill="currentColor" opacity="0.7" />
        <circle cx="3" cy="12" r="1.2" fill="currentColor" opacity="0.8" />
        <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" opacity="0.7" />

        <line x1="12" y1="12" x2="12" y2="3" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="18.5" y2="5.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="18.5" y2="18.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="12" x2="12" y2="21" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="5.5" y2="18.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
        <line x1="12" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        <line x1="12" y1="12" x2="5.5" y2="5.5" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      </svg>
      <span className="font-semibold text-base">SOPH.IA</span>
    </div>
  );
}

/**
 * Alias for backward compatibility with existing code
 * LogoMark = Logo component in isotype variant
 */
export function LogoMark({ size = 'md', className = '' }: Omit<LogoProps, 'variant'>) {
  return <Logo size={size} variant="isotype" className={className} />;
}

/**
 * Wordmark = Logo text only variant (SOPH.IA)
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-semibold ${className}`} style={{ color: 'var(--star-1)' }}>
      SOPH.IA
    </span>
  );
}

export default Logo;
