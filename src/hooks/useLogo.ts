import { useBrand } from '@src/providers/brand-context';

/**
 * Hook to get the current logo component from brand configuration
 * @returns Logo component configured in brand.config.ts
 * @example
 * ```tsx
 * const Logo = useLogo();
 * return <Logo size={40} theme="light" />;
 * ```
 */
export const useLogo = () => {
  const { LogoComponent } = useBrand();
  return LogoComponent;
};
