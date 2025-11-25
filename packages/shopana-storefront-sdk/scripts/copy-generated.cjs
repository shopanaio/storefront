#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findAndCopyGenerated(srcDir, distDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === '__generated__') {
        const relativePath = path.relative(path.join(__dirname, '../src'), srcDir);
        const destPath = path.join(distDir, relativePath, '__generated__');
        console.log(`Copying ${srcPath} -> ${destPath}`);
        copyDir(srcPath, destPath);
      } else {
        findAndCopyGenerated(srcPath, distDir);
      }
    }
  }
}

const srcDir = path.join(__dirname, '../src');
const distDir = path.join(__dirname, '../dist');

console.log('Copying __generated__ directories...');
findAndCopyGenerated(srcDir, distDir);
console.log('Done!');
