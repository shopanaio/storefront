/**
 * React Router's client entry, as its default one, except that hydration starts once the
 * document is parsed and the code the server's page rendered with is loaded (see
 * `hydration`): the page's modules and layout, and whatever the theme waits for
 * (`waitBeforeHydration`).
 */
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import {
  documentParsed,
  hydrationReady,
  readHydratedPage,
  waitBeforeHydration,
} from './hydration';
import { preloadHydratedPage, type RuntimePageRouteDefinition } from './page';

export function hydrateStorefront(route: RuntimePageRouteDefinition): void {
  // The document's end carries the Apollo cache and the page: without them the app would
  // render the header's menu and the page's sections empty, unlike the server's HTML.
  void documentParsed().then(async () => {
    const page = readHydratedPage();
    if (page) waitBeforeHydration(preloadHydratedPage(route, page));
    await hydrationReady();
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
