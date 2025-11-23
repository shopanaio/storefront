import path from "node:path";

/**
 * Webpack loader that resolves a provider-specific implementation inside
 * source files at build time.
 *
 * It scans the source for imports of the form `from "<any-path>.<provider>"`
 * (relative, absolute, or aliased; optionally followed by .ts/.tsx/.js/.jsx) and rewrites
 * the module so that only the implementation for the currently selected
 * `provider` is imported and re-exported.
 *
 * Expected loader options:
 * - provider: string     // the active provider to select (e.g. "shopify")
 * - providers: string[]  // all supported providers used to construct the regex
 *
 * Processing steps:
 * 1) Ensure the file calls `cmsPick(...)` to confirm providerized imports
 *    are intentional in this file.
 * 2) Find imports that look like `from "./name.<provider>"`.
 * 3) Choose the import that matches the active `provider`, compute its absolute
 *    path (extension omitted so webpack resolves via `resolve.extensions`), and
 *    register it as a dependency for watch mode.
 * 4) Emit a proxy module that:
 *    - imports ONLY the default export from the chosen module
 *    - re-exports it as the default (without re-exporting named exports)
 */
export default function resolveProviderLoader(source) {
  const opts = this.getOptions?.() || {};
  const provider = opts.provider;
  const providers = opts.providers;

  // Guard: proceed only if cmsPick(...) is present in the file
  if (!/\bcmsPick\s*\(/.test(source)) return source;

  // Find imports like `from "<any-path>.<provider>"` (optional .ts/.tsx/.js/.jsx)
  // Supports relative (./ or ../), absolute, and aliased (e.g. @ecommerce-sdk/...) paths
  const re = new RegExp(
    String.raw`import\s+[^;]*?\s+from\s+['"]([^'\"]+?)\.(` +
      providers.join("|") +
      String.raw`)(?:\.[jt]sx?)?['"];?`,
    "g"
  );

  const imports = [];
  for (const m of source.matchAll(re)) imports.push({ base: m[1], prov: m[2] });
  if (!imports.length) return source;

  const chosen = imports.find((x) => x.prov === provider);
  if (!chosen) return source;

  // Build a module request without extension (webpack resolves via resolve.extensions)
  const request = `${chosen.base}.${provider}`;

  // Resolve via webpack to support aliases and absolute paths
  const callback = this.async();
  this.resolve(path.dirname(this.resourcePath), request, (err, abs) => {
    if (err) return callback(err);
    if (abs) this.addDependency(abs);

    const target = abs || request;
    // Import only default export from provider module and re-export it as default.
    // If module lacks default export, bundler will error — this is intentional.
    const code =
      `// @ts-nocheck\n` +
      `import __def from ${JSON.stringify(target)};\n` +
      `export default __def;\n`;

    callback(null, code);
  });
  return;
}
