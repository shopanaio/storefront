import type { NormalizedCacheObject, OperationVariables } from '@apollo/client';
import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { Metadata } from 'next';
import type { ComponentType, ReactNode } from 'react';
import type {
  PageTemplate,
  PageType,
} from '@shopana/storefront-sdk/core/types';
import type { SerializableApolloQuery } from '@shopana/storefront-sdk/graphql/apollo/loadSerializableQuery';
import type { SDKRequestContext } from './headers';
import { runtimeDefinitionBrand } from './page-definition-brand';

export type RuntimeRenderablePageType = Exclude<PageType, '404'>;

export interface RuntimePageServices {
  loadQuery<TData, TVariables extends OperationVariables>(
    document: TypedDocumentNode<TData, TVariables>,
    variables: TVariables
  ): Promise<SerializableApolloQuery<TData, TVariables>>;

  extractCacheState(): Promise<NormalizedCacheObject>;
}

export interface RuntimePageContext<
  TPageType extends RuntimeRenderablePageType,
> {
  pageType: TPageType;
  request: SDKRequestContext;
  routeParams: Readonly<Record<string, string | undefined>>;
  searchParams: Readonly<Record<string, string | string[] | undefined>>;
  services: RuntimePageServices;
}

export type RuntimePageDataResult<TData> =
  | { status: 'ready'; data: TData }
  | { status: 'not-found' };

export interface RuntimePageProviderProps<TData> {
  data: TData;
  children: ReactNode;
}

export interface RuntimePageDefinition<
  TPageType extends RuntimeRenderablePageType,
  TData,
> {
  readonly pageType: TPageType;

  loadData(
    context: RuntimePageContext<TPageType>
  ): Promise<RuntimePageDataResult<TData>>;

  loadTemplate(): Promise<PageTemplate<TData>>;

  generateMetadata?(
    context: RuntimePageContext<TPageType>,
    data: TData
  ): Promise<Metadata> | Metadata;

  Provider?: ComponentType<RuntimePageProviderProps<TData>>;
}

export interface RuntimeNotFoundContext {
  pageType: '404';
  request: SDKRequestContext;
  services: RuntimePageServices;
}

export interface RuntimeNotFoundDefinition<TData> {
  readonly pageType: '404';
  loadData(context: RuntimeNotFoundContext): Promise<TData>;
  loadTemplate(): Promise<PageTemplate<TData>>;
  Provider?: ComponentType<RuntimePageProviderProps<TData>>;
}

export interface RuntimeDefinitionIdentity<TPageType extends PageType> {
  readonly pageType: TPageType;
  readonly [runtimeDefinitionBrand]: true;
}

export type RuntimePageModule<TKey extends PageType> = {
  default: RuntimeDefinitionIdentity<TKey>;
};

export type RuntimePageModuleMap = {
  [TKey in PageType]: () => Promise<RuntimePageModule<TKey>>;
};

export function defineRuntimePage<
  const TPageType extends RuntimeRenderablePageType,
  TData,
>(
  definition: RuntimePageDefinition<TPageType, TData>
): RuntimePageDefinition<TPageType, TData> &
  RuntimeDefinitionIdentity<TPageType> {
  return Object.defineProperty(definition, runtimeDefinitionBrand, {
    value: true,
  }) as RuntimePageDefinition<TPageType, TData> &
    RuntimeDefinitionIdentity<TPageType>;
}

export function defineRuntimeNotFound<TData>(
  definition: RuntimeNotFoundDefinition<TData>
): RuntimeNotFoundDefinition<TData> & RuntimeDefinitionIdentity<'404'> {
  return Object.defineProperty(definition, runtimeDefinitionBrand, {
    value: true,
  }) as RuntimeNotFoundDefinition<TData> & RuntimeDefinitionIdentity<'404'>;
}

export function defineRuntimePages<const TModules extends RuntimePageModuleMap>(
  modules: TModules & Record<Exclude<keyof TModules, PageType>, never>
): TModules {
  return modules;
}

export type RuntimeInvariantCode =
  | 'MISSING_PAGE_DEFINITION'
  | 'INVALID_PAGE_MODULE'
  | 'PAGE_TYPE_MISMATCH'
  | 'NON_SERIALIZABLE_PAGE_DATA';

interface RuntimeInvariantErrorOptions {
  pageType?: PageType;
  registryKey?: string;
  valuePath?: string;
  detail?: string;
}

export class RuntimeInvariantError extends Error {
  readonly code: RuntimeInvariantCode;
  readonly pageType?: PageType;
  readonly registryKey?: string;
  readonly valuePath?: string;

  constructor(
    code: RuntimeInvariantCode,
    {
      pageType,
      registryKey,
      valuePath,
      detail,
    }: RuntimeInvariantErrorOptions = {}
  ) {
    const resolvedKey = registryKey ?? pageType ?? '<unknown>';
    const pathDetail = valuePath ? ` at ${valuePath}` : '';
    const suffix = detail ? `: ${detail}` : '';
    super(
      `[${code}] Runtime page definition "${resolvedKey}"${pathDetail}${suffix}`
    );
    this.name = 'RuntimeInvariantError';
    this.code = code;
    this.pageType = pageType;
    this.registryKey = registryKey;
    this.valuePath = valuePath;
  }
}

function childValuePath(path: string, key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${path}.${key}`
    : `${path}[${JSON.stringify(key)}]`;
}

function findNonSerializableValue(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>
): string | null {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return null;
  }

  if (
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  ) {
    return path;
  }

  if (typeof value !== 'object') {
    return path;
  }

  if (ancestors.has(value)) {
    return path;
  }

  if (
    !Array.isArray(value) &&
    (value as { kind?: unknown }).kind === 'Document' &&
    Array.isArray((value as { definitions?: unknown }).definitions)
  ) {
    return path;
  }

  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype) {
    return path;
  }

  ancestors.add(value);

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const invalidPath = findNonSerializableValue(
        value[index],
        `${path}[${index}]`,
        ancestors
      );
      if (invalidPath) {
        ancestors.delete(value);
        return invalidPath;
      }
    }
  } else {
    if (Object.getOwnPropertySymbols(value).length > 0) {
      ancestors.delete(value);
      return path;
    }

    for (const [key, child] of Object.entries(value)) {
      const invalidPath = findNonSerializableValue(
        child,
        childValuePath(path, key),
        ancestors
      );
      if (invalidPath) {
        ancestors.delete(value);
        return invalidPath;
      }
    }
  }

  ancestors.delete(value);
  return null;
}

export function assertSerializablePageData(
  pageType: PageType,
  data: unknown
): void {
  const valuePath = findNonSerializableValue(data, '$', new WeakSet());
  if (!valuePath) {
    return;
  }

  throw new RuntimeInvariantError('NON_SERIALIZABLE_PAGE_DATA', {
    pageType,
    registryKey: pageType,
    valuePath,
    detail: 'page data must contain only plain RSC-serializable values',
  });
}
