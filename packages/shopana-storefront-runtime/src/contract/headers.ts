import type {
  ReadonlyHeaders,
  ReadonlyRequestCookies,
} from '../core/facade-types';
import type { SDKRequestContext } from '../core/request-context';

export type {
  ReadonlyHeaders,
  ReadonlyRequestCookies,
  RequestCookie,
} from '../core/facade-types';
export type { SDKRequestContext } from '../core/request-context';

/** Server only: the address of the current request, as the runtime middleware saw it. */
export declare function getRequestContext(): Promise<SDKRequestContext>;

/** Server only: the headers of the current request. */
export declare function headers(): Promise<ReadonlyHeaders>;

/** Server only: the cookies of the current request. */
export declare function cookies(): Promise<ReadonlyRequestCookies>;
