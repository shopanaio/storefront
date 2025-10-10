/**
 * @public
 * A no-op helper that returns the provided config unchanged.
 * Kept for API compatibility with @stackflow/config defineConfig.
 */
export const defineConfig = <T extends unknown>(config: T): T => config;

export type { };
