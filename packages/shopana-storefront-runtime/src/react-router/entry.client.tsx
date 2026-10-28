/**
 * React Router's client entry, as its default one, except that hydration starts once the
 * code the server's page rendered with is loaded (see `hydration`): the page's modules and
 * layout, and whatever the theme waits for (`waitBeforeHydration`).
 */
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import {
  hydrationReady,
  readHydratedPage,
  waitBeforeHydration,
} from './hydration';
import { preloadHydratedPage, type RuntimePageRouteDefinition } from './page';

export function hydrateStorefront(route: RuntimePageRouteDefinition): void {
  const page = readHydratedPage();
  if (page) waitBeforeHydration(preloadHydratedPage(route, page));

  void hydrationReady().then(() => {
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <HydratedRouter />
        </StrictMode>
      );
    });
  });
}
