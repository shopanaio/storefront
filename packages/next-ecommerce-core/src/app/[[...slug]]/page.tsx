import type { Metadata } from 'next';
import type { PageTemplate, PageType, PageDataLoader } from '@shopana/next-ecommerce-core/core';
import { Builder } from '@shopana/next-ecommerce-core/core';
import { parseRoute } from '@shopana/next-ecommerce-core';
import { notFound } from 'next/navigation';

type SlugParam = string[] | undefined;

interface PageProps {
  params: Promise<{
    slug?: SlugParam;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

interface TemplateModule {
  default: PageTemplate;
  loadData: PageDataLoader;
  buildMetadata?: (ctx: any) => Promise<Metadata> | Metadata;
}

// Dynamic template imports using switch
// Templates are resolved from user project via @/templates/* path
async function loadTemplate(pageType: string): Promise<TemplateModule | null> {
  try {
    switch (pageType) {
      case 'home':
        return await import('@/templates/index');
      case 'product':
        return await import('@/templates/product');
      case 'collection':
        return await import('@/templates/collection');
      case 'search':
        return await import('@/templates/search');
      case 'blog':
        return await import('@/templates/blog');
      case 'article':
        return await import('@/templates/article');
      case 'page':
        return await import('@/templates/page');
      case 'cart':
        return await import('@/templates/cart');
      case 'list-collections':
        return await import('@/templates/list-collections');
      case '404':
        return await import('@/templates/404');
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to load template for pageType: ${pageType}`, error);
    return null;
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: SlugParam }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { pageType } = parseRoute(resolvedParams.slug ?? []);

  if (pageType === '404') {
    return {
      title: 'Page not found',
    };
  }

  const templateModule = await loadTemplate(pageType);

  if (templateModule?.buildMetadata) {
    return templateModule.buildMetadata({ pageType, params: {} });
  }

  return {
    title: `${pageType.charAt(0).toUpperCase() + pageType.slice(1)}`,
  };
}

// Main page component
export default async function Page({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { pageType, params: routeParams } = parseRoute(resolvedParams.slug ?? []);

  // Handle 404
  if (pageType === '404') {
    notFound();
  }

  // Load template dynamically from user project
  const templateModule = await loadTemplate(pageType);

  if (!templateModule) {
    console.error(`No template found for pageType: ${pageType}`);
    notFound();
  }

  // Load data using the template's data loader
  const data = await templateModule.loadData({
    pageType,
    params: routeParams,
    searchParams: resolvedSearchParams,
  });

  // Render using Builder
  return (
    <Builder
      template={templateModule.default}
      data={data}
      pageType={pageType}
      fallback={<div>Loading...</div>}
    />
  );
}
