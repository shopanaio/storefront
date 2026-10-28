import type { DynamicModulePageProps } from '@shopana/storefront-sdk/registry';
import type { ServerAppData } from '@shopana/storefront-sdk/server/app';
import type { RuntimeMetadata } from '../core/metadata';
import type { RuntimeRenderablePageType } from '../core/page-definition';

/**
 * The root data of the storefront providers, without a cache snapshot: the document carries
 * the cache the server render ended with (see `apollo-ssr-state`).
 */
export type RuntimeAppProps = ServerAppData;

/** What the root loader returns. */
export interface RuntimeRootData {
  app: RuntimeAppProps;
}

/**
 * Metadata of a page the browser loaded itself (a client navigation): computed once the page
 * shows and may query (see `PendingMetadata`), then applied to the document. Absent for the
 * server's pages.
 */
export interface RuntimePendingMetadata {
  pendingMetadata?: (() => Promise<RuntimeMetadata>) | null;
}

/** What the page route loader returns for a page the route renders. */
export type RuntimePageData = RuntimePendingMetadata &
  (
    | {
        kind: 'page';
        pageType: RuntimeRenderablePageType;
        data: unknown;
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
