import { FIELD_BOX_ATTR, FOCUS_PENDING_ATTR } from './constants';
import {
  caretToEnd,
  isKeyboardField,
  KEYBOARD_FIELD,
  typeInto,
  type KeyboardField,
} from './fields';
import { isKeyboardUp, onKeyboardChange } from './viewportBox';

/** How far a touch moves at most to be a tap, not a scroll, px. */
const TAP_SLOP = 10;

/** The attributes of a field that shape its keyboard: the stand-in copies them. */
const KEYBOARD_ATTRIBUTES = [
  'type',
  'autocapitalize',
  'autocorrect',
  'autocomplete',
  'spellcheck',
  'enterkeyhint',
  'inputmode',
  'lang',
  'dir',
];

/**
 * How long the screen takes to fit above the keyboard after it has come up, ms at most: a
 * screen's own transition of its height (280ms) included.
 */
const FIT_TIMEOUT = 600;

/**
 * Where `container` and `field` stand, while the keyboard is up: the same two frames in a row,
 * the screen has stopped moving (its own transition included). A screen under which the
 * keyboard covers its bottom has no edge at the keyboard to wait for.
 */
const placeOf = (container: HTMLElement, field: HTMLElement) => {
  const box = container.getBoundingClientRect();
  const rect = field.getBoundingClientRect();
  return `${Math.round(box.top)} ${Math.round(box.height)} ${Math.round(rect.top)}`;
};

/**
 * Shows `field` in the scrolls of `container` it lies in, none outside it: the window and the
 * visual viewport stay where they are (`scrollIntoView` of iOS pans them as well, with the
 * keyboard up).
 */
function revealIn(container: HTMLElement, field: HTMLElement) {
  let node = field.parentElement;
  while (node && node !== container.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      node.scrollHeight > node.clientHeight
    ) {
      const box = node.getBoundingClientRect();
      const rect = field.getBoundingClientRect();
      // Its bottom in view: over the keyboard where the keyboard covers it.
      const viewport = window.visualViewport;
      const bottom = viewport
        ? Math.min(box.bottom, viewport.offsetTop + viewport.height)
        : box.bottom;
      if (rect.bottom > bottom) node.scrollTop += rect.bottom - bottom;
      else if (rect.top < box.top) node.scrollTop -= box.top - rect.top;
    }
    node = node.parentElement;
  }
}

/** How long the keyboard takes to come up at most; then the field takes the caret anyway. */
const KEYBOARD_TIMEOUT = 1000;

/**
 * An invisible field of `field`'s keyboard at the top of the screen, with the caret. It lies
 * in `container`: a dialog (a sheet) keeps the focus in itself and would take it back from a
 * field outside. In a container that is the containing block of fixed boxes (a sheet's
 * transform) it is moved up to the top of the screen.
 */
function createStandIn(
  field: KeyboardField,
  container: HTMLElement
): KeyboardField {
  const standIn = document.createElement(
    field.tagName.toLowerCase()
  ) as KeyboardField;
  for (const name of KEYBOARD_ATTRIBUTES) {
    const value = field.getAttribute(name);
    if (value !== null) standIn.setAttribute(name, value);
  }
  standIn.setAttribute('aria-hidden', 'true');
  standIn.tabIndex = -1;
  Object.assign(standIn.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '1px',
    height: '1px',
    padding: '0',
    border: '0',
    margin: '0',
    opacity: '0',
    // Under 16px iOS would zoom into it.
    fontSize: '16px',
    resize: 'none',
    pointerEvents: 'none',
  });
  container.appendChild(standIn);
  const { top } = standIn.getBoundingClientRect();
  if (top !== 0) standIn.style.top = `${-top}px`;
  standIn.focus({ preventScroll: true });
  return standIn;
}

/**
 * Focuses `field` of the screen `container` through a stand-in: an invisible field of the
 * same keyboard at the top of the screen takes the caret, the keyboard comes up under it,
 * and once the screen has fitted above the keyboard the field, shown in its scroll, takes
 * the caret over (the keyboard stays), with what was typed meanwhile. `onDone` follows the
 * hand-over, done or cancelled. Returns the cancel.
 */
function focusThroughStandIn(
  container: HTMLElement,
  field: KeyboardField,
  onDone: () => void
): () => void {
  const standIn = createStandIn(field, container);
  field.setAttribute(FOCUS_PENDING_ATTR, '');

  let frame = 0;
  const end = () => {
    window.clearTimeout(keyboardTimer);
    cancelAnimationFrame(frame);
    unsubscribe();
    field.removeAttribute(FOCUS_PENDING_ATTR);
    standIn.remove();
    onDone();
  };
  const handOver = () => {
    // The caret went elsewhere meanwhile (the keyboard was put away): the field stays as is.
    if (document.activeElement === standIn) {
      // Over the keyboard in the screen's scroll.
      revealIn(container, field);
      // The screen stands above the keyboard and the field in it: nothing for iOS to pan to.
      field.focus({ preventScroll: true });
      if (standIn.value) typeInto(field, standIn.value);
      // The caret after the text, as the composer puts it.
      caretToEnd(field);
    }
    end();
  };
  // The screen takes the keyboard's height (with its transition, or as it leaves the
  // window's flow): the field takes the caret once the screen stands above the keyboard.
  let lastPlace: string | null = null;
  const waitForFit = (deadline: number) => {
    frame = requestAnimationFrame(() => {
      // Fitted and still: the same place as the frame before (no transition under way).
      const place = placeOf(container, field);
      const settled = place === lastPlace;
      lastPlace = place;
      if (settled || Date.now() >= deadline) handOver();
      else waitForFit(deadline);
    });
  };
  const unsubscribe = onKeyboardChange((up) => {
    if (!up || frame) return;
    // The keyboard is up: the hand-over waits for the screen to fit, not for this timer.
    window.clearTimeout(keyboardTimer);
    waitForFit(Date.now() + FIT_TIMEOUT);
  });
  // No soft keyboard (a hardware one): it never comes up.
  const keyboardTimer = window.setTimeout(handOver, KEYBOARD_TIMEOUT);
  return end;
}

/** The field a tap on `target` focuses: the field itself, or the one in its box. */
const fieldOf = (target: EventTarget | null): KeyboardField | null => {
  if (!(target instanceof Element)) return null;
  // A control of a field (its clear button, its country) does what it does.
  if (target.closest('button, a, [role="button"]')) return null;
  // The label of a field (a floating one over it) focuses its field.
  const labelled = target.closest('label')?.control;
  return (
    target.closest<KeyboardField>(KEYBOARD_FIELD) ??
    (isKeyboardField(labelled ?? null) ? (labelled as KeyboardField) : null) ??
    target
      .closest(`[${FIELD_BOX_ATTR}]`)
      ?.querySelector<KeyboardField>(KEYBOARD_FIELD) ??
    null
  );
};

/**
 * A tap in a field of `container` focuses it without iOS panning the screen up to it. iOS
 * pans the whole page (with its fixed header) so that the field it focuses is above the
 * keyboard coming up, and gives it back only once the keyboard is in: the screen flies up
 * and drops back. With the keyboard down the field takes the caret through a stand-in at the
 * top of the screen (focusThroughStandIn); with it up the screen already stands above it.
 * A tap in the field that has the caret is left to the browser (it places the caret).
 * `onTap` hears of the field a tap begins to focus, before the keyboard comes up (a sheet
 * stands up to the keyboard's height at once). Returns the cleanup.
 */
export function focusFieldsWithoutPan(
  container: HTMLElement,
  onTap?: (field: KeyboardField) => void
): () => void {
  let start: { x: number; y: number } | null = null;
  // The cancel of the hand-over under way.
  let cancel: (() => void) | null = null;
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    start =
      event.touches.length === 1 && touch
        ? { x: touch.clientX, y: touch.clientY }
        : null;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    const from = start;
    start = null;
    if (!from || !touch) return;
    if (
      Math.abs(touch.clientX - from.x) > TAP_SLOP ||
      Math.abs(touch.clientY - from.y) > TAP_SLOP
    )
      return;
    const field = fieldOf(event.target);
    if (
      !field ||
      field === document.activeElement ||
      field.disabled ||
      field.readOnly
    )
      return;
    // No focus of the browser's own: it would pan.
    event.preventDefault();
    // The keyboard is up: the field, shown over it in the screen's scroll, takes the caret
    // at once (iOS pans the page to a field it would cover, from the field the caret leaves).
    if (isKeyboardUp() && !cancel) {
      revealIn(container, field);
      field.focus({ preventScroll: true });
      caretToEnd(field);
      return;
    }
    // A second tap while the keyboard comes up: the hand-over under way goes on.
    if (cancel) return;
    onTap?.(field);
    cancel = focusThroughStandIn(container, field, () => {
      cancel = null;
    });
  };
  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchend', onTouchEnd, { passive: false });
  return () => {
    cancel?.();
    container.removeEventListener('touchstart', onTouchStart);
    container.removeEventListener('touchend', onTouchEnd);
  };
}
