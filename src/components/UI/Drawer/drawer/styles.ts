import { createStyles } from "antd-style";

export const HANDLE_HEIGHT = 4;
export const HANDLE_OFFSET_TOP = 8;
export const DRAWER_CONTENT_OFFSET_TOP = HANDLE_HEIGHT + HANDLE_OFFSET_TOP;

export const useStyles = createStyles(({ css, token }) => ({
  overlay: css`
  position: fixed;
  background-color: rgba(0, 0, 0, 0.7);
  inset: 0;
  z-index: 999;
`,

 handle:css `
  margin: 0 auto;
  width: var(--spacing-x-large);
  height: 4px;
  border-radius: var(--spacing-x-small);
  background-color: gray;
`,

 content:css `
  background-color: var(--color-bg-drawer, var(--color-bg-surface-secondary));
  border-top-left-radius: var(--spacing-large);
  border-top-right-radius: var(--spacing-large);
  overflow: hidden;
  position: fixed;
  padding-top: ${HANDLE_OFFSET_TOP}px;
  bottom: 0;
  left: 0;
  right: 0;
  outline: none;
  z-index: 9999;
  will-change: transform;
  transform: translate3d(0px, 0px, 0px);
`,
container :css`
  transition-property: height;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  will-change: auto;
`,
}))
