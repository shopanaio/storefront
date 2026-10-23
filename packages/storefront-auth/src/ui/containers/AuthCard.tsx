'use client';

import type { CSSProperties, ReactNode } from 'react';
import { AuthCardSurface } from './surfaces';

export interface AuthCardProps {
  children: ReactNode;
  /** "Back" in the header; the logo alone, centered, without it. */
  onBack?: () => void;
  className?: string;
  style?: CSSProperties;
}

/** A store card on a page of its own: the logo over the screen, 440px wide at most. */
export const AuthCard = ({
  children,
  onBack,
  className,
  style,
}: AuthCardProps) => (
  <AuthCardSurface onBack={onBack} className={className} style={style}>
    {children}
  </AuthCardSurface>
);
