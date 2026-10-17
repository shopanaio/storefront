import { describe, it, expect, vi } from 'vitest';
import { createCartMutationQueue } from './mutationQueue';

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
});
