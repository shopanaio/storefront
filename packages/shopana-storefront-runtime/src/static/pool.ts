/**
 * The workers the builder renders with: `size` threads, each with its own server build, each
 * replaced after `pagesPerWorker` pages, so what a long render run gathers in module state
 * (emotion rules, caches, singletons) never grows without end.
 */
import { Worker } from 'node:worker_threads';
import type { StaticRenderRequest, StaticRenderResult } from './renderer';
import type { RenderWorkerData, RenderWorkerMessage } from './worker';

export interface RenderPool {
  render(request: StaticRenderRequest): Promise<StaticRenderResult>;
  close(): Promise<void>;
}

interface Slot {
  worker: Worker;
  rendered: number;
  busy: boolean;
  /** The worker ended (a crash between pages too): it takes no page any more. */
  exited: boolean;
}

interface Job {
  request: StaticRenderRequest;
  resolve(result: StaticRenderResult): void;
  reject(error: Error): void;
}

export function createRenderPool({
  size,
  pagesPerWorker,
  workerData,
  workerUrl = new URL('./worker.js', import.meta.url),
}: {
  size: number;
  pagesPerWorker: number;
  workerData: RenderWorkerData;
  workerUrl?: URL;
}): RenderPool {
  const queue: Job[] = [];
  const slots: Slot[] = [];
  let nextId = 0;
  let closed = false;

  const spawn = (): Slot => {
    const slot: Slot = {
      worker: new Worker(workerUrl, { workerData }),
      rendered: 0,
      busy: false,
      exited: false,
    };
    // An error fails the page the worker renders (`run`); between pages it only ends it.
    slot.worker.on('error', () => {});
    slot.worker.once('exit', () => {
      slot.exited = true;
    });
    return slot;
  };

  /** A fresh worker in the place of a slot's, given the next page. */
  const replace = (slot: Slot) => {
    if (!slot.exited) void slot.worker.terminate();
    const index = slots.indexOf(slot);
    const fresh = spawn();
    slots[index] = fresh;
    pump(fresh);
  };

  const run = (slot: Slot, job: Job) => {
    slot.busy = true;
    const id = nextId++;
    let settled = false;
    const settle = (message: RenderWorkerMessage) => {
      if (message.id !== id) return;
      cleanup();
      settled = true;
      if (message.ok) job.resolve(message.result);
      else job.reject(new Error(`${job.request.path}: ${message.error}`));
      finish(slot);
    };
    const fail = (error: Error) => {
      cleanup();
      // An `error` is followed by an `exit`: the job settles once.
      if (settled) return;
      settled = true;
      job.reject(new Error(`${job.request.path}: ${error.message}`));
      // A worker that failed is not used again.
      slot.rendered = pagesPerWorker;
      finish(slot);
    };
    // A worker that ends without an error (out of memory, `process.exit`) fails its job too.
    const exit = (code: number) =>
      fail(new Error(`the render worker exited with code ${code}`));
    const cleanup = () => {
      slot.worker.off('message', settle);
      slot.worker.off('error', fail);
      slot.worker.off('exit', exit);
    };
    slot.worker.on('message', settle);
    slot.worker.on('error', fail);
    slot.worker.on('exit', exit);
    slot.worker.postMessage({ id, request: job.request });
  };

  const finish = (slot: Slot) => {
    slot.busy = false;
    slot.rendered += 1;
    if (slot.rendered >= pagesPerWorker) {
      replace(slot);
      return;
    }
    pump(slot);
  };

  const pump = (slot: Slot) => {
    if (closed || slot.busy || queue.length === 0) return;
    if (slot.exited) {
      replace(slot);
      return;
    }
    run(slot, queue.shift()!);
  };

  for (let index = 0; index < size; index += 1) slots.push(spawn());

  return {
    render(request) {
      return new Promise((resolve, reject) => {
        queue.push({ request, resolve, reject });
        const idle = slots.find((slot) => !slot.busy);
        if (idle) pump(idle);
      });
    },
    async close() {
      closed = true;
      await Promise.all(slots.map((slot) => slot.worker.terminate()));
    },
  };
}
