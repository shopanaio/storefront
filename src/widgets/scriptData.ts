/* eslint-disable import/no-anonymous-default-export */
export type ScriptDataOptions = {
  /** Match a script tag by checking that its src includes this substring. */
  srcIncludes?: string;
};

/**
 * Returns the <script> element that loaded the current widget, preferring
 * document.currentScript and falling back to a search by src substring.
 */
export function findSelfScript(opts?: ScriptDataOptions): HTMLScriptElement | null {
  try {
    const cur = (document.currentScript as HTMLScriptElement | null) || null;
    if (cur) return cur;
  } catch {}
  const srcIncludes = opts?.srcIncludes;
  if (!srcIncludes) return null;
  try {
    const scripts = Array.from(document.querySelectorAll('script')) as HTMLScriptElement[];
    for (const s of scripts) {
      const src = s.getAttribute('src') || '';
      if (src && src.includes(srcIncludes)) return s;
    }
  } catch {}
  return null;
}

/** Read a specific data-* attribute (without the 'data-' prefix). */
export function readScriptDataAttr(
  name: string,
  opts?: ScriptDataOptions
): string | undefined {
  const s = findSelfScript(opts);
  if (!s) return undefined;
  try {
    const viaGetAttr = s.getAttribute(`data-${name}`);
    if (viaGetAttr != null) return viaGetAttr;
  } catch {}
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = (s as any)?.dataset?.[name as keyof DOMStringMap];
    if (v != null) return String(v);
  } catch {}
  return undefined;
}

/** Return the dataset of the script as a plain object (shallow copy). */
export function readScriptDataset(opts?: ScriptDataOptions): Record<string, string> | undefined {
  const s = findSelfScript(opts);
  if (!s) return undefined;
  const out: Record<string, string> = {};
  try {
    const ds = s.dataset;
    for (const k in ds) {
      const v = ds[k as keyof DOMStringMap];
      if (typeof v === 'string') out[k] = v;
    }
  } catch {}
  return Object.keys(out).length ? out : undefined;
}

export default {
  findSelfScript,
  readScriptDataAttr,
  readScriptDataset,
};
