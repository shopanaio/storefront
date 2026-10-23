#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { initRuntime } from '../src/init.js';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const [command, ...args] = process.argv.slice(2);
const supportedCommands = new Set(['init', 'dev', 'build', 'start']);

if (!supportedCommands.has(command)) {
  console.error(
    'Usage: storefront-runtime <init|dev|build|start> [...next args]'
  );
  process.exitCode = 1;
} else if (command === 'init') {
  const { runtimeDir, overrides } = await initRuntime();
  console.log(`Storefront runtime generated in ${runtimeDir}`);

  for (const override of overrides) {
    console.log(`Applied ${override.kind} override: ${override.file}`);
  }
} else {
  let runtimeDir = '.runtime';

  if (command !== 'start') {
    ({ runtimeDir } = await initRuntime());
  }

  const child = spawn(
    process.execPath,
    [nextBin, command, runtimeDir, ...args],
    { stdio: 'inherit' }
  );

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => child.kill(signal));
  }

  child.once('error', (error) => {
    console.error(error);
    process.exitCode = 1;
  });
  child.once('exit', (code, signal) => {
    process.exitCode = code ?? (signal ? 1 : 0);
  });
}
