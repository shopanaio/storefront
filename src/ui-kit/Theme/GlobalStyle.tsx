'use client';

import { createGlobalStyle } from 'antd-style';
import { breakpoints } from './breakpoints';

export const GlobalStyle = createGlobalStyle`
  html {
    background-color: var(--ant-color-bg-base);
  }

  * {
    -webkit-tap-highlight-color: transparent;
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
`;
