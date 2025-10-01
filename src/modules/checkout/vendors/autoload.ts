/**
 * Autoloads all checkout vendor modules by requiring any `register.*` file
 * recursively from the current vendors directory.
 * Any new vendor with `register.ts`, `register.tsx`, `register.js` or `register.jsx`
 * will be picked up automatically.
 */
const context = require.context("./", true, /register\.(t|j)sx?$/);
context.keys().forEach((key: string) => context(key));

export {};
