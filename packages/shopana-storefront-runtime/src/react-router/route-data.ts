import type { NormalizedCacheObject } from '@apollo/client';
import type { DynamicModulePageProps } from '@shopana/storefront-sdk/registry';
import type { ServerAppProps } from '@shopana/storefront-sdk/server/app';
import type { RuntimeMetadata } from '../core/metadata';
import type { RuntimeRenderablePageType } from '../core/page-definition';

/** What the root loader returns: the root data of the storefront providers. */
export interface RuntimeRootData {
  app: ServerAppProps;
}

/**
 * Metadata of a page the browser loaded itself (a client navigation): computed while the page
 * already renders, and applied to the document once known. Absent for the server's pages.
 */
export interface RuntimePendingMetadata {
  pendingMetadata?: Promise<RuntimeMetadata> | null;
}

/** What the page route loader returns for a page the route renders. */
export type RuntimePageData = RuntimePendingMetadata &
  (
    | {
        kind: 'page';
        pageType: RuntimeRenderablePageType;
        data: unknown;
        /** The request cache after `preload`, applied before the sections render. */
        cacheState: NormalizedCacheObject | null;
        metadata: RuntimeMetadata;
      }
    | {
        kind: 'module';
        slug: string;
        /** Pathname without the locale segment, matched against the module registry. */
        pathname: string;
        props: Omit<DynamicModulePageProps, 'services'>;
        /** Where the browser guard of a page closed to visitors without a session sends them. */
        closedPageRedirect: string | null;
        metadata: RuntimeMetadata;
      }
    | { kind: 'not-found'; data: unknown; metadata: RuntimeMetadata }
  );
