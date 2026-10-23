import { createStyles } from 'antd-style';

const HANDLE_HEIGHT = 4;
const HANDLE_OFFSET_TOP = 8;
const DRAWER_CONTENT_OFFSET_TOP = HANDLE_HEIGHT + HANDLE_OFFSET_TOP;
const DRAWER_OFFSET_X = 12;

/** `zIndex` is the overlay's; the content lies one above it. */
export const useStyles = createStyles(
  ({ css, token }, { zIndex }: { zIndex: number }) => ({
    body: css`
      height: 100%;
    `,
    overlay: css`
      position: fixed;
      background-color: ${token.colorBgMask};
      inset: 0;
      z-index: ${zIndex};

      &&[data-state='closed'] {
        animation-fill-mode: forwards;
      }
    `,
    handle: css`
      margin: 0 auto;
      width: 32px;
      height: ${HANDLE_HEIGHT}px;
      border-radius: ${token.borderRadiusXS}px;
      background-color: ${token.colorBorder};
    `,
    // Portalled out of the page: the text takes the theme's font, as an antd modal does.
    content: css`
      background-color: ${token.colorBgElevated};
      color: ${token.colorText};
      font-family: ${token.fontFamily};
      font-size: ${token.fontSize}px;
      line-height: ${token.lineHeight};
      overflow: hidden;
      position: fixed;
      outline: none;
      z-index: ${zIndex + 1};
      will-change: transform;
      transform: translate3d(0px, 0px, 0px);
      transition: transform ${token.motionDurationSlow} ease;

      &&[data-state='closed'] {
        animation-fill-mode: forwards;
      }
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
      width: var(--components-drawer-width, min(100vw, 500px));
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
      &&& {
        inset: 0;
        border-radius: 0;
      }
    `,
  })
);
