/**
 * Autoload section modules. Any new section with `register.*` will be picked up automatically.
 */
const context = require.context('./', true, /register\.(t|j)sx?$/);
context.keys().forEach((key: string) => context(key));

export {};
