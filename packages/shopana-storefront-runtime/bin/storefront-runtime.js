#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { initRuntime, readRuntimeFramework } from '../src/init.js';

const require = createRequire(import.meta.url);
const [command, ...args] = process.argv.slice(2);
const supportedCommands = new Set(['init', 'dev', 'build', 'start', 'static']);

/** The path of a package's `bin` entry, resolved from this package. */
function resolvePackageBin(packageName, binName) {
  const manifestPath = require.resolve(`${packageName}/package.json`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const bin =
    typeof manifest.bin === 'string' ? manifest.bin : manifest.bin[binName];
  return path.join(path.dirname(manifestPath), bin);
}

/** `-p 3000` and `--port 3000` of a start command. */
function takePortArgs(commandArgs) {
  const rest = [];
  let port;
  for (let index = 0; index < commandArgs.length; index += 1) {
    const arg = commandArgs[index];
    if (arg === '-p' || arg === '--port') {
      port = commandArgs[++index];
    } else if (arg.startsWith('--port=')) {
      port = arg.slice('--port='.length);
    } else {
      rest.push(arg);
    }
  }
  return { port, rest };
}

/**
 * The environment with the theme's `.env` files of `mode` under it, in the order Next.js and
 * the Vite dev server read them (a later file wins); variables already set win over all of
 * them. React Router's server does not read them itself.
 */
function withEnvFiles(env, mode) {
  const files = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];
  const fromFiles = {};
  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    if (existsSync(filePath)) {
      Object.assign(fromFiles, parseEnv(readFileSync(filePath, 'utf8')));
    }
  }
  return { ...fromFiles, ...env };
}

/**
 * Sets `X-Forwarded-For` of direct requests in React Router's dev server, as Next.js does. In
 * `NODE_OPTIONS`, not the arguments: `react-router dev` relaunches itself with
 * `--conditions=development` from `process.argv`, which leaves the node flags out.
 */
const withForwardedFor = (env) => ({
  ...env,
  NODE_OPTIONS: [
    env.NODE_OPTIONS,
    `--import=${new URL('./forwarded-for.js', import.meta.url).href}`,
  ]
    .filter(Boolean)
    .join(' '),
});

/** The framework CLI call of a command: Next.js's, or React Router's `dev` and `build`. */
function frameworkCommand(framework, runtimeDir) {
  if (framework === 'next') {
    return {
      args: [resolvePackageBin('next', 'next'), command, runtimeDir, ...args],
      env: process.env,
    };
  }

  return {
    args: [
      resolvePackageBin('@react-router/dev', 'react-router'),
      command,
      runtimeDir,
      ...args,
    ],
    env: withForwardedFor(process.env),
  };
}

/**
 * The production environment of a React Router storefront in this process: the theme's
 * `.env` files under what is set, `NODE_ENV` production unless set.
 */
function loadProductionEnv() {
  const env = withEnvFiles(process.env, 'production');
  env.NODE_ENV ??= 'production';
  Object.assign(process.env, env);
}

/**
 * `start` of a React Router storefront: the hybrid server of the runtime in this process
 * (the static site, the server render, the browser build), with `X-Forwarded-For` of direct
 * requests set as Next.js does.
 */
async function startReactRouter(runtimeDir) {
  loadProductionEnv();
  await import('./forwarded-for.js');
  const { port, rest } = takePortArgs(args);
  const unknown = rest.filter((arg) => arg !== '--static-only');
  if (unknown.length > 0) {
    throw new Error(`Unknown start options: ${unknown.join(' ')}`);
  }
  const { startStorefrontServer } = await import('../dist/static/server.js');
  await startStorefrontServer({
    runtimeDir: path.resolve(runtimeDir),
    port: port === undefined ? undefined : Number(port),
    staticOnly: rest.includes('--static-only'),
  });
}

/** `static <build | render | publish>` of a React Router storefront. */
async function runStatic(runtimeDir) {
  loadProductionEnv();
  const { runStaticCommand } = await import('../dist/static/cli.js');
  process.exitCode = await runStaticCommand(args, {
    themeDir: process.cwd(),
    runtimeDir: path.resolve(runtimeDir),
    env: process.env,
  });
}

if (!supportedCommands.has(command)) {
  console.error(
    'Usage: storefront-runtime <init|dev|build|start|static> [...framework args]'
  );
  process.exitCode = 1;
} else if (command === 'init') {
  const { runtimeDir, framework, overrides } = await initRuntime();
  console.log(`Storefront runtime (${framework}) generated in ${runtimeDir}`);

  for (const override of overrides) {
    console.log(`Applied ${override.kind} override: ${override.file}`);
  }
} else {
  let runtimeDir = '.runtime';
  let framework;

  if (command === 'start' || command === 'static') {
    framework = await readRuntimeFramework(process.cwd());
  } else {
    ({ runtimeDir, framework } = await initRuntime());
  }

  if (framework === 'react-router' && command === 'start') {
    await startReactRouter(runtimeDir);
  } else if (command === 'static') {
    if (framework !== 'react-router') {
      throw new Error('The static site is built for React Router themes only');
    }
    await runStatic(runtimeDir);
  } else {
    runFrameworkCommand(framework, runtimeDir);
  }
}

/** The framework's own CLI in a child process. */
function runFrameworkCommand(framework, runtimeDir) {
  const call = frameworkCommand(framework, runtimeDir);
  const child = spawn(process.execPath, call.args, {
    stdio: 'inherit',
    env: call.env,
  });

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
