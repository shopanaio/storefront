import { describe, it, expect, vi } from 'vitest';
import {
  createCartMutationQueue,
  followSuperseded,
  MutationSupersededError,
} from './mutationQueue';

describe('cart mutation queue', () => {
  it('confirms writes in submission order and reconciles after every write', async () => {
    const idle = vi.fn();
    const queue = createCartMutationQueue(idle);
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const writes: number[] = [];
    const first = queue.run(async () => {
      await held;
      writes.push(2);
      return 2;
    });
    const second = queue.run(async () => {
      writes.push(3);
      return 3;
    });
    const third = queue.run(async () => {
      writes.push(4);
      return 4;
    });
    expect(queue.pending).toBe(3);
    expect(writes).toEqual([]);
    release();
    expect(await Promise.all([first, second, third])).toEqual([2, 3, 4]);
    expect(writes).toEqual([2, 3, 4]);
    expect(queue.pending).toBe(0);
    expect(idle).toHaveBeenCalledTimes(3);
  });

  it('continues with the next mutation after a rejected write', async () => {
    const idle = vi.fn();
    const queue = createCartMutationQueue(idle);
    const failed = queue.run(async () => {
      throw new Error('network failure');
    });
    const next = queue.run(async () => 3);
    await expect(failed).rejects.toThrow('network failure');
    await expect(next).resolves.toBe(3);
    expect(queue.pending).toBe(0);
    expect(idle).toHaveBeenCalledTimes(2);
  });

  it('sends only the latest value of a resource that is still waiting', async () => {
    const queue = createCartMutationQueue(vi.fn());
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const sent: string[] = [];
    const first = queue.run(async () => {
      await held;
      sent.push('address');
      return 'address';
    });
    const older = queue.run(
      async () => {
        sent.push('cash');
        return 'cash';
      },
      { key: 'payment' }
    );
    const other = queue.run(
      async () => {
        sent.push('note');
        return 'note';
      },
      { key: 'note' }
    );
    const latest = queue.run(
      async () => {
        sent.push('card');
        return 'card';
      },
      { key: 'payment' }
    );
    // The replaced call learns at once that its value never went.
    await expect(older).rejects.toBeInstanceOf(MutationSupersededError);
    release();
    expect(await Promise.all([first, other, latest])).toEqual([
      'address',
      'note',
      'card',
    ]);
    // The payment keeps its place in the queue and goes with the latest value.
    expect(sent).toEqual(['address', 'card', 'note']);
  });

  it('lets a replaced call follow the write that carried its resource', async () => {
    const queue = createCartMutationQueue(vi.fn());
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    void queue.run(() => held);
    const older = followSuperseded(
      queue.run(async () => 'cash', { key: 'payment' })
    );
    const middle = followSuperseded(
      queue.run(async () => 'card', { key: 'payment' })
    );
    const latest = queue.run(
      async () => {
        throw new Error('declined');
      },
      { key: 'payment' }
    );
    release();
    await expect(latest).rejects.toThrow('declined');
    await expect(older).rejects.toThrow('declined');
    await expect(middle).rejects.toThrow('declined');
  });

  it('replays only the optimistic edit of the replacing write', async () => {
    const reconciled: Array<ReadonlyArray<() => void>> = [];
    const queue = createCartMutationQueue((edits) => reconciled.push(edits));
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const older = vi.fn();
    const newer = vi.fn();
    void queue.run(() => held);
    queue
      .run(async () => undefined, { key: 'line', optimisticEdit: older })
      .catch(() => undefined);
    const latest = queue.run(async () => undefined, {
      key: 'line',
      optimisticEdit: newer,
    });
    release();
    await latest;
    expect(reconciled[0]).toEqual([newer]);
  });

  it('keeps going when reconciling after a write throws', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const queue = createCartMutationQueue(() => {
      throw new Error('broken edit');
    });
    const first = queue.run(async () => 1);
    const second = queue.run(async () => 2);
    await expect(first).resolves.toBe(1);
    await expect(second).resolves.toBe(2);
    await expect(queue.idle()).resolves.toBeUndefined();
    expect(queue.pending).toBe(0);
    error.mockRestore();
  });

  it('does not replace a mutation of the same resource that already started', async () => {
    const queue = createCartMutationQueue(vi.fn());
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const sent: string[] = [];
    const first = queue.run(
      async () => {
        await held;
        sent.push('cash');
      },
      { key: 'payment' }
    );
    const second = queue.run(
      async () => {
        sent.push('card');
      },
      { key: 'payment' }
    );
    release();
    await Promise.all([first, second]);
    expect(sent).toEqual(['cash', 'card']);
  });

  it('waits for every mutation queued before idle', async () => {
    const queue = createCartMutationQueue(vi.fn());
    const sent: string[] = [];
    void queue.run(async () => {
      await Promise.resolve();
      sent.push('note');
    });
    void queue
      .run(async () => {
        throw new Error('network failure');
      })
      .catch(() => undefined);
    await queue.idle();
    expect(sent).toEqual(['note']);
    expect(queue.pending).toBe(0);
  });
});
