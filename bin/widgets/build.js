#!/usr/bin/env node
import { build, context } from 'esbuild';
import path from 'node:path';
import fs from 'node:fs';
import fg from 'fast-glob';

const isWatch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

const define = {
  'process.env.NEXT_PUBLIC_BOX_BUILDER_WIDGET_DOMAIN': JSON.stringify(
    process.env.NEXT_PUBLIC_BOX_BUILDER_WIDGET_DOMAIN || ''
  ),
};

function pascalCase(s) {
  return s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function discoverWidgets() {
  const configFiles = await fg('src/**/widget.config.json', {
    dot: false,
  });

  const widgets = [];
  for (const cfgPath of configFiles) {
    const dir = path.dirname(cfgPath);
    const cfg = readJSON(cfgPath) || {};
    let slug = cfg.slug;
    if (!slug) {
      const modDir = path.basename(path.dirname(dir));
      slug = modDir.replace(/-module$/, '').replace(/^storefront-/, '');
    }
    const entryRel = cfg.entry || './iframe.ts';
    const entryAbs = path.resolve(dir, entryRel);
    const globalName = cfg.globalName || `Shopana${pascalCase(slug)}`;
    const outFile = cfg.outFile || path.resolve(`public/embed/widgets/${slug}.js`);
    const autoBootstrap = cfg.autoBootstrap !== false;
    widgets.push({ slug, dir, entryAbs, outFile, globalName, autoBootstrap });
  }
  return widgets;
}

function buildConfigOf(w) {
  const footer = w.autoBootstrap
    ? `try{${w.globalName}&&${w.globalName}.bootstrap&&${w.globalName}.bootstrap()}catch(e){}`
    : '';
  return {
    entryPoints: [w.entryAbs],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    globalName: w.globalName,
    outfile: w.outFile,
    minify: isProd,
    sourcemap: isProd ? false : 'inline',
    legalComments: 'none',
    target: ['es2019'],
    tsconfig: path.resolve('tsconfig.json'),
    define,
    banner: { js: `/* shopana widget: ${w.slug} */` },
    footer: { js: footer },
  };
}

async function run() {
  const widgets = await discoverWidgets();
  if (widgets.length === 0) {
    console.log('[widgets] no widgets discovered');
    return;
  }

  // ensure output directories exist
  for (const w of widgets) {
    fs.mkdirSync(path.dirname(w.outFile), { recursive: true });
  }

  if (isWatch) {
    const contexts = [];
    for (const w of widgets) {
      const cfg = buildConfigOf(w);
      const ctx = await context(cfg);
      await ctx.watch();
      contexts.push(ctx);
      console.log(`[widgets] watching ${w.slug} -> ${path.relative(process.cwd(), w.outFile)}`);
    }
  } else {
    await Promise.all(
      widgets.map(async (w) => {
        await build(buildConfigOf(w));
        console.log(`[widgets] built ${w.slug} -> ${path.relative(process.cwd(), w.outFile)}`);
      })
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
