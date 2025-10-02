import * as React from 'react';

/**
 * Simple placeholder brand showing Visa/Mastercard text badges.
 * Replaces real icons with textual placeholders for now.
 */
export function BTLogo({ size = 20 }: { size?: number }) {
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    padding: '0 6px',
    height: size,
    lineHeight: `${size}px`,
    fontSize: Math.max(10, Math.floor(size * 0.55)),
    fontWeight: 600,
    color: '#fff',
  };

  return (
    <span style={{ display: 'inline-flex', gap: 6 }}>
      <span style={{ ...badgeStyle, background: '#1a1f71' }}>VISA</span>
      <span style={{ ...badgeStyle, background: '#eb001b' }}>MC</span>
    </span>
  );
}
