import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { App } from 'antd';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { useModalStackContext } from '../hooks/use-modal-context';
import { modalStackRegistry } from '../registry/modal-registry';
import { useModalStackStore } from '../store/modals';
import type { IModalStackDefinition } from '../types';
import { createModalUrlCodec } from '../url/projection';
import { ModalStack } from './modals';

vi.mock('@shopana/storefront/navigation', () => ({
  usePathname: () => window.location.pathname,
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

function ProductModal() {
  const { payload, pop, setDirty } = useModalStackContext();
  return (
    <div>
      <p>Product {String(payload.entityId)}</p>
      <button onClick={() => setDirty(true)}>Edit</button>
      <button onClick={pop}>Close</button>
    </div>
  );
}

const items = (): IModalStackDefinition[] => [
  {
    type: 'product',
    component: ProductModal,
    url: createModalUrlCodec({
      schema: z.object({ id: z.string().min(1) }),
      project: (payload) => ({ id: String(payload.entityId ?? '') }),
      restore: ({ id }) => ({ entityId: id }),
    }),
  },
];

function renderStack(messages: Record<string, unknown> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <App>
        <ModalStack items={items} />
      </App>
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  modalStackRegistry.clear();
  useModalStackStore.setState({ items: [], urlScope: null });
  window.history.replaceState(null, '', '/catalog?sort=price');
});

afterEach(() => {
  useModalStackStore.setState({ items: [], urlScope: null });
});

describe('ModalStack', () => {
  it('opens a modal pushed to the store and projects it to the URL', async () => {
    renderStack();
    act(() => {
      useModalStackStore
        .getState()
        .push('product', { entityId: 'p1' }, { url: true });
    });
    expect(await screen.findByText('Product p1')).toBeInTheDocument();
    expect(window.location.search).toBe(
      '?sort=price&modals[0][type]=product&modals[0][id]=p1'
    );
  });

  it('restores the stack from the URL on page load', async () => {
    window.history.replaceState(
      null,
      '',
      '/catalog?modals[0][type]=product&modals[0][id]=a&modals[1][type]=product&modals[1][id]=b'
    );
    renderStack();
    expect(await screen.findByText('Product a')).toBeInTheDocument();
    expect(await screen.findByText('Product b')).toBeInTheDocument();
    expect(
      useModalStackStore.getState().items.map((item) => item.payload.entityId)
    ).toEqual(['a', 'b']);
  });

  it('asks before closing a dirty modal with the texts the host overrides', async () => {
    renderStack({ ModalStack: { leave: 'Discard' } });
    act(() => {
      useModalStackStore.getState().push('product', { entityId: 'p1' });
    });
    fireEvent.click(await screen.findByText('Edit'));
    fireEvent.click(screen.getByText('Close'));

    const leave = await screen.findByTestId('modal-confirm-leave');
    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
    expect(leave).toHaveTextContent('Discard');
    fireEvent.click(leave);

    await waitFor(() =>
      expect(useModalStackStore.getState().items).toHaveLength(0)
    );
  });
});
