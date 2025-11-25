import type { Metadata } from 'next';
import type {
  PageTemplate,
  TemplateParams,
} from '../core/types';
import { Builder } from '../core/Builder';
import { parseRoute } from '../utils/routeParser';
import { notFound } from 'next/navigation';

type SlugParam = string[] | undefined;

interface PageProps {
  params: Promise<{
    slug?: SlugParam;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

// Dynamic template imports using switch
// Templates are resolved from user project via @/templates/* path
async function loadTemplate(pageType: string): Promise<PageTemplate | null> {
  try {
    switch (pageType) {
      case 'home':
        return (await import('@/templates/index')).default;
      case 'product':
        return (await import('@/templates/product')).default;
      case 'collection':
        return (await import('@/templates/collection')).default;
      case 'search':
        return (await import('@/templates/search')).default;
      case 'blog':
        return (await import('@/templates/blog')).default;
      case 'article':
        return (await import('@/templates/article')).default;
      case 'page':
        return (await import('@/templates/page')).default;
      case 'cart':
        return (await import('@/templates/cart')).default;
      case 'list-collections':
        return (await import('@/templates/list-collections')).default;
      case '404':
        return (await import('@/templates/404')).default;
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load template for pageType: ${pageType}`, error);
    return null;
  }
}

// Internal framework data loader (will be replaced with SDK later)
// This is where framework's server SDK will fetch data from backend
async function loadPageData(_ctx: TemplateParams): Promise<any> {
  // TODO: Replace with actual SDK implementation
  // For now, return empty data object
  return {};
}

// Internal framework metadata builder (will be replaced with SDK later)
// This is where framework generates SEO metadata
async function buildPageMetadata(ctx: TemplateParams): Promise<Metadata> {
  // TODO: Replace with actual SDK implementation
  const { pageType } = ctx;

  if (pageType === '404') {
    return { title: 'Page not found' };
  }

  return {
    title: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`,
  };
}

// Generate metadata for the page
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: SlugParam }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { pageType, params: routeParams } = parseRoute(
    resolvedParams.slug ?? []
  );

  return buildPageMetadata({
    pageType,
    params: routeParams,
    searchParams: resolvedSearchParams,
  });
}

// Main page component
export default async function Page({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { pageType, params: routeParams } = parseRoute(
    resolvedParams.slug ?? []
  );

  // Handle 404
  if (pageType === '404') {
    notFound();
  }

  // Load template dynamically from user project
  const template = await loadTemplate(pageType);

  if (!template) {
    console.error(`No template found for pageType: ${pageType}`);
    notFound();
  }

  // Load data using framework's internal data loader
  const data = await loadPageData({
    pageType,
    params: routeParams,
    searchParams: resolvedSearchParams,
  });

  // Render using Builder
  return (
    <Builder
      template={template}
      data={data}
      pageType={pageType}
      fallback={<div>Loading...</div>}
    />
  );
}
