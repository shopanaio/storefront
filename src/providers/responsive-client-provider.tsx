"use client";

import { createContext, ReactNode } from "react";

type UAClientContext = {
  isMobile: boolean;
  isDesktop: boolean;
};

export const UAClientContext = createContext<UAClientContext>(
  {} as UAClientContext
);

export const ResponsiveClientProvider = ({
  isMobile,
  isDesktop,
  children,
}: {
  isMobile: boolean;
  isDesktop: boolean;
  children: ReactNode;
}) => {
  return (
    <UAClientContext.Provider value={{ isMobile, isDesktop }}>
      {children}
    </UAClientContext.Provider>
  );
};
