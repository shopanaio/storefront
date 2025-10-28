import zoid from 'zoid';
import type { StringMatcher } from 'zoid';

export type WidgetChildOptions<P = any> = {
  tag: string;
  allowedParentDomains?: StringMatcher;
  autoResize?: { width?: boolean; height?: boolean; element?: string };
  onProps?: (props: P) => void;
  exports?: Record<string, any>;
};

// Universal initializer for child-side widget setup
export function setupWidgetChild<P = any>({
  tag,
  allowedParentDomains = /.*/,
  autoResize = { height: true, element: 'body' },
  onProps,
  exports,
}: WidgetChildOptions<P>): void {
  try {
    const Component = zoid.create<P, any>({
      tag,
      url: () => window.location.href,
      allowedParentDomains,
      autoResize,
    });

    if (!Component.isChild()) return;

    const xprops = Component.xprops as any;

    try {
      if (exports) {
        xprops.export(exports);
      }
    } catch (_) {
      // noop
    }

    if (onProps && typeof xprops.onProps === 'function') {
      xprops.onProps(onProps);
    }
  } catch {}
}

export default setupWidgetChild;
