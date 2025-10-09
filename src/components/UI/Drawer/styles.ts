import { createStyles } from 'antd-style';

export const HANDLE_HEIGHT = 4;
export const HANDLE_OFFSET_TOP = 8;
export const DRAWER_CONTENT_OFFSET_TOP = HANDLE_HEIGHT + HANDLE_OFFSET_TOP;
export const RIGHT_DRAWER_OFFSET = 12;

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    transition-property: height;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
    will-change: auto;
    display: flex;
    flex-direction: column;
  `,
  containerRight: css`
    display: flex;
    flex-direction: column;
    height: 100%;
  `,
  overlay: css`
    position: fixed;
    background-color: ${token.colorBgMask};
    inset: 0;
    z-index: 9999;
  `,
  handle: css`
    margin: 0 auto;
    width: 32px;
    height: ${HANDLE_HEIGHT}px;
    border-radius: ${token.borderRadiusXS}px;
    background-color: ${token.colorBorder};
  `,
  content: css`
    background-color: ${token.colorBgContainer};
    border-top-left-radius: ${token.borderRadiusLG}px;
    border-top-right-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
    position: fixed;
    padding-top: ${HANDLE_OFFSET_TOP}px;
    bottom: 0;
    left: 0;
    right: 0;
    outline: none;
    z-index: 99999;
    will-change: transform;
    transform: translate3d(0px, 0px, 0px);
  `,
  contentRight: css`
    background-color: ${token.colorBgContainer};
    border-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
    position: fixed;
    top: ${RIGHT_DRAWER_OFFSET}px;
    bottom: ${RIGHT_DRAWER_OFFSET}px;
    right: ${RIGHT_DRAWER_OFFSET}px;
    outline: none;
    z-index: 99999;
    will-change: transform;
    transform: translate3d(0px, 0px, 0px);
  `,
}));
