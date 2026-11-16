/** Fields that take the keyboard. */
export const KEYBOARD_FIELD =
  'textarea, input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=file]):not([type=range]):not([type=color])';

export type KeyboardField = HTMLInputElement | HTMLTextAreaElement;

/** Whether the element takes the keyboard. */
export const isKeyboardField = (
  element: EventTarget | null
): element is KeyboardField =>
  element instanceof Element && element.matches(KEYBOARD_FIELD);

/** Puts text after a field's own as typed: React's controlled value follows it. */
export function typeInto(field: KeyboardField, text: string) {
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(
    field,
    field.value + text
  );
  field.dispatchEvent(new Event('input', { bubbles: true }));
}

/** The caret after the field's text. */
export function caretToEnd(field: KeyboardField) {
  const end = field.value.length;
  try {
    field.setSelectionRange(end, end);
  } catch {
    // Fields without a text selection (email, number).
  }
}
