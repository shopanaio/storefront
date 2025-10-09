import path from "node:path";

/**
 * Webpack loader that resolves a brand-specific implementation inside
 * source files at build time.
 *
 * It scans the source for imports of the form `from "<any-path>.<brand>"`
 * (relative, absolute, or aliased; optionally followed by .ts/.tsx/.js/.jsx) and rewrites
 * the module so that only the implementation for the currently selected
 * `brand` is imported and re-exported.
 *
 * Expected loader options:
 * - brand: string     // the active brand to select (e.g. "piknik")
 *
 * Processing steps:
 * 1) Ensure the file calls `brandPick(...)` to confirm brandized imports
 *    are intentional in this file.
 * 2) Find imports that look like `from "./name.<brand>"`.
 * 3) Choose the import that matches the active `brand`, compute its absolute
 *    path (extension omitted so webpack resolves via `resolve.extensions`), and
 *    register it as a dependency for watch mode.
 * 4) Emit a proxy module that:
 *    - imports ONLY the default export from the chosen module
 *    - re-exports it as the default (without re-exporting named exports)
 */
export default function resolveBrandLoader(source) {
  const opts = this.getOptions?.() || {};
  const brand = opts.brand;

  // Guard: proceed only if brandPick(...) is present in the file
  if (!/\bbrandPick\s*\(/.test(source)) return source;

  // Find imports like `from "<any-path>.<suffix>"` (optional .ts/.tsx/.js/.jsx)
  // Supports relative (./ or ../), absolute, and aliased (e.g. @src/...) paths
  // Capture any suffix after the last dot as potential brand candidate
  const re = new RegExp(
    String.raw`import\s+[^;]*?\s+from\s+['\"]([^'\"]+?)\.([a-zA-Z0-9_-]+)(?:\.[jt]sx?)?['\"];?`,
    "g"
  );

  const imports = [];
  for (const m of source.matchAll(re)) imports.push({ base: m[1], br: m[2] });
  if (!imports.length) return source;

  const chosen = imports.find((x) => x.br === brand);
  if (!chosen) return source;

  // Build a module request without extension (webpack resolves via resolve.extensions)
  const request = `${chosen.base}.${brand}`;

  // Resolve via webpack to support aliases and absolute paths
  const callback = this.async();
  this.resolve(path.dirname(this.resourcePath), request, (err, abs) => {
    if (err) return callback(err);
    if (abs) this.addDependency(abs);

    const target = abs || request;
    // Import only default export from brand module and re-export it as default.
    // If module lacks default export, bundler will error — this is intentional.
    const code =
      `// @ts-nocheck\n` +
      `import __def from ${JSON.stringify(target)};\n` +
      `export default __def;\n`;

    callback(null, code);
  });
  return;
}
