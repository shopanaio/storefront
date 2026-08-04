export interface InitRuntimeOptions {
  rootDir?: string;
  runtimeDir?: string;
}

export function initRuntime(
  options?: InitRuntimeOptions
): Promise<{ rootDir: string; runtimeDir: string }>;
