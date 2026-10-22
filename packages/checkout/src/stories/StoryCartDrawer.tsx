import { Flex } from 'antd';
import { useSyncExternalStore } from 'react';
import { SummaryItem } from '#checkout/components/summary/SummaryItem';
import { DrawerBase } from '#checkout/ui/DrawerBase';
import { useMockCheckout } from './mockCheckout';

/**
 * The cart of the store in the stories: the theme's cart drawer stands in the host app, so the
 * stories open this one with the lines of the mock checkout.
 */
let open = false;
const listeners = new Set<() => void>();

function setOpen(next: boolean) {
  open = next;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** `useOpenCart` of the story theme. */
export const useOpenStoryCart = () => () => setOpen(true);

/** `CartDrawer` of the story theme. */
export function StoryCartDrawer() {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => open,
    () => false
  );
  const checkout = useMockCheckout();
  return (
    <DrawerBase open={isOpen} onClose={() => setOpen(false)} title="Cart">
      <Flex vertical gap={8}>
        {checkout?.lines.map((line) => (
          <SummaryItem key={line.id} line={line} />
        ))}
      </Flex>
    </DrawerBase>
  );
}
