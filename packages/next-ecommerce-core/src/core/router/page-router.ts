import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { match as createMatcher } from 'path-to-regexp';
import { getTemplateRegistration } from '../registry/template-registry';
import type { PageTemplate, PageType } from '../types';
import { ROUTE_CONFIG } from './route-config';

export interface RouteMatch {
  pageType: PageType;
  params: Record<string, string | undefined>;
}

export function parseRoute(slug: string[] = []): RouteMatch {
  const path = slug.length ? `/${slug.join('/')}` : '/';

  for (const route of ROUTE_CONFIG) {
    const matcher = createMatcher(route.pattern);
    const matched = matcher(path);

    if (matched) {
      const params = route.paramsMapper
        ? route.paramsMapper(matched.params as Record<string, string>)
        : (matched.params as Record<string, string | undefined>);

      return {
        pageType: route.pageType,
        params,
      };
    }
  }

  // This should never happen due to fallback route, but just in case
  return { pageType: 'page', params: { handle: slug[0] } };
}

export interface ResolvePageOptions {
  slug?: string[];
  searchParams?: Record<string, string | string[] | undefined>;
}

export interface ResolvedPage<TData = unknown> {
  pageType: PageType;
  params: Record<string, string | undefined>;
  data: TData;
  template: PageTemplate<TData>;
  metadata?: Metadata;
}

export async function resolvePageRequest<TData = unknown>({
  slug,
  searchParams,
}: ResolvePageOptions = {}): Promise<ResolvedPage<TData>> {
  const { pageType, params } = parseRoute(slug ?? []);
  const registration = getTemplateRegistration(pageType);

  if (!registration) {
    notFound();
  }

  const data = await registration!.loadData({ pageType, params, searchParams });
  const metadata = registration!.buildMetadata
    ? await registration!.buildMetadata({
        pageType,
        params,
        searchParams,
        resolved: data,
      })
    : undefined;

  return {
    pageType,
    params,
    data,
    template: registration!.template,
    metadata,
  };
}
