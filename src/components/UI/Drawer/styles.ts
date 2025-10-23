import { createStyles } from 'antd-style';

export const HANDLE_HEIGHT = 4;
export const HANDLE_OFFSET_TOP = 8;
export const DRAWER_CONTENT_OFFSET_TOP = HANDLE_HEIGHT + HANDLE_OFFSET_TOP;
export const RIGHT_DRAWER_OFFSET = 12;
export const LEFT_DRAWER_OFFSET = 12;

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
    top: ${RIGHT_DRAWER_OFFSET}px;
    bottom: ${RIGHT_DRAWER_OFFSET}px;
  `,
  contentRight: css`
    right: ${RIGHT_DRAWER_OFFSET}px;
  `,
  contentLeft: css`
    left: ${LEFT_DRAWER_OFFSET}px;
  `,
}));
