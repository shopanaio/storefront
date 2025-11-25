import { Builder } from '@shopana/storefront-sdk/core/Builder';
import { HomeDataProvider } from '@shopana/storefront-sdk/modules/home/react/providers/HomeDataProvider';
import { loadHomeServerQuery } from '@shopana/storefront-sdk/modules/home/next/loaders/loadHomeServerQuery';
import { environmentConfig } from '@/config/environment.config';
import homeTemplate from '@/templates/index';

export default async function HomePage() {
  const preloadedQuery = await loadHomeServerQuery({ environmentConfig });

  return (
    <HomeDataProvider preloadedQuery={preloadedQuery}>
      <Builder
        template={homeTemplate}
        data={{ preloadedQuery }}
        pageType="home"
        fallback={<div>Loading...</div>}
      />
    </HomeDataProvider>
  );
}
