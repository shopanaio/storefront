import { cleanup, render, screen } from '@testing-library/react';
import { StorefrontUIProvider } from '../StorefrontUIProvider';
import { DrawerBase } from './DrawerBase';

afterEach(cleanup);

/** Every media query of the drawer answers `matches`: below the breakpoint, or above it. */
const setSheet = (matches: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
};

describe('DrawerBase', () => {
  it('a side panel has a close button named by the texts, and the title names the drawer', () => {
    setSheet(false);
    render(
      <StorefrontUIProvider texts={{ close: 'Закрити' }}>
        <DrawerBase open onClose={vi.fn()} title="Кошик">
          content
        </DrawerBase>
      </StorefrontUIProvider>
    );

    expect(screen.getByRole('button', { name: 'Закрити' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Кошик' })).toBeInTheDocument();
  });

  it('a bottom sheet has no close button unless asked for', () => {
    setSheet(true);
    const { rerender } = render(
      <DrawerBase open onClose={vi.fn()} title="Cart">
        content
      </DrawerBase>
    );
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();

    rerender(
      <DrawerBase open onClose={vi.fn()} title="Cart" showCloseButton>
        content
      </DrawerBase>
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('a side panel hides the close button when told to', () => {
    setSheet(false);
    render(
      <DrawerBase open onClose={vi.fn()} title="Cart" showCloseButton={false}>
        content
      </DrawerBase>
    );
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('a header of its own is named by its title, and its close button shows in a sheet', () => {
    setSheet(true);
    render(
      <DrawerBase
        open
        onClose={vi.fn()}
        header={
          <DrawerBase.Header>
            <DrawerBase.Title>Filters</DrawerBase.Title>
            <DrawerBase.CloseButton />
          </DrawerBase.Header>
        }
      >
        content
      </DrawerBase>
    );

    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('a drawer without a title still has a name', () => {
    setSheet(false);
    render(
      <DrawerBase open onClose={vi.fn()} showCloseButton={false}>
        content
      </DrawerBase>
    );
    expect(screen.getByRole('dialog', { name: 'Dialog' })).toBeInTheDocument();
  });
});
