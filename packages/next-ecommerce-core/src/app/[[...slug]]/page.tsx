import type { Metadata } from 'next';
import { PageBuilder, resolvePageRequest } from '../../core';

interface PageProps {
  params?: {
    slug?: string[];
  };
  searchParams?: Record<string, string | string[] | undefined>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const resolved = await resolvePageRequest({
    slug: props.params?.slug,
    searchParams: props.searchParams,
  });

  return resolved.metadata ?? {};
}

export default async function Page(props: PageProps) {
  const resolved = await resolvePageRequest({
    slug: props.params?.slug,
    searchParams: props.searchParams,
  });

  return (
    <PageBuilder
      template={resolved.template}
      data={resolved.data}
      pageType={resolved.pageType}
    />
  );
}
