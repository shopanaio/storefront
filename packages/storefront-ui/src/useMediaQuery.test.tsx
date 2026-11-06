import { cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { StorefrontUIProvider, type Viewport } from './StorefrontUIProvider';
import { matchesWidth, useBreakpointDown } from './useMediaQuery';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** The window answers every query with `matches`. */
const windowMatches = (matches: boolean) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches,
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList
  );

function Probe() {
  return <output>{useBreakpointDown('lg') ? 'sheet' : 'panel'}</output>;
}

const withViewport = (viewport?: Viewport) =>
  viewport ? (
    <StorefrontUIProvider viewport={viewport}>
      <Probe />
    </StorefrontUIProvider>
  ) : (
    <Probe />
  );

it('reads min-width and max-width queries against a width', () => {
  expect(matchesWidth('(max-width: 1023.95px)', 375)).toBe(true);
  expect(matchesWidth('(max-width: 1023.95px)', 1024)).toBe(false);
  expect(
    matchesWidth('(min-width: 768px) and (max-width: 1023.95px)', 800)
  ).toBe(true);
  expect(matchesWidth('(hover: hover)', 1024)).toBe(false);
});

it('answers for the assumed width until the host has hydrated', () => {
  windowMatches(false);
  const viewport = { hydrated: false, assumedWidth: 375 };
  expect(renderToString(withViewport(viewport))).toContain('sheet');
  render(withViewport(viewport));
  expect(screen.getByRole('status')).toHaveTextContent('sheet');
});

it('answers for the window once the host has hydrated', () => {
  windowMatches(false);
  render(withViewport({ hydrated: true, assumedWidth: 375 }));
  expect(screen.getByRole('status')).toHaveTextContent('panel');
});

it('answers for the window without a provider', () => {
  windowMatches(true);
  render(withViewport());
  expect(screen.getByRole('status')).toHaveTextContent('sheet');
});
