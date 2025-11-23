import type { Metadata } from 'next';
import type { LayoutProps } from 'react';
import type { PageTemplate, PageType } from '../../core/types';
import { Builder } from '../../core/Builder';
import { parseRoute } from '../../utils/routeParser';
import { notFound } from 'next/navigation';

type SlugParam = string[] | undefined;

interface PageProps {
  params: {
    slug?: SlugParam;
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

async function loadPageData(
  pageType: PageType,
  params: Record<string, string | undefined>,
  searchParams?: Record<string, string | string[] | undefined>,
): Promise<unknown> {
  void pageType;
  void params;
  void searchParams;
  return {};
}

function createFallbackTemplate(): PageTemplate<unknown> {
  function FallbackLayout({ children }: LayoutProps) {
    return <>{children}</>;
  }

  return {
    layout: {
      component: FallbackLayout,
    },
    sections: {
      order: [],
    },
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug?: SlugParam };
  searchParams?: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const { pageType } = parseRoute(params.slug ?? []);

  void searchParams;

  return {
    title: pageType === '404' ? 'Page not found' : undefined,
  };
}

export default async function Page({
  params,
  searchParams,
}: PageProps) {
  const { pageType, params: routeParams } = parseRoute(params.slug ?? []);

  if (pageType === '404') {
    notFound();
  }

  const data = await loadPageData(pageType, routeParams, searchParams);

  const template = createFallbackTemplate();

  return (
    <Builder
      template={template}
      data={data}
      pageType={pageType}
    />
  );
}
