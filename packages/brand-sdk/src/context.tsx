'use client';

import { createContext, useContext, ComponentType } from 'react';
import type {
  LogoProps,
  BrandConfig,
  ColorScheme,
  GeneralSettings,
} from './types';

/**
 * Brand context interface
 */
interface BrandContextValue {
  /**
   * Logo component from brand configuration
   */
  LogoComponent: ComponentType<LogoProps>;
  /** Global theme settings shared by all layouts, sections, and blocks. */
  generalSettings: GeneralSettings;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);

/**
 * Brand provider props
 */
interface BrandProviderProps {
  children: React.ReactNode;
  brandConfig: BrandConfig;
}

/**
 * Provider for brand configuration
 * Provides logo component through context
 */
export const BrandProvider = ({ children, brandConfig }: BrandProviderProps) => {
  const value: BrandContextValue = {
    LogoComponent: brandConfig.components.logo,
    generalSettings: brandConfig.generalSettings,
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

/** Resolve a section's color-scheme token against the global theme settings. */
export const useColorScheme = (schemeId?: string): ColorScheme => {
  const { generalSettings } = useBrand();
  const { defaultScheme, schemes } = generalSettings.colors;
  const resolvedSchemeId =
    schemeId && schemes[schemeId] ? schemeId : defaultScheme;
  const scheme = schemes[resolvedSchemeId];

  if (!scheme) {
    throw new Error(
      `Color scheme "${resolvedSchemeId}" is not defined in general settings`
    );
  }

  return scheme;
};
