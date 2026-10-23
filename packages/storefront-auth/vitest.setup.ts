import '@testing-library/jest-dom/vitest';

// antd inputs and popovers measure themselves; jsdom has no ResizeObserver or matchMedia.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

// Server suites run in the node environment, without a window.
if (typeof window !== 'undefined') {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
