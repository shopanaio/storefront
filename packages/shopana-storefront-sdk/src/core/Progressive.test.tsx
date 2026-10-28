import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { DataBoundary } from './DataBoundary';
import { createRevealQueue, ProgressiveProvider } from './Progressive';

/** Parts in the order of the document, each with a spy for its turn. */
function parts(count: number) {
  const host = document.createElement('div');
  document.body.append(host);
  return Array.from({ length: count }, () => {
    const element = document.createElement('div');
    host.append(element);
    return { element, show: vi.fn() };
  });
}

/** Runs what the queue waits for: microtasks (eager turns) and the idle fallback timer. */
async function idle() {
  await act(async () => {
    await Promise.resolve();
    vi.advanceTimersByTime(60);
  });
}

describe('createRevealQueue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no requestIdleCallback: the queue's timer fallback runs.
    vi.stubGlobal('requestIdleCallback', undefined);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('shows the parts one by one, in the order of the document', async () => {
    const queue = createRevealQueue(0);
    const [a, b, c] = parts(3);
    // Put in line out of order: the document decides.
    queue.add(c.element, c.show);
    queue.add(a.element, a.show);
    queue.add(b.element, b.show);

    await idle();
    expect(a.show).toHaveBeenCalledTimes(1);
    expect(b.show).not.toHaveBeenCalled();

    // The next one waits for the one showing to be committed.
    await idle();
    expect(b.show).not.toHaveBeenCalled();

    queue.shown(a.element);
    await idle();
    expect(b.show).toHaveBeenCalledTimes(1);
    expect(c.show).not.toHaveBeenCalled();

    queue.shown(b.element);
    await idle();
    expect(c.show).toHaveBeenCalledTimes(1);
  });

  it('goes on when the part showing unmounts before it is committed', async () => {
    const queue = createRevealQueue(0);
    const [a, b] = parts(2);
    const removeA = queue.add(a.element, a.show);
    queue.add(b.element, b.show);

    await idle();
    expect(a.show).toHaveBeenCalledTimes(1);

    // A conditional section gone before its commit: its `shown` never comes.
    removeA();
    await idle();
    expect(b.show).toHaveBeenCalledTimes(1);
  });

  it('ignores a part shown before reporting again', async () => {
    const queue = createRevealQueue(0);
    const [a, b, c] = parts(3);
    queue.add(a.element, a.show);
    queue.add(b.element, b.show);
    queue.add(c.element, c.show);

    await idle();
    queue.shown(a.element);
    await idle();
    expect(b.show).toHaveBeenCalledTimes(1);

    // A screen uncovered: the effects of A mount again while B is showing.
    queue.shown(a.element);
    await idle();
    expect(c.show).not.toHaveBeenCalled();

    queue.shown(b.element);
    await idle();
    expect(c.show).toHaveBeenCalledTimes(1);
  });

  it('takes a part shown while back in line out of the line', async () => {
    const queue = createRevealQueue(0);
    const [a, b] = parts(2);
    const removeA = queue.add(a.element, a.show);
    queue.add(b.element, b.show);

    await idle();
    // Hidden while showing (its screen covered), then in line again, then its show commits.
    removeA();
    queue.add(a.element, a.show);
    queue.shown(a.element);

    await idle();
    // B goes on; A has no second turn.
    expect(b.show).toHaveBeenCalledTimes(1);
    queue.shown(b.element);
    await idle();
    expect(a.show).toHaveBeenCalledTimes(1);
  });

  it('shows the first `eager` parts without waiting for the browser to idle', async () => {
    const queue = createRevealQueue(2);
    const [a, b, c] = parts(3);
    queue.add(a.element, a.show);
    queue.add(b.element, b.show);
    queue.add(c.element, c.show);

    await act(async () => {
      await Promise.resolve();
    });
    expect(a.show).toHaveBeenCalledTimes(1);

    queue.shown(a.element);
    await act(async () => {
      await Promise.resolve();
    });
    expect(b.show).toHaveBeenCalledTimes(1);

    // Past `eager`: the next waits for the browser to idle.
    queue.shown(b.element);
    await act(async () => {
      await Promise.resolve();
    });
    expect(c.show).not.toHaveBeenCalled();
    await idle();
    expect(c.show).toHaveBeenCalledTimes(1);
  });
});

describe('ProgressiveProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const Sections = ({ count }: { count: number }) => (
    <>
      {Array.from({ length: count }, (_, index) => (
        <DataBoundary key={index} fallback={<p>skeleton {index}</p>}>
          <p>section {index}</p>
        </DataBoundary>
      ))}
    </>
  );

  it('shows the top sections at once and the others in turn, skeletons meanwhile', async () => {
    render(
      <ProgressiveProvider eager={1}>
        <Sections count={3} />
      </ProgressiveProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText('section 0')).toBeVisible();
    expect(screen.getByText('skeleton 1')).toBeInTheDocument();
    expect(screen.queryByText('skeleton 0')).not.toBeInTheDocument();

    await idle();
    await idle();
    expect(screen.getByText('section 1')).toBeVisible();
    expect(screen.queryByText('skeleton 1')).not.toBeInTheDocument();

    await idle();
    await idle();
    expect(screen.getByText('section 2')).toBeVisible();
  });

  it('goes on past a section that leaves before its turn', async () => {
    const Page = () => {
      const [withSecond, setWithSecond] = useState(true);
      return (
        <ProgressiveProvider eager={1}>
          <button onClick={() => setWithSecond(false)}>drop</button>
          <DataBoundary fallback={<p>skeleton 0</p>}>
            <p>section 0</p>
          </DataBoundary>
          {withSecond ? (
            <DataBoundary fallback={<p>skeleton 1</p>}>
              <p>section 1</p>
            </DataBoundary>
          ) : null}
          <DataBoundary fallback={<p>skeleton 2</p>}>
            <p>section 2</p>
          </DataBoundary>
        </ProgressiveProvider>
      );
    };
    render(<Page />);
    await act(async () => {
      await Promise.resolve();
    });

    act(() => screen.getByText('drop').click());
    await idle();
    await idle();
    expect(screen.getByText('section 2')).toBeVisible();
  });

  it('renders sections alone without a provider', () => {
    render(<Sections count={2} />);
    expect(screen.getByText('section 0')).toBeVisible();
    expect(screen.getByText('section 1')).toBeVisible();
    expect(screen.queryByText('skeleton 0')).not.toBeInTheDocument();
  });
});
