/**
 * Selects implementation by active brand.
 *
 * This is a runtime fallback and a marker for the build-time brand resolver
 * loader. In production builds, the `resolve-brand` loader rewrites modules
 * that import brand-suffixed files and call `brandPick(...)` to include only
 * the implementation for the active brand.
 *
 * @typeParam T - The type of implementation to select
 * @param mapping - Record of brand name to implementation
 * @returns Implementation that matches `process.env.NEXT_PUBLIC_BRAND`
 * @throws If the active brand has no mapping
 */
export const brandPick = <T>(mapping: Record<string, T>): T => {
  if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
    console.warn("warning: brand picker is not compiled");
  }

  const brand = process.env.NEXT_PUBLIC_BRAND ?? "default";
  const selected = mapping[brand];
  if (!selected) {
    throw new Error(`Brand ${brand} not found`);
  }
  return selected;
};
