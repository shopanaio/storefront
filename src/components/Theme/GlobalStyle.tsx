'use client';

import { createGlobalStyle } from 'antd-style';
import { breakpoints } from './breakpoints';
import { memo, useMemo } from 'react';
import { GlobalToken } from 'antd';

/**
 * Injects application-wide CSS variables and layout primitives.
 * The background color is synchronized with the current Ant Design theme token.
 */
export interface GlobalStyleProps {
  /** Theme tokens provided by Ant Design ThemeProvider */
  token: GlobalToken;
}

export const GlobalStyle = memo(({ token }: GlobalStyleProps) => {
  const { colorBgBase } = token;

  const GlobalStyleComponent = useMemo(
    () =>
      createGlobalStyle`
  /* Global reset based on theme token */
  html, body {
    background-color: ${colorBgBase};
  }

  :root {
    --components-header-control-height: 42px;
    --components-drawer-width: min(100vw, 500px);

    --always-black-bg: #000;
    --sticky-header-height: 70px;
  }

  /* Global container class */
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    max-width: calc(100vw - 24px);
  }

  @media (min-width: ${breakpoints.lg}px) {
    .container {
      max-width: calc(100vw - 32px);
    }
  }

  @media (min-width: ${breakpoints.xl + 32}px) {
    .container {
      max-width: 1280px;
    }
  }

  @media (min-width: ${breakpoints.xxl}px) {
    .container {
      max-width: 1400px;
    }
  }
  `,
    [colorBgBase]
  );

  return <GlobalStyleComponent />;
});
