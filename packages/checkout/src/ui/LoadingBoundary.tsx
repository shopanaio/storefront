'use client';

import {
  Component,
  Suspense,
  use,
  useCallback,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { LoadError, retryFailedLoads } from '#checkout/infra/loadCache';
import { Banner } from '@shopana/storefront-ui';

/** Shortest time a skeleton stays up once shown, so a fast answer does not flash it. */
export const MIN_SKELETON_MS = 400;

/** A wait React `use` reads without suspending once it is over (see `Load` in loadCache). */
function wait(ms: number): Promise<void> {
  const promise: Promise<void> & { status?: string } = new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
  promise.status = 'pending';
  void promise.then(() => {
    promise.status = 'fulfilled';
  });
  return promise;
}

/** Starts the shortest time of the skeleton when it appears. */
function Fallback({
  onShown,
  children,
}: {
  onShown: (hold: Promise<void>) => void;
  children: ReactNode;
}) {
  useEffect(() => {
    onShown(wait(MIN_SKELETON_MS));
  }, [onShown]);
  return children;
}

/** Waits for the skeleton's shortest time before the content shows. */
function Held({
  hold,
  onShown,
  children,
}: {
  hold: Promise<void> | null;
  onShown: () => void;
  children: ReactNode;
}) {
  if (hold) {
    use(hold);
  }
  useEffect(() => {
    if (hold) onShown();
  }, [hold, onShown]);
  return children;
}

/** Says a part failed to load and loads it again on "Retry". */
function LoadFailed({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('Checkout');
  return (
    <Banner
      tone="warning"
      title={t('load-failed')}
      action={{ label: t('banner-retry'), onClick: onRetry }}
    />
  );
}

/** Shows a `LoadError` with "Retry"; other errors go on to the boundaries above. */
class LoadErrorBoundary extends Component<
  { children: ReactNode },
  { error: LoadError | null }
> {
  state = { error: null as LoadError | null };

  static getDerivedStateFromError(error: unknown) {
    if (error instanceof LoadError) {
      return { error };
    }
    throw error;
  }

  retry = () => {
    retryFailedLoads();
    this.setState({ error: null });
  };

  render() {
    return this.state.error ? (
      <LoadFailed onRetry={this.retry} />
    ) : (
      this.props.children
    );
  }
}

/**
 * The one way the checkout shows a part that is loading: its skeleton stays up while the part
 * waits for data (`pending`) or for anything inside to load (modules, their messages: React
 * Suspense), then the whole part shows at once, so it never comes in piece by piece or shows a
 * gap. Once up, the skeleton stays at least MIN_SKELETON_MS, counted once across both kinds of
 * waiting. What was loaded before renders at once, with no skeleton. A part that failed to load
 * says so with a "Retry".
 */
export function LoadingBoundary({
  fallback,
  pending = false,
  children,
}: {
  fallback: ReactNode;
  /** The part waits for its data: the skeleton shows, the content is not rendered. */
  pending?: boolean;
  children: ReactNode;
}) {
  const [hold, setHold] = useState<Promise<void> | null>(null);
  // The first skeleton of a wait sets its shortest time; a skeleton shown again in the same
  // wait (data, then a module) keeps it.
  const startHold = useCallback(
    (next: Promise<void>) => setHold((current) => current ?? next),
    []
  );
  const endHold = useCallback(() => setHold(null), []);
  const skeleton = <Fallback onShown={startHold}>{fallback}</Fallback>;
  return (
    <LoadErrorBoundary>
      {pending ? (
        skeleton
      ) : (
        <Suspense fallback={skeleton}>
          <Held hold={hold} onShown={endHold}>
            {children}
          </Held>
        </Suspense>
      )}
    </LoadErrorBoundary>
  );
}

/**
 * Whether to show the skeleton of something waiting for data, for parts that cannot be wrapped
 * in a `LoadingBoundary`: while it waits, and at least MIN_SKELETON_MS since it showed.
 */
export function useHeldPending(pending: boolean): boolean {
  const [shownAt, setShownAt] = useState<number | null>(null);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (pending) {
      // Таймер гарантирует минимальное время показа скелетона после начала ожидания.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShownAt((current) => current ?? Date.now());
      setHeld(true);
      return;
    }
    if (shownAt === null) {
      return;
    }
    const timer = setTimeout(
      () => {
        setShownAt(null);
        setHeld(false);
      },
      Math.max(0, MIN_SKELETON_MS - (Date.now() - shownAt))
    );
    return () => clearTimeout(timer);
  }, [pending, shownAt]);
  return pending || held;
}
