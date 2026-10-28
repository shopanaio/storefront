export type RuntimeFramework = 'next' | 'react-router';

export declare const frameworks: readonly RuntimeFramework[];

export interface InitRuntimeOptions {
  rootDir?: string;
  runtimeDir?: string;
  /** The framework to generate for; `storefront.framework` of the theme `package.json` by default. */
  framework?: RuntimeFramework;
}

export interface RuntimeOverrideDiagnostic {
  kind:
    | 'nextConfig'
    | 'routing'
    | 'instrumentation'
    | 'instrumentationClient'
    | 'viteConfig'
    | 'reactRouterConfig';
  file: string;
  source: string;
  target: string;
}

/** The framework of the storefront at `rootDir`: `framework`, its `package.json`, or `next`. */
export function readRuntimeFramework(
  rootDir: string,
  framework?: RuntimeFramework
): Promise<RuntimeFramework>;

export function initRuntime(options?: InitRuntimeOptions): Promise<{
  rootDir: string;
  runtimeDir: string;
  framework: RuntimeFramework;
  overrides: RuntimeOverrideDiagnostic[];
}>;
