/** The visual viewport's offset from the layout viewport's top, px, on the root element. */
export const VISUAL_VIEWPORT_TOP_VAR = '--visual-viewport-top';
/** The visual viewport's height, px, on the root element. */
export const VISUAL_VIEWPORT_HEIGHT_VAR = '--visual-viewport-height';
/**
 * The bottom safe area of the visual viewport: 0px while the keyboard covers the screen's
 * bottom edge, unset otherwise.
 */
export const VISUAL_VIEWPORT_SAFE_BOTTOM_VAR = '--visual-viewport-safe-bottom';
/**
 * How the box takes its new height, on the root element: the keyboard's own pace as it goes
 * down, a little after it as it comes up (the box learns its height only once it is up).
 */
export const VISUAL_VIEWPORT_TRANSITION_VAR = '--visual-viewport-transition';

/** On the root element while the keyboard covers the screen's bottom edge. */
export const KEYBOARD_OPEN_ATTR = 'data-keyboard-open';

/**
 * On a box around a field whose press puts the caret into the field (its padding): a tap
 * there focuses the field as a tap on it does.
 */
export const FIELD_BOX_ATTR = 'data-field-box';

/**
 * On a field while it takes the caret through a stand-in (the keyboard comes up): what
 * follows the field's focus can follow it from the tap on.
 */
export const FOCUS_PENDING_ATTR = 'data-focus-pending';

/** As the keyboard comes up: smoothly, a little after it. */
export const KEYBOARD_UP_TRANSITION = '280ms cubic-bezier(0.22, 1, 0.36, 1)';
/** As the keyboard goes down: with it, at the pace of iOS's keyboard. */
export const KEYBOARD_DOWN_TRANSITION =
  '250ms cubic-bezier(0.17, 0.59, 0.4, 0.77)';

/** The top of the visual viewport: where a box that fits it starts. */
export const VISUAL_VIEWPORT_TOP = `var(${VISUAL_VIEWPORT_TOP_VAR}, 0px)`;

/** The height of the visual viewport, the screen's before it is known. */
export const VISUAL_VIEWPORT_HEIGHT = `var(${VISUAL_VIEWPORT_HEIGHT_VAR}, 100dvh)`;

/** The bottom safe area, none while the keyboard covers the screen's bottom edge. */
export const VISUAL_VIEWPORT_SAFE_BOTTOM = `var(${VISUAL_VIEWPORT_SAFE_BOTTOM_VAR}, env(safe-area-inset-bottom))`;

/**
 * A selector of a box with the caret in its `field`, from the tap on: while the keyboard
 * comes up the caret waits in a stand-in and the field is marked pending.
 */
export const hasFocusedField = (field: string) =>
  `:has(${field}:focus, ${field}[${FOCUS_PENDING_ATTR}])`;
