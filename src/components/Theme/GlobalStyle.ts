import { createGlobalStyle } from "antd-style";

export const GlobalStyle = createGlobalStyle`
  :root {
    /* Custom tokens here */

    --font-weight-100: 100;
    --font-weight-200: 200;
    --font-weight-300: 300;
    --font-weight-400: 400;
    --font-weight-500: 500;
    --font-weight-600: 600;
    --font-weight-700: 700;
    --font-weight-800: 800;
    --font-weight-900: 900;

    --radius-xs: 0.125rem; /** 2px */
    --radius-sm: 0.25rem; /** 4px */
    --radius-md: 0.375rem; /** 6px */
    --radius-lg: 0.5rem; /** 8px */
    --radius-xl: 0.75rem; /** 12px */
    --radius-2xl: 1rem; /** 16px */
    --radius-3xl: 1.5rem; /** 24px */
    --radius-4xl: 2rem; /** 32px */

    --spacing-0: 0px; /** 0px */
    --spacing-px: 1px; /** 1px */
    --spacing-0\.5: 0.125rem; /** 2px */
    --spacing-1: 0.25rem; /** 4px */
    --spacing-1\.5: 0.375rem; /** 6px */
    --spacing-2: 0.5rem; /** 8px */
    --spacing-2\.5: 0.625rem; /** 10px */
    --spacing-3: 0.75rem; /** 12px */
    --spacing-3\.5: 0.875rem; /** 14px */
    --spacing-4: 1rem; /** 16px */
    --spacing-5: 1.25rem; /** 20px */
    --spacing-6: 1.5rem; /** 24px */
    --spacing-7: 1.75rem; /** 28px */
    --spacing-8: 2rem; /** 32px */
    --spacing-9: 2.25rem; /** 36px */
    --spacing-10: 2.5rem; /** 40px */
    --spacing-11: 2.75rem; /** 44px */
    --spacing-12: 3rem; /** 48px */
    --spacing-14: 3.5rem; /** 56px */
    --spacing-16: 4rem; /** 64px */
    --spacing-20: 5rem; /** 80px */

    --components-header-control-height: 46px;

    --always-black-bg: #000;
    --always-White-text: #fff;
    --sticky-header-height:70px
  }
`;
