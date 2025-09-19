import { useLocale } from "next-intl";
import { routes as defaultRoutes } from "@src/routes";
import { useMemo } from "react";

type Routes = typeof defaultRoutes;

const prependLocaleToRoutes = (routes: Routes, locale: string): Routes => {
  const newRoutes = {} as Routes;

  for (const key in routes) {
    const routeKey = key as keyof Routes;
    const originalRoute = routes[routeKey];

    // @ts-ignore
    newRoutes[routeKey] = {
      path: (...args: any[]) => {
        const originalPath = (originalRoute.path as (...args: any[]) => string)(
          ...args
        );
        return `/${locale}${originalPath}`;
      },
    };
  }

  return newRoutes;
};

export const useRoutes = () => {
  const locale = useLocale();
  return useMemo(
    () => prependLocaleToRoutes(defaultRoutes, locale),
    [locale]
  );
};
