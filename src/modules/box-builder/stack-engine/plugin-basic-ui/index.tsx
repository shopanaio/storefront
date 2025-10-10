'use client';

import './index.css';
import React from 'react';
import { useEffect } from 'react';
import { useScreenMeta, useAppBarHost } from '../react/future';

export interface AppScreenProps {
  appBar?: {
    closeButton?: { render?: () => React.ReactNode };
    backButton?: { render?: () => React.ReactNode };
    title?: React.ReactNode;
    renderRight?: () => React.ReactNode;
  };
  ANDROID_ONLY_activityEnterStyle?: 'slideInLeft' | 'slideInRight' | string;
  children?: React.ReactNode;
}

/**
 * @public
 * Minimal AppScreen compatible facade used by Layout.tsx
 */
export const AppScreen: React.FC<AppScreenProps> = ({ appBar, children }) => {
  const appBarHeight = 56; // keep in sync with CSS var
  const { isTop, isRoot } = useScreenMeta();
  const { setAppBar } = useAppBarHost();

  useEffect(() => {
    if (!isTop) return;
    setAppBar(
      <div
        style={{
          height: 'var(--appbar-height)',
          display: 'flex',
          alignItems: 'center',
          paddingInline: 8,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'var(--appbar-bg, #fff)',
        }}
      >
        <div style={{ width: 40 }}>
          {isRoot ? appBar?.closeButton?.render?.() : appBar?.backButton?.render?.()}
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{appBar?.title}</div>
        <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
          {appBar?.renderRight?.()}
        </div>
      </div>
    );
  }, [isTop, isRoot, setAppBar]);

  return (
    <div className="stack-engine-appscreen">
      <div style={{ paddingTop: appBarHeight }}>{children}</div>
    </div>
  );
};

/**
 * @public
 * UI plugin facade for API compatibility. Currently a no-op.
 */
export const basicUIPlugin = (_opts?: unknown) => ({ name: 'basic-ui' });
