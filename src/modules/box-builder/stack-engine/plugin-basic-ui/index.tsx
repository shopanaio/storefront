'use client';

import './index.css';
import React from 'react';
import { useEffect, useRef } from 'react';
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

  // Keep latest appBar in ref to avoid recreating effect on every render
  const appBarRef = useRef(appBar);
  appBarRef.current = appBar;

  useEffect(() => {
    if (!isTop) {
      setAppBar(null);
      return;
    }

    // We are the top screen - render AppBar content
    const currentAppBar = appBarRef.current;
    setAppBar({
      isRoot,
      left: isRoot ? currentAppBar?.closeButton?.render?.() : currentAppBar?.backButton?.render?.(),
      center: currentAppBar?.title,
      right: currentAppBar?.renderRight?.(),
    });
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
