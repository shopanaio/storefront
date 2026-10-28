import type { Dynamic } from '../core/facade-types';

export type {
  Dynamic,
  DynamicLoader,
  DynamicOptions,
} from '../core/facade-types';

/** A component loaded on first render, in its own chunk. */
declare const dynamic: Dynamic;
export default dynamic;
