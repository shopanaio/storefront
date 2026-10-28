/**
 * Type test: both implementations of every facade satisfy its contract, which is what the
 * package exports as the entry's types; and the runtime metadata is Next.js metadata.
 */
import type { Metadata } from 'next';
import NextImage from 'next/image';
import nextDynamic from 'next/dynamic';
import type { RuntimeMetadata } from '../core/metadata';
import NextLink from '../next/link';
import * as nextNavigation from '../next/navigation';
import * as nextHeaders from '../next/headers';
import * as nextPageClient from '../next/page-client';
import RouterLink from '../react-router/link';
import RouterImage from '../react-router/image';
import routerDynamic from '../react-router/dynamic';
import * as routerNavigation from '../react-router/navigation';
import * as routerHeaders from '../react-router/headers';
import * as routerPageClient from '../react-router/page-client';
import type * as dynamicContract from './dynamic';
import type * as headersContract from './headers';
import type * as imageContract from './image';
import type * as linkContract from './link';
import type * as navigationContract from './navigation';
import type * as pageClientContract from './page-client';

type Values<TModule> = {
  [TKey in keyof TModule as TModule[TKey] extends (...args: never[]) => unknown
    ? TKey
    : TModule[TKey] extends object
      ? TKey
      : never]: TModule[TKey];
};

export const links: Array<typeof linkContract.default> = [NextLink, RouterLink];
export const images: Array<typeof imageContract.default> = [
  NextImage,
  RouterImage,
];
export const dynamics: Array<typeof dynamicContract.default> = [
  nextDynamic,
  routerDynamic,
];
export const navigations: Array<Values<typeof navigationContract>> = [
  nextNavigation,
  routerNavigation,
];
export const headers: Array<Values<typeof headersContract>> = [
  nextHeaders,
  routerHeaders,
];
export const pageClients: Array<Values<typeof pageClientContract>> = [
  nextPageClient,
  routerPageClient,
];

export const metadata: Metadata = {} as RuntimeMetadata;
