/**
 * A render worker of the static site builder: its own instance of the server build (module
 * state, emotion's and antd-style's caches, the SDK's settings), renders the pages its pool
 * hands it, one at a time, until the pool replaces it.
 */
import { parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import type { ServerBuild } from 'react-router';
import type { StaticFieldAspects } from '@shopana/storefront-sdk/static';
import { createStaticRenderer, type StaticRenderRequest } from './renderer';

export interface RenderWorkerData {
  serverBuildPath: string;
  origin: string;
  /** The theme's aspects of fields, plain data of its static config. */
  fieldAspects?: StaticFieldAspects;
}

export type RenderWorkerMessage =
  | {
      id: number;
      ok: true;
      result: Awaited<
        ReturnType<ReturnType<typeof createStaticRenderer>['render']>
      >;
    }
  | { id: number; ok: false; error: string };

const { serverBuildPath, origin, fieldAspects } =
  workerData as RenderWorkerData;
const build = (await import(
  pathToFileURL(serverBuildPath).href
)) as ServerBuild;
const renderer = createStaticRenderer(build, { origin, fieldAspects });

parentPort!.on(
  'message',
  async ({ id, request }: { id: number; request: StaticRenderRequest }) => {
    let message: RenderWorkerMessage;
    try {
      message = { id, ok: true, result: await renderer.render(request) };
    } catch (error) {
      message = {
        id,
        ok: false,
        error:
          error instanceof Error
            ? (error.stack ?? error.message)
            : String(error),
      };
    }
    parentPort!.postMessage(message);
  }
);
