import { createStyles } from 'antd-style';

export const HANDLE_HEIGHT = 4;
export const HANDLE_OFFSET_TOP = 8;
export const DRAWER_CONTENT_OFFSET_TOP = HANDLE_HEIGHT + HANDLE_OFFSET_TOP;
export const DRAWER_OFFSET_X = 12;

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    height: 100%;
  `,
  overlay: css`
    position: fixed;
    background-color: ${token.colorBgMask};
    inset: 0;
    z-index: 99998;
  `,
  handle: css`
    margin: 0 auto;
    width: 32px;
    height: ${HANDLE_HEIGHT}px;
    border-radius: ${token.borderRadiusXS}px;
    background-color: ${token.colorBorder};
  `,
  content: css`
    background-color: ${token.colorBgElevated};
    overflow: hidden;
    position: fixed;
    outline: none;
    z-index: 99999;
    will-change: transform;
    transform: translate3d(0px, 0px, 0px);
    transition: transform 0.3s ease;
  `,
  contentVertical: css`
    border-top-left-radius: ${token.borderRadiusLG}px;
    border-top-right-radius: ${token.borderRadiusLG}px;
    padding-top: ${DRAWER_CONTENT_OFFSET_TOP}px;
    bottom: 0;
    left: 0;
    right: 0;
  `,
  contentHorizontal: css`
    border-radius: ${token.borderRadiusLG}px;
    top: ${DRAWER_OFFSET_X}px;
    bottom: ${DRAWER_OFFSET_X}px;
    width: var(--components-drawer-width);
  `,
  contentRight: css`
    right: ${DRAWER_OFFSET_X}px;

    &[data-state='closed'] {
      right: 0px;
    }
  `,
  contentLeft: css`
    left: ${DRAWER_OFFSET_X}px;

    &[data-state='closed'] {
      left: 0px;
    }
  `,
  contentFullscreen: css`
    inset: 0 !important;
    border-radius: 0 !important;
  `,
}));
