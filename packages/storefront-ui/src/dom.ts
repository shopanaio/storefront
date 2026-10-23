import type { AriaAttributes } from 'react';

/** `id`, `aria-*` and `data-*` a component forwards to its main element. */
export type DomAttributes = AriaAttributes & {
  id?: string;
  [data: `data-${string}`]: string | number | boolean | undefined;
};

/** Sets the attributes on an element the component cannot render them on itself. */
export function applyDomAttributes(
  element: HTMLElement,
  attributes: DomAttributes
): () => void {
  const entries = Object.entries(attributes).filter(
    ([, value]) => value !== undefined
  );
  for (const [name, value] of entries)
    element.setAttribute(name, String(value));
  return () => {
    for (const [name] of entries) element.removeAttribute(name);
  };
}
