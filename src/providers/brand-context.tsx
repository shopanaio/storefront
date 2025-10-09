'use client';

import { createContext, useContext, ComponentType } from 'react';
import { brandConfig, LogoProps } from '@src/brand.config';

/**
 * Brand context interface
 */
interface BrandContextValue {
  /**
   * Logo component from brand configuration
   */
  LogoComponent: ComponentType<LogoProps>;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

/**
 * Brand provider props
 */
interface BrandProviderProps {
  children: React.ReactNode;
}

/**
 * Provider for brand configuration
 * Provides logo component through context
 */
export const BrandProvider = ({ children }: BrandProviderProps) => {
  const value: BrandContextValue = {
    LogoComponent: brandConfig.components.logo,
  };

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
};

/**
 * Hook to access brand context
 * @returns Brand context value with logo component
 * @throws Error if used outside BrandProvider
 */
export const useBrand = () => {
  const context = useContext(BrandContext);

  if (!context) {
    throw new Error('useBrand must be used within BrandProvider');
  }

  return context;
};
