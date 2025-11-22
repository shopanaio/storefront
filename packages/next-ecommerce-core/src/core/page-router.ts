import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTemplateRegistration } from './template-registry';
import type { PageTemplate } from './types';
import type { PageType, TemplateParams } from './types';

export interface RouteMatch {
  pageType: PageType;
  params: Record<string, string | undefined>;
}

export function parseRoute(slug: string[] = []): RouteMatch {
  if (!slug.length) {
    return { pageType: 'home', params: {} };
  }

  const [first, second] = slug;

  if (first === 'products' && second) {
    return { pageType: 'product', params: { handle: second } };
  }

  if (first === 'collections' && second) {
    return { pageType: 'collection', params: { handle: second } };
  }

  if (first === 'cart') {
    return { pageType: 'cart', params: {} };
  }

  if (first === 'pages' && second) {
    return { pageType: 'page', params: { handle: second } };
  }

  // Fallback: treat as static page handle (e.g., /about)
  return { pageType: 'page', params: { handle: first } };
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

export async function resolvePageRequest<TData = unknown>(
  { slug, searchParams }: ResolvePageOptions = {}
): Promise<ResolvedPage<TData>> {
  const { pageType, params } = parseRoute(slug ?? []);
  const registration = getTemplateRegistration(pageType);

  if (!registration) {
    notFound();
  }

  const data = await registration!.loadData({ pageType, params, searchParams });
  const metadata = registration!.buildMetadata
    ? await registration!.buildMetadata({ pageType, params, searchParams, resolved: data })
    : undefined;

  return {
    pageType,
    params,
    data,
    template: registration!.template,
    metadata,
  };
}
