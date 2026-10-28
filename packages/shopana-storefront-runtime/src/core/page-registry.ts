import type { ComponentType } from 'react';
import type {
  PageTemplate,
  PageType,
} from '@shopana/storefront-sdk/core/types';
import type { RuntimeMetadata } from './metadata';
import {
  RuntimeInvariantError,
  type RuntimeNotFoundContext,
  type RuntimePageContext,
  type RuntimePageDataResult,
  type RuntimePageModuleMap,
  type RuntimePageProviderProps,
  type RuntimeRenderablePageType,
} from './page-definition';
import { runtimeDefinitionBrand } from './page-definition-brand';

interface ErasedRenderableDefinition {
  readonly pageType: RuntimeRenderablePageType;
  loadData(
    context: RuntimePageContext<RuntimeRenderablePageType>
  ): RuntimePageDataResult<any> | Promise<RuntimePageDataResult<any>>;
  preload?(
    context: RuntimePageContext<RuntimeRenderablePageType>,
    data: any
  ): Promise<RuntimePageDataResult<any>>;
  loadTemplate(): Promise<PageTemplate<any>>;
  generateMetadata?(
    context: RuntimePageContext<RuntimeRenderablePageType>,
    data: any
  ): Promise<RuntimeMetadata> | RuntimeMetadata;
  Provider?: ComponentType<RuntimePageProviderProps<any>>;
}

interface ErasedNotFoundDefinition {
  readonly pageType: '404';
  loadData(context: RuntimeNotFoundContext): Promise<any>;
  loadTemplate(): Promise<PageTemplate<any>>;
  Provider?: ComponentType<RuntimePageProviderProps<any>>;
}

type ErasedDefinition = ErasedRenderableDefinition | ErasedNotFoundDefinition;

function isDefinition(value: unknown): value is ErasedDefinition {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<PropertyKey, unknown>;
  return (
    candidate[runtimeDefinitionBrand] === true &&
    typeof candidate.pageType === 'string' &&
    typeof candidate.loadData === 'function' &&
    typeof candidate.loadTemplate === 'function' &&
    (candidate.preload === undefined ||
      typeof candidate.preload === 'function') &&
    (candidate.generateMetadata === undefined ||
      typeof candidate.generateMetadata === 'function') &&
    (candidate.Provider === undefined ||
      typeof candidate.Provider === 'function')
  );
}

async function loadDefinition(
  pages: RuntimePageModuleMap,
  registryKey: PageType
): Promise<ErasedDefinition> {
  const loader = pages[registryKey];
  if (typeof loader !== 'function') {
    throw new RuntimeInvariantError('MISSING_PAGE_DEFINITION', {
      pageType: registryKey,
      registryKey,
    });
  }

  const moduleValue = await loader();
  const definition = moduleValue?.default;
  if (!isDefinition(definition)) {
    throw new RuntimeInvariantError('INVALID_PAGE_MODULE', {
      pageType: registryKey,
      registryKey,
      detail: 'the lazy module must have a valid default definition',
    });
  }

  if (definition.pageType !== registryKey) {
    throw new RuntimeInvariantError('PAGE_TYPE_MISMATCH', {
      pageType: definition.pageType,
      registryKey,
      detail: `loaded definition declares "${definition.pageType}"`,
    });
  }

  return definition;
}

export async function loadRenderableDefinition(
  pages: RuntimePageModuleMap,
  pageType: RuntimeRenderablePageType
): Promise<ErasedRenderableDefinition> {
  return (await loadDefinition(pages, pageType)) as ErasedRenderableDefinition;
}

export async function loadNotFoundDefinition(
  pages: RuntimePageModuleMap
): Promise<ErasedNotFoundDefinition> {
  return (await loadDefinition(pages, '404')) as ErasedNotFoundDefinition;
}
