export interface InitRuntimeOptions {
  rootDir?: string;
  runtimeDir?: string;
}

export interface RuntimeOverrideDiagnostic {
  kind:
    | 'nextConfig'
    | 'routing'
    | 'instrumentation'
    | 'instrumentationClient';
  file: string;
  source: string;
  target: string;
}

export function initRuntime(
  options?: InitRuntimeOptions
): Promise<{
  rootDir: string;
  runtimeDir: string;
  overrides: RuntimeOverrideDiagnostic[];
}>;
