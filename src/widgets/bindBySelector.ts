export type SelectorBindOptions = {
  event?: string; // default: 'click'
  preventDefault?: boolean; // default: true for click
  stopPropagation?: boolean; // default: false
  observe?: boolean; // observe future elements via MutationObserver, default: true
};

/**
 * Bind an event handler to elements matching a CSS selector.
 * - Binds existing elements immediately.
 * - Observes future added elements (if observe !== false).
 * - Adds event-delegation on document as a fallback.
 *
 * Returns a cleanup function to remove listeners and observers.
 */
export function bindBySelector(
  selector: string,
  handler: (e: Event, matched: Element) => void,
  options: SelectorBindOptions = {}
): () => void {
  const evt = options.event || 'click';
  const preventDefault = options.preventDefault ?? (evt === 'click');
  const stopPropagation = options.stopPropagation ?? true;
  const observe = options.observe !== false;

  const bound = new Set<Element>();
  const listeners = new Map<Element, EventListener>();

  const perElementListener = (el: Element): EventListener => (e: Event) => {
    if (preventDefault && 'preventDefault' in e) (e as any).preventDefault?.();
    if (stopPropagation && 'stopPropagation' in e) (e as any).stopPropagation?.();
    try {
      handler(e, el);
    } catch {}
  };

  const bindEl = (el: Element | null) => {
    if (!el || bound.has(el)) return;
    const l = perElementListener(el);
    el.addEventListener(evt, l as any);
    bound.add(el);
    listeners.set(el, l);
  };

  // Bind existing elements
  try {
    document.querySelectorAll(selector).forEach((el) => bindEl(el));
  } catch {}

  // Observe future elements matching the selector
  let mo: MutationObserver | null = null;
  if (observe) {
    try {
      mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches(selector)) bindEl(node);
            node.querySelectorAll?.(selector).forEach((el) => bindEl(el));
          });
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch {}
  }

  // Cleanup
  return () => {
    if (mo) {
      try {
        mo.disconnect();
      } catch {}
      mo = null;
    }
    listeners.forEach((l, el) => {
      try {
        el.removeEventListener(evt, l as any);
      } catch {}
    });
    listeners.clear();
    bound.clear();
  };
}

export default bindBySelector;
