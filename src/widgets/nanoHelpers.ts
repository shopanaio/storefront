import { create as createNano } from 'nano-css';
import { addon as addonRule } from 'nano-css/addon/rule';

export type NanoCtx = {
  rule: (css: Record<string, any>, block?: string) => string;
  add: (el: Element, ...cls: string[]) => void;
  remove: (el: Element, ...cls: string[]) => void;
};

function splitTokens(name: string): string[] {
  return String(name).trim().split(/\s+/).filter(Boolean);
}

export function initNanoInDoc(doc: Document, nonce?: string, pfx?: string): NanoCtx {
  const styleEl = doc.createElement('style');
  if (nonce) styleEl.setAttribute('nonce', String(nonce));
  (doc.head || doc.documentElement).appendChild(styleEl);

  // nano runtime expects the element; it uses setAttribute and .sheet
  const nano = createNano({ sh: styleEl as unknown as CSSStyleSheet, pfx });
  addonRule(nano);

  const rule = (css: Record<string, any>, block?: string) => (nano.rule!(css, block) || '').trim();
  const add = (el: Element, ...cls: string[]) => {
    cls.flatMap(splitTokens).forEach((t) => el.classList.add(t));
  };
  const remove = (el: Element, ...cls: string[]) => {
    cls.flatMap(splitTokens).forEach((t) => el.classList.remove(t));
  };

  return { rule, add, remove };
}

