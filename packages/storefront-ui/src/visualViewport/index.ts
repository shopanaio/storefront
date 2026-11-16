/**
 * The screen above the keyboard. iOS Safari leaves the layout viewport (`100dvh`,
 * `position: fixed`, `sticky`) under its keyboard and shrinks or pans only the visual
 * viewport: the visual viewport's box in CSS variables, the keyboard's state, and a tap in a
 * field with no pan of iOS up to it. The sheets stand over the keyboard with them; a theme's
 * screens do too.
 */
export {
  FIELD_BOX_ATTR,
  FOCUS_PENDING_ATTR,
  hasFocusedField,
  KEYBOARD_DOWN_TRANSITION,
  KEYBOARD_OPEN_ATTR,
  KEYBOARD_UP_TRANSITION,
  VISUAL_VIEWPORT_HEIGHT,
  VISUAL_VIEWPORT_HEIGHT_VAR,
  VISUAL_VIEWPORT_SAFE_BOTTOM,
  VISUAL_VIEWPORT_SAFE_BOTTOM_VAR,
  VISUAL_VIEWPORT_TOP,
  VISUAL_VIEWPORT_TOP_VAR,
  VISUAL_VIEWPORT_TRANSITION_VAR,
} from './constants';
export { isKeyboardField, type KeyboardField } from './fields';
export {
  isKeyboardUp,
  onKeyboardChange,
  retainViewportBox,
} from './viewportBox';
export { focusFieldsWithoutPan } from './focusWithoutPan';
export { useKeyboardUp } from './useKeyboardUp';
