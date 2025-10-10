'use client';

import './index.css';
import React from 'react';
import { createPortal } from 'react-dom';
import { useScreenMeta } from '../react/future';

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
  const { isTop } = useScreenMeta();
  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let el = document.getElementById('stack-engine-appbar-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'stack-engine-appbar-root';
      document.body.appendChild(el);
    }
    setPortalRoot(el);
  }, []);
  return (
    <div className="stack-engine-appscreen">
      {isTop && portalRoot
        ? createPortal(
            <div
              style={{
                height: 'var(--appbar-height)',
                display: 'flex',
                alignItems: 'center',
                paddingInline: 8,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                position: 'fixed',
                insetInline: 0,
                top: 0,
                background: 'var(--appbar-bg, #fff)',
                zIndex: 1000,
              }}
            >
              <div style={{ width: 40 }}>{appBar?.backButton?.render?.()}</div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>{appBar?.title}</div>
              <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
                {appBar?.renderRight?.()}
                {appBar?.closeButton?.render?.()}
              </div>
            </div>,
            portalRoot
          )
        : null}
      <div style={{ paddingTop: appBarHeight }}>
        {/* AppBar is static above animations; only content below animates */}
        {children}
      </div>
    </div>
  );
};

/**
 * @public
 * UI plugin facade for API compatibility. Currently a no-op.
 */
export const basicUIPlugin = (_opts?: unknown) => ({ name: 'basic-ui' });
