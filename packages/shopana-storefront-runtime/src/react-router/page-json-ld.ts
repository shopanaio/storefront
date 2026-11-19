import { getServerRequestScope } from '@shopana/storefront-sdk/server/requestScope';
import {
  jsonLdList,
  serializeJsonLd,
  type RuntimeJsonLd,
  type RuntimeMetadata,
} from '../core/metadata';

/**
 * The schema.org documents of the page the server renders. They matter to crawlers only, so
 * the page loader keeps them in the request scope instead of its data: the document gets them
 * once, as `<script type="application/ld+json">` in its head, and the data the browser
 * hydrates from goes without them.
 */

const PAGE_JSON_LD = Symbol('shopana.page-json-ld');

/** The page's metadata without its schema.org documents, which stay for the server entry. */
export function takePageJsonLd<TMetadata extends RuntimeMetadata>(
  metadata: TMetadata
): Omit<TMetadata, 'jsonLd'> {
  const { jsonLd, ...rest } = metadata;
  const documents = jsonLdList(jsonLd);
  const scope = getServerRequestScope();
  if (scope && documents.length) scope.values.set(PAGE_JSON_LD, documents);
  return rest;
}

/** The scripts of the schema.org documents of the page the current request renders. */
export function pageJsonLdScripts(): string {
  const documents = getServerRequestScope()?.values.get(PAGE_JSON_LD) as
    | RuntimeJsonLd[]
    | undefined;
  return (documents ?? [])
    .map(
      (document) =>
        `<script type="application/ld+json">${serializeJsonLd(document)}</script>`
    )
    .join('');
}
