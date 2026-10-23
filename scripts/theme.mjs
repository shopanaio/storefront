import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
export const themesDir = path.join(workspaceDir, 'themes');

/** Every theme workspace checked out under `themes/`. */
export function listThemes() {
  if (!existsSync(themesDir)) return [];
  return readdirSync(themesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(themesDir, entry.name))
    .filter((dir) => existsSync(path.join(dir, 'package.json')));
}

/**
 * The theme the root commands run: `STOREFRONT_THEME` names a directory under `themes/`;
 * without it the only checked-out theme is used.
 */
export function resolveTheme() {
  const themes = listThemes();
  const selected = process.env.STOREFRONT_THEME;
  if (selected) {
    const dir = path.join(themesDir, selected);
    if (!themes.includes(dir)) {
      throw new Error(`Theme "${selected}" is not checked out under themes/.`);
    }
    return dir;
  }
  if (themes.length === 1) return themes[0];
  if (themes.length === 0) return null;
  throw new Error(
    'Several themes are checked out under themes/; set STOREFRONT_THEME to one of them.'
  );
}

function readPackageName(dir) {
  return JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')).name;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [script, ...args] = process.argv.slice(2);
  if (!script) {
    console.error('Usage: node scripts/theme.mjs <script> [...args]');
    process.exit(1);
  }
  const themeDir = resolveTheme();
  if (!themeDir) {
    console.error(
      'No theme is checked out. Clone a theme into themes/<name> (see themes/README.md).'
    );
    process.exit(1);
  }
  const child = spawn(
    'yarn',
    ['workspace', readPackageName(themeDir), script, ...args],
    { cwd: workspaceDir, stdio: 'inherit' }
  );
  child.once('error', (error) => {
    console.error(error);
    process.exit(1);
  });
  child.once('exit', (code, signal) => {
    process.exit(signal ? 1 : (code ?? 1));
  });
}
