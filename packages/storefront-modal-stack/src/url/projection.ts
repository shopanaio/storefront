import { z } from 'zod';
import qs from 'qs';
import { modalStackRegistry } from '../registry/modal-registry';
import type {
  IModalStackItem,
  IModalStackPayload,
  IModalUrlCodec,
  ModalUrlValue,
} from '../types';

export const MODAL_URL_PARAM = 'modals';
const MAX_URL_LENGTH = 16_000;
const paramsSchema = z.record(z.string(), z.json());
const entriesSchema = z
  .array(z.object({ type: z.string().min(1).max(150), params: paramsSchema }))
  .max(32);

export type ModalUrlEntry = z.infer<typeof entriesSchema>[number];

/** Keep domain parameter types inside the codec, even in the heterogeneous registry. */
export function createModalUrlCodec<
  P extends Record<string, ModalUrlValue>,
>(codec: {
  schema: { parse: (value: unknown) => P };
  project: (payload: IModalStackPayload) => P;
  restore: (params: P) => IModalStackPayload;
}): IModalUrlCodec {
  return {
    schema: codec.schema,
    project: codec.project,
    restore: (params) => codec.restore(codec.schema.parse(params)),
  };
}

function stableValue(value: ModalUrlValue): ModalUrlValue {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, stableValue(value[key])])
    );
  }
  return value;
}

export function encodeModalEntries(entries: ModalUrlEntry[]): string | null {
  if (!entries.length) {
    return null;
  }
  const flatEntries = entriesSchema.parse(entries).map(({ type, params }) => {
    if (Object.hasOwn(params, 'type')) {
      throw new Error("Modal URL parameter 'type' is reserved");
    }
    return { type, ...(stableValue(params) as Record<string, ModalUrlValue>) };
  });
  // Object arrays need indices: repeated keys would merge distinct modal instances.
  const encoded = qs.stringify(
    { [MODAL_URL_PARAM]: flatEntries },
    { arrayFormat: 'indices', encodeValuesOnly: true }
  );
  if (encoded.length > MAX_URL_LENGTH) {
    throw new Error('Modal URL projection is too large');
  }
  return encoded;
}

export function projectModalStack(items: IModalStackItem[]): ModalUrlEntry[] {
  const entries = items
    .filter((item) => item.url)
    .map((item) => {
      const codec = modalStackRegistry.get(item.type)?.url;
      if (!codec) {
        throw new Error(`Modal "${item.type}" has no URL codec`);
      }
      return {
        type: item.type,
        params: paramsSchema.parse(
          codec.schema.parse(codec.project(item.payload))
        ),
      };
    });
  encodeModalEntries(entries);
  return entries;
}

/** Invalid links restore nothing. Never execute unknown types or partially restore a chain. */
export function restoreModalEntries(raw: string | null): IModalStackItem[] {
  if (!raw) {
    return [];
  }
  if (raw.length > MAX_URL_LENGTH) {
    throw new Error('Modal URL projection is too large');
  }
  const parsed = qs.parse(raw, {
    ignoreQueryPrefix: true,
    arrayLimit: 32,
    parameterLimit: MAX_URL_LENGTH,
    strictDepth: true,
  });
  const flatEntries = z
    .array(paramsSchema)
    .max(32)
    .parse(parsed[MODAL_URL_PARAM]);
  const entries = flatEntries.map(({ type, ...params }) => ({ type, params }));
  return entriesSchema.parse(entries).map(({ type, params }) => {
    const definition = modalStackRegistry.get(type);
    if (!definition?.url) {
      throw new Error(`Modal "${type}" has no URL codec`);
    }
    return {
      uuid: crypto.randomUUID(),
      type,
      url: true,
      payload: definition.url.restore(definition.url.schema.parse(params)),
      owner: definition.owner,
      isDirty: false,
      isSaving: false,
    };
  });
}

/** Preserve mounted instances and their callbacks until the first differing URL entry. */
export function reconcileModalStack(
  current: IModalStackItem[],
  restored: IModalStackItem[]
): IModalStackItem[] {
  const oldEntries = projectModalStack(current);
  const newEntries = projectModalStack(restored);
  let common = 0;
  while (
    common < oldEntries.length &&
    common < newEntries.length &&
    encodeModalEntries([oldEntries[common]]) ===
      encodeModalEntries([newEntries[common]])
  ) {
    common++;
  }
  if (common === oldEntries.length && common === newEntries.length) {
    return current;
  }
  let retainedEnd = 0;
  let seen = 0;
  for (let i = 0; i < current.length && seen < common; i++) {
    if (current[i].url) {
      seen++;
    }
    retainedEnd = i + 1;
  }
  return [...current.slice(0, retainedEnd), ...restored.slice(common)];
}

function isModalQueryPart(part: string): boolean {
  const key = new URLSearchParams(part).keys().next().value;
  return (
    key === MODAL_URL_PARAM || key?.startsWith(`${MODAL_URL_PARAM}[`) === true
  );
}

/** Read just the managed qs fragment, without changing unrelated query parameters. */
export function readModalProjection(url: URL): string | null {
  return (
    url.search.slice(1).split('&').filter(isModalQueryPart).join('&') || null
  );
}

export function withModalProjection(url: URL, raw: string | null): URL {
  const next = new URL(url);
  const others = url.search
    .slice(1)
    .split('&')
    .filter((part) => part && !isModalQueryPart(part));
  next.search = [...others, ...(raw ? [raw] : [])].join('&');
  return next;
}
