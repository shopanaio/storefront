#!/usr/bin/env node

import { initRuntime } from '../src/init.js';

const [command] = process.argv.slice(2);

if (command !== 'init') {
  console.error('Usage: storefront-runtime init');
  process.exitCode = 1;
} else {
  const { runtimeDir } = await initRuntime();
  console.log(`Storefront runtime generated in ${runtimeDir}`);
}
