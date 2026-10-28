/**
 * The framework facades the storefront code imports (`@shopana/storefront/link`,
 * `/navigation`, `/image`, `/dynamic`, `/headers`): one contract, implemented over Next.js and
 * over React Router. The package resolves each entry to the implementation of the runtime the
 * app is built with, so themes and packages run under either.
 */
import type {
  AnchorHTMLAttributes,
  ComponentType,
  ForwardRefExoticComponent,
  ImgHTMLAttributes,
  ReactNode,
  RefAttributes,
} from 'react';
import type { HrefTarget } from '@shopana/storefront-sdk/routing';

export interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  /**
   * A pathname without the locale segment, a named route (`{ route, params, query }`) or an
   * absolute URL. Storefront paths get the locale segment of the active locale.
   */
  href: HrefTarget;
  /** Replace the current history entry instead of adding one. */
  replace?: boolean;
  /** Load the page ahead of the click; on by default, `false` turns it off. */
  prefetch?: boolean;
  /** Scroll to the top of the new page; `false` keeps the scroll position. */
  scroll?: boolean;
}

export type LinkComponent = ForwardRefExoticComponent<
  LinkProps & RefAttributes<HTMLAnchorElement>
>;

export interface NavigateOptions {
  /** Scroll to the top of the new page; `false` keeps the scroll position. */
  scroll?: boolean;
}

/** Router whose moves keep the active locale in storefront paths. */
export interface StorefrontRouter {
  push(href: HrefTarget, options?: NavigateOptions): void;
  replace(href: HrefTarget, options?: NavigateOptions): void;
  /** Loads the page ahead of a move. */
  prefetch(href: HrefTarget): void;
  back(): void;
  forward(): void;
  /** Loads the data of the current page again. */
  refresh(): void;
}

/**
 * Route params of the storefront route: `locale` is the URL locale segment (the default
 * locale's when the address has none), `slug` the path segments after it.
 */
export type StorefrontRouteParams = Record<
  string,
  string | string[] | undefined
>;

/** The search params of the current page; read them, a change does not navigate. */
export type ReadonlySearchParams = URLSearchParams;

export interface StaticImageData {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
}

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet' | 'width' | 'height' | 'loading' | 'alt'
> {
  src: string | StaticImageData;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  /** Fill the positioned parent instead of taking `width` and `height`. */
  fill?: boolean;
  sizes?: string;
  quality?: number | `${number}`;
  /** An image above the fold: loaded eagerly with a high fetch priority. */
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  placeholder?: 'empty' | 'blur';
  blurDataURL?: string;
  /** Serve the source as is (Next.js image optimization off). */
  unoptimized?: boolean;
}

export type ImageComponent = ForwardRefExoticComponent<
  ImageProps & RefAttributes<HTMLImageElement>
>;

export type DynamicLoader<TProps> = () => Promise<
  ComponentType<TProps> | { default: ComponentType<TProps> }
>;

export interface DynamicOptions {
  /** False renders the component in the browser only: the server and hydration show `loading`. */
  ssr?: boolean;
  /** Shown while the component loads. */
  loading?: () => ReactNode;
}

export type Dynamic = <TProps = object>(
  loader: DynamicLoader<TProps>,
  options?: DynamicOptions
) => ComponentType<TProps>;

export interface RequestCookie {
  name: string;
  value: string;
}

/** The cookies of the server request. */
export interface ReadonlyRequestCookies {
  get(name: string): RequestCookie | undefined;
  getAll(): RequestCookie[];
  has(name: string): boolean;
}

/** The headers of the server request. */
export type ReadonlyHeaders = Pick<
  Headers,
  'get' | 'has' | 'forEach' | 'entries' | 'keys' | 'values'
>;
