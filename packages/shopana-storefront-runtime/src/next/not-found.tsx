import { Builder } from '@shopana/storefront-sdk/core/Builder';
import type { ApolloEnvironmentConfig } from '@shopana/storefront-sdk/graphql/apollo/types';
import { getRequestContext } from './headers';
import {
  assertSerializablePageData,
  type RuntimePageModuleMap,
} from '../core/page-definition';
import { loadNotFoundDefinition } from '../core/page-registry';
import { createRuntimePageServices } from '../core/page-services';

export interface CreateRuntimeNotFoundOptions {
  environmentConfig: ApolloEnvironmentConfig;
  pages: RuntimePageModuleMap;
}

export function createRuntimeNotFound(options: CreateRuntimeNotFoundOptions) {
  const { environmentConfig, pages } = options;
  const services = createRuntimePageServices(environmentConfig);

  async function NotFound() {
    const request = await getRequestContext();
    const definition = await loadNotFoundDefinition(pages);
    const data = await definition.loadData({
      pageType: '404',
      request,
      services,
    });

    if (process.env.NODE_ENV !== 'production') {
      assertSerializablePageData('404', data);
    }

    const template = await definition.loadTemplate();
    const content = <Builder template={template} data={data} pageType="404" />;
    const Provider = definition.Provider;

    return Provider ? <Provider data={data}>{content}</Provider> : content;
  }

  return { NotFound };
}
