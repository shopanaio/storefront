import {
  KEYBOARD_DOWN_TRANSITION,
  KEYBOARD_OPEN_ATTR,
  KEYBOARD_UP_TRANSITION,
  VISUAL_VIEWPORT_HEIGHT_VAR,
  VISUAL_VIEWPORT_SAFE_BOTTOM_VAR,
  VISUAL_VIEWPORT_TOP_VAR,
  VISUAL_VIEWPORT_TRANSITION_VAR,
} from './constants';
import { isKeyboardField } from './fields';

/** How much of the layout viewport the keyboard takes at least, px. */
const KEYBOARD_MIN_HEIGHT = 120;

/**
 * How long after a field lets the caret go the viewport's late reports of the keyboard
 * (sizes it had on its way down) are not taken, ms.
 */
const KEYBOARD_DOWN_TIME = 800;

/** The keyboard's state as the box follows it; up or down only once the box has measured. */
let keyboardUp = false;
const keyboardListeners = new Set<(up: boolean) => void>();

/** Whether the keyboard is up, as the box last took it. */
export const isKeyboardUp = () => keyboardUp;

/** Calls `listener` as the keyboard comes up or goes down. Returns the unsubscribe. */
export function onKeyboardChange(listener: (up: boolean) => void) {
  keyboardListeners.add(listener);
  return () => {
    keyboardListeners.delete(listener);
  };
}

/**
 * Keeps the visual viewport's box in the CSS variables of the root element until the
 * returned stop. As a field lets the caret go (and no other field takes it) the keyboard
 * goes down: the box takes its whole height at once, with the keyboard, not once the
 * viewport reports it.
 */
function track(viewport: VisualViewport): () => void {
  const root = document.documentElement;
  // What is set now: an unchanged value is not set again (each set restyles the page).
  let top = '';
  let height = '';
  let keyboard: boolean | null = null;
  // The viewport's height with the keyboard down, the height the box goes back to.
  let wholeHeight: number | null = null;
  // Until when the keyboard is on its way down: its sizes on the way are not taken.
  let downUntil = 0;

  const setTop = (next: number) => {
    const value = `${Math.round(next)}px`;
    if (value === top) return;
    top = value;
    root.style.setProperty(VISUAL_VIEWPORT_TOP_VAR, top);
  };
  const setHeight = (next: number) => {
    const value = `${Math.round(next)}px`;
    if (value === height) return;
    height = value;
    root.style.setProperty(VISUAL_VIEWPORT_HEIGHT_VAR, height);
  };
  const setKeyboard = (up: boolean) => {
    if (up === keyboard) return;
    keyboard = up;
    keyboardUp = up;
    root.style.setProperty(
      VISUAL_VIEWPORT_TRANSITION_VAR,
      up ? KEYBOARD_UP_TRANSITION : KEYBOARD_DOWN_TRANSITION
    );
    if (up) {
      root.style.setProperty(VISUAL_VIEWPORT_SAFE_BOTTOM_VAR, '0px');
      root.setAttribute(KEYBOARD_OPEN_ATTR, '');
    } else {
      root.style.removeProperty(VISUAL_VIEWPORT_SAFE_BOTTOM_VAR);
      root.removeAttribute(KEYBOARD_OPEN_ATTR);
    }
    keyboardListeners.forEach((listener) => listener(up));
  };

  const apply = () => {
    // A pinch zoom pans the visual viewport over the page: the box keeps its last place.
    if (Math.abs(viewport.scale - 1) > 0.01) return;
    setTop(viewport.offsetTop);
    const up = root.clientHeight - viewport.height > KEYBOARD_MIN_HEIGHT;
    // The keyboard on its way down: the box has its whole height already.
    if (up && Date.now() < downUntil) return;
    if (!up) {
      wholeHeight = viewport.height;
      downUntil = 0;
    }
    setHeight(viewport.height);
    setKeyboard(up);
  };
  // A field lets the caret go and no other takes it: the keyboard goes down now.
  const onFocusOut = (event: FocusEvent) => {
    if (!keyboard || !isKeyboardField(event.target)) return;
    if (isKeyboardField(event.relatedTarget)) return;
    downUntil = Date.now() + KEYBOARD_DOWN_TIME;
    setKeyboard(false);
    setHeight(wholeHeight ?? root.clientHeight);
  };
  // A field takes the caret back while the keyboard goes down: the viewport leads again.
  const onFocusIn = (event: FocusEvent) => {
    if (!downUntil || !isKeyboardField(event.target)) return;
    downUntil = 0;
    apply();
  };

  apply();
  // In the viewport's own events, not a frame later: a box that fits it (a screen, a sheet
  // stood up) is never a frame off it as the keyboard comes or goes.
  viewport.addEventListener('resize', apply);
  viewport.addEventListener('scroll', apply);
  document.addEventListener('focusout', onFocusOut);
  document.addEventListener('focusin', onFocusIn);
  return () => {
    viewport.removeEventListener('resize', apply);
    viewport.removeEventListener('scroll', apply);
    document.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('focusin', onFocusIn);
    root.style.removeProperty(VISUAL_VIEWPORT_TOP_VAR);
    root.style.removeProperty(VISUAL_VIEWPORT_HEIGHT_VAR);
    root.style.removeProperty(VISUAL_VIEWPORT_SAFE_BOTTOM_VAR);
    root.style.removeProperty(VISUAL_VIEWPORT_TRANSITION_VAR);
    root.removeAttribute(KEYBOARD_OPEN_ATTR);
    keyboardUp = false;
  };
}

/** Screens that fit the visual viewport now, and the stop of the one tracking for them. */
let users = 0;
let stop: (() => void) | null = null;

/**
 * Keeps the visual viewport's box in CSS variables on the root element while a screen
 * needs it: one tracking for all of them. Returns the release.
 */
export function retainViewportBox(): () => void {
  if (users === 0 && window.visualViewport) stop = track(window.visualViewport);
  users += 1;
  return () => {
    users -= 1;
    if (users > 0) return;
    stop?.();
    stop = null;
  };
}
