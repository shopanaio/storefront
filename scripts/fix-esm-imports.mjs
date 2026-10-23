/**
 * Makes the relative specifiers of an emitted ESM build fully specified, so the build loads in
 * Node as well as in bundlers: `./a` becomes `./a.js` or `./a/index.js`.
 *
 * Usage: node scripts/fix-esm-imports.mjs <dist> [--alias <prefix>=<dir>]...
 *
 * `--alias '#checkout/=dist'` also rewrites `#checkout/x` to the relative path of `dist/x`.
 */
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const [distArg, ...rest] = process.argv.slice(2);
if (!distArg) {
  console.error(
    'Usage: node scripts/fix-esm-imports.mjs <dist> [--alias <prefix>=<dir>]'
  );
  process.exit(1);
}
const distDir = path.resolve(distArg);
const aliases = [];
for (let index = 0; index < rest.length; index += 1) {
  if (rest[index] !== '--alias') continue;
  const [prefix, dir] = rest[index + 1].split('=');
  aliases.push({ prefix, dir: path.resolve(dir) });
  index += 1;
}

const SPECIFIER =
  /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\bexport\s*\*\s*from\s*)(['"])([^'"\n]+)\2/g;
const KNOWN_EXTENSION = /\.(m?js|cjs|json|css)$/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

function toRelative(fromFile, target) {
  const relative = path
    .relative(path.dirname(fromFile), target)
    .split(path.sep)
    .join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

function resolveSpecifier(file, specifier) {
  let target;
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    target = path.resolve(path.dirname(file), specifier);
  } else {
    const alias = aliases.find(({ prefix }) => specifier.startsWith(prefix));
    if (!alias) return specifier;
    target = path.join(alias.dir, specifier.slice(alias.prefix.length));
  }
  if (KNOWN_EXTENSION.test(target) && existsSync(target)) {
    return toRelative(file, target);
  }
  if (existsSync(`${target}.js`)) return toRelative(file, `${target}.js`);
  if (existsSync(path.join(target, 'index.js'))) {
    return toRelative(file, path.join(target, 'index.js'));
  }
  throw new Error(`Cannot resolve "${specifier}" imported by ${file}`);
}

let changed = 0;
for (const file of walk(distDir)) {
  if (!/\.(js|d\.ts)$/.test(file)) continue;
  const source = readFileSync(file, 'utf8');
  const output = source.replace(SPECIFIER, (match, head, quote, specifier) => {
    const resolved = resolveSpecifier(file, specifier);
    return resolved === specifier
      ? match
      : `${head}${quote}${resolved}${quote}`;
  });
  if (output !== source) {
    writeFileSync(file, output);
    changed += 1;
  }
}
console.log(
  `fix-esm-imports: rewrote specifiers in ${changed} files of ${distArg}`
);
