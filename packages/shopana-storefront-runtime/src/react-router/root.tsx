'use client';

import type { ComponentType, ReactNode } from 'react';
import {
  Outlet,
  type LinksFunction,
  type MetaFunction,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';
import type { RuntimeAppDefinition } from './app';
import { getKnownLocaleSegments, RuntimeAppScope } from './document';
import { RouteErrorPage, type RuntimeErrorPage } from './error';

/** The theme's root layout module (`src/runtime/layout.tsx`). */
export interface RuntimeLayoutModule {
  /** The document: `<html>` with `Meta`, `Links`, the app in `AppProvider`, `Scripts`. */
  default: ComponentType<{ children: ReactNode }>;
  /** `<meta>` of every page; a page's own metadata replaces a tag with the same name. */
  meta?: MetaFunction;
  /** `<link>` of every page: fonts, stylesheets, icons. */
  links?: LinksFunction;
}

export interface CreateRuntimeRootOptions {
  app: RuntimeAppDefinition;
  layout: RuntimeLayoutModule;
  ErrorPage: RuntimeErrorPage;
}

function firstSegment(url: URL): string {
  return url.pathname.split('/')[1]?.toLowerCase() ?? '';
}

/**
 * The root route of a storefront under React Router: the theme layout as the document, the
 * page route inside it, and the theme's error page. The root data (store, cart, session) is
 * loaded with the document and again only after a form submission or for another locale.
 */
export function createRuntimeRoot({
  app,
  layout,
  ErrorPage,
}: CreateRuntimeRootOptions) {
  const ThemeLayout = layout.default;

  function Layout({ children }: { children: ReactNode }) {
    return (
      <RuntimeAppScope app={app}>
        <ThemeLayout>{children}</ThemeLayout>
      </RuntimeAppScope>
    );
  }

  function App() {
    return <Outlet />;
  }

  function ErrorBoundary() {
    return <RouteErrorPage ErrorPage={ErrorPage} />;
  }

  function shouldRevalidate({
    currentUrl,
    nextUrl,
    formMethod,
    defaultShouldRevalidate,
  }: ShouldRevalidateFunctionArgs): boolean {
    // A submission, or `router.refresh()` (a revalidation of the same address).
    if (formMethod || currentUrl.href === nextUrl.href) {
      return defaultShouldRevalidate;
    }
    const segments = getKnownLocaleSegments();
    const locale = (url: URL) => {
      const segment = firstSegment(url);
      return segments.includes(segment) ? segment : '';
    };
    return locale(currentUrl) !== locale(nextUrl);
  }

  const meta: MetaFunction = (args) => layout.meta?.(args) ?? [];
  const links: LinksFunction = () => layout.links?.() ?? [];

  return { Layout, App, ErrorBoundary, shouldRevalidate, meta, links };
}
