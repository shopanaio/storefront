"use client";

import { createContext, useContext, ReactNode } from "react";

type ResponsiveContextType = {
  isMobile: boolean;
  isDesktop: boolean;
};

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(
  undefined
);

export const ResponsiveProvider = ({
  isMobile,
  isDesktop,
  children,
}: {
  isMobile: boolean;
  isDesktop: boolean;
  children: ReactNode;
}) => {
  return (
    <ResponsiveContext.Provider value={{ isMobile, isDesktop }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsiveContext = () => {
  return useContext(ResponsiveContext);
};
