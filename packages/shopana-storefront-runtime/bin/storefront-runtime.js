#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { initRuntime, readRuntimeFramework } from '../src/init.js';

const require = createRequire(import.meta.url);
const [command, ...args] = process.argv.slice(2);
const supportedCommands = new Set(['init', 'dev', 'build', 'start']);

/** The path of a package's `bin` entry, resolved from this package. */
function resolvePackageBin(packageName, binName) {
  const manifestPath = require.resolve(`${packageName}/package.json`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const bin =
    typeof manifest.bin === 'string' ? manifest.bin : manifest.bin[binName];
  return path.join(path.dirname(manifestPath), bin);
}

/** `-p 3000` and `--port 3000` of a start command, which react-router-serve reads as `PORT`. */
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

/** The framework CLI call of a command: Next.js, or React Router and its server. */
function frameworkCommand(framework, runtimeDir) {
  if (framework === 'next') {
    return {
      args: [resolvePackageBin('next', 'next'), command, runtimeDir, ...args],
      env: process.env,
    };
  }

  if (command !== 'start') {
    return {
      args: [
        resolvePackageBin('@react-router/dev', 'react-router'),
        command,
        runtimeDir,
        ...args,
      ],
      env: process.env,
    };
  }

  const { port, rest } = takePortArgs(args);
  return {
    loadsEnvFiles: true,
    // The server finds the browser assets of the build relative to its working directory.
    cwd: runtimeDir,
    args: [
      resolvePackageBin('@react-router/serve', 'react-router-serve'),
      'build/server/index.js',
      ...rest,
    ],
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? 'production',
      ...(port ? { PORT: port } : {}),
    },
  };
}

if (!supportedCommands.has(command)) {
  console.error(
    'Usage: storefront-runtime <init|dev|build|start> [...framework args]'
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

  if (command === 'start') {
    framework = await readRuntimeFramework(process.cwd());
  } else {
    ({ runtimeDir, framework } = await initRuntime());
  }

  const call = frameworkCommand(framework, runtimeDir);
  const env = call.loadsEnvFiles
    ? withEnvFiles(call.env, 'production')
    : call.env;
  const child = spawn(process.execPath, call.args, {
    cwd: call.cwd,
    stdio: 'inherit',
    env,
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
