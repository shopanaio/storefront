import { createStyles } from 'antd-style';
import {
  VISUAL_VIEWPORT_HEIGHT,
  VISUAL_VIEWPORT_SAFE_BOTTOM,
  VISUAL_VIEWPORT_TOP,
} from '../visualViewport';

const HANDLE_HEIGHT = 4;
const HANDLE_OFFSET_TOP = 8;
const DRAWER_CONTENT_OFFSET_TOP = HANDLE_HEIGHT + HANDLE_OFFSET_TOP;
/**
 * The room over and under a bottom sheet's handle on Android, more than iOS's own: Material 3
 * gives its drag handle room to take a finger, px.
 */
const HANDLE_ROOM_TOP_ANDROID = 16;
const HANDLE_ROOM_BOTTOM_ANDROID = 6;
const DRAWER_OFFSET_X = 16;
/** A bottom sheet's top corners as Android's own (Material 3), px. */
const SHEET_RADIUS = 28;
/** A bottom sheet's top corners on iOS, as its own sheets, px. */
const SHEET_RADIUS_IOS = 38;
/** How long a bottom sheet takes its new height, ms; its easing is `ease`. */
export const SHEET_RESIZE_MS = 300;

/** `zIndex` is the overlay's; the content lies one above it. */
export const useStyles = createStyles(
  ({ css, token }, { zIndex }: { zIndex: number }) => ({
    body: css`
      height: 100%;
    `,
    // A bottom sheet's content shrinks to its full detent, the platforms' own (iOS's large,
    // Android's expanded): up to the room left over it at the top of the screen. Its own
    // body scrolls inside.
    frame: css`
      display: flex;
      flex-direction: column;
      max-height: calc(100dvh - var(--sheet-top-gap) - var(--sheet-padding-top));
    `,
    // Stood up to the whole screen over the keyboard, under the room left at its top.
    frameExpanded: css`
      height: 100%;
      max-height: none;
    `,
    // Over the keyboard as tall as its content, the room over the keyboard at most.
    frameFitted: css`
      max-height: calc(
        ${VISUAL_VIEWPORT_HEIGHT} - var(--sheet-top-gap) - var(--sheet-padding-top)
      );
    `,
    bodyVertical: css`
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
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
      flex-shrink: 0;
      margin: 0 auto var(--sheet-handle-gap, 0px);
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
    // The top corners and the room round the handle of the platform's own sheets: iOS's (its
    // WebKit alone knows -webkit-touch-callout), Android's elsewhere.
    contentVertical: css`
      --sheet-padding-top: ${HANDLE_ROOM_TOP_ANDROID}px;
      --sheet-handle-gap: ${HANDLE_ROOM_BOTTOM_ANDROID}px;
      /* Over a sheet at its full detent: the status bar and a strip of the page. */
      --sheet-top-gap: max(24px, calc(env(safe-area-inset-top) + 8px));
      --sheet-radius: ${SHEET_RADIUS}px;
      border-top-left-radius: var(--sheet-radius);
      border-top-right-radius: var(--sheet-radius);
      padding-top: var(--sheet-padding-top);
      bottom: 0;
      left: 0;
      right: 0;

      @supports (-webkit-touch-callout: none) {
        --sheet-padding-top: ${DRAWER_CONTENT_OFFSET_TOP}px;
        --sheet-handle-gap: 0px;
        --sheet-radius: ${SHEET_RADIUS_IOS}px;
      }
    `,
    /*
     * Stood up to the whole screen: the sheet is the visual viewport's box, as a screen that
     * fits it (the part of the screen above the keyboard), clear (a press on it, over the
     * overlay, closes the sheet: Sheet); its panel (panelExpanded) stands at its bottom, right
     * over the keyboard, and grows up. It takes presses itself: under pointer-events none
     * WebKit does not scroll the panel's body. The bottom safe area of its parts is none over
     * the keyboard.
     */
    contentExpanded: css`
      &&& {
        top: ${VISUAL_VIEWPORT_TOP};
        bottom: auto;
        height: ${VISUAL_VIEWPORT_HEIGHT};
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding-top: 0;
        border-radius: 0;
        background-color: transparent;
        overflow: visible;
        --safe-area-bottom: ${VISUAL_VIEWPORT_SAFE_BOTTOM};
      }

      /* Under the box, down past the screen's bottom: the sheet's own white, opaque, behind
         the browser's bars over the keyboard and as the keyboard goes down (vaul's ::after
         inherits the box's clear background). */
      &&&::after {
        content: '';
        position: absolute;
        top: 100%;
        right: 0;
        left: 0;
        height: 100lvh;
        background: ${token.colorBgElevated};
        pointer-events: none;
      }
    `,
    // The sheet's panel in its box stood up to the whole screen: what the sheet is otherwise.
    panelExpanded: css`
      flex: none;
      box-sizing: border-box;
      /* Never over the top of the box, the room at its top left. */
      max-height: calc(100% - var(--sheet-top-gap));
      padding-top: var(--sheet-padding-top);
      border-top-left-radius: var(--sheet-radius);
      border-top-right-radius: var(--sheet-radius);
      background-color: ${token.colorBgElevated};
      overflow: hidden;
    `,
    /*
     * The panel stood up: as tall as its box (the screen above the keyboard) but the room at
     * its top, from CSS alone, over the height its animation sets inline; its content fills it.
     * It follows the box at once as the keyboard moves, nothing animating against it.
     */
    panelStanding: css`
      &&& {
        height: calc(100% - var(--sheet-top-gap)) !important;
      }

      & > div {
        height: 100%;
      }

      /* The least height of a body (DrawerBase's minHeight) is for a sheet as tall as its
         content; stood up, the body is the room left and scrolls in it. */
      & [data-drawer-body] {
        min-height: 0 !important;
      }
    `,
    // Over the keyboard as tall as its content: down to the bottom of its box from the top it
    // rose to (Sheet's --sheet-detent-top), so it stays there as the keyboard goes down.
    panelFitted: css`
      min-height: calc(100% - var(--sheet-detent-top, 100%));
    `,
    // Standing up, once: from the height it had to the whole screen.
    panelStandingUp: css`
      &&& {
        transition: height ${SHEET_RESIZE_MS}ms ease !important;
      }
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
