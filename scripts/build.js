#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

// Shared files to copy to both builds
const SHARED_FILES = [
  'icons',
  'viewer',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    ensureDir(dest);
    const files = fs.readdirSync(src);
    for (const file of files) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function buildChrome() {
  console.log('Building Chrome extension...');
  const chromeDir = path.join(DIST, 'chrome');
  ensureDir(chromeDir);

  // Copy shared files
  for (const file of SHARED_FILES) {
    const src = path.join(ROOT, file);
    const dest = path.join(chromeDir, file);
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    }
  }

  // Copy Chrome-specific manifest
  fs.copyFileSync(
    path.join(ROOT, 'src', 'chrome', 'manifest.json'),
    path.join(chromeDir, 'manifest.json')
  );

  // For Chrome MV3, we need to bundle the background script
  // Since Chrome MV3 supports ES modules in service workers, we can copy as-is
  // But we need to inline the imports for simplicity
  const backgroundSrc = fs.readFileSync(
    path.join(ROOT, 'src', 'chrome', 'background.js'),
    'utf8'
  );

  // Read shared modules
  const constants = fs.readFileSync(
    path.join(ROOT, 'src', 'shared', 'constants.js'),
    'utf8'
  );
  const utils = fs.readFileSync(
    path.join(ROOT, 'src', 'shared', 'utils.js'),
    'utf8'
  );
  const settings = fs.readFileSync(
    path.join(ROOT, 'src', 'shared', 'settings.js'),
    'utf8'
  );

  // Simple bundling: concatenate and remove imports/exports
  let bundled = '';

  // Add constants (remove exports)
  bundled += constants
    .replace(/export\s+/g, '')
    .replace(/import\s+.*from\s+['"].*['"]\s*;?\n?/g, '');

  // Add utils (remove imports/exports)
  bundled += '\n' + utils
    .replace(/export\s+/g, '')
    .replace(/import\s+.*from\s+['"].*['"]\s*;?\n?/g, '');

  // Add settings (remove imports/exports)
  bundled += '\n' + settings
    .replace(/export\s+/g, '')
    .replace(/import\s+.*from\s+['"].*['"]\s*;?\n?/g, '')
    .replace(/const browserAPI.*\n/, ''); // Chrome uses chrome.* directly

  // Add background script (remove imports)
  bundled += '\n' + backgroundSrc
    .replace(/import\s+.*from\s+['"].*['"]\s*;?\n?/g, '');

  fs.writeFileSync(path.join(chromeDir, 'background.js'), bundled);

  console.log('Chrome build complete: dist/chrome/');
}

function buildFirefox() {
  console.log('Building Firefox extension...');
  const firefoxDir = path.join(DIST, 'firefox');
  ensureDir(firefoxDir);

  // Copy shared files
  for (const file of SHARED_FILES) {
    const src = path.join(ROOT, file);
    const dest = path.join(firefoxDir, file);
    if (fs.existsSync(src)) {
      copyRecursive(src, dest);
    }
  }

  // Copy Firefox-specific manifest
  fs.copyFileSync(
    path.join(ROOT, 'src', 'firefox', 'manifest.json'),
    path.join(firefoxDir, 'manifest.json')
  );

  // Copy Firefox background script (already bundled/self-contained)
  fs.copyFileSync(
    path.join(ROOT, 'src', 'firefox', 'background.js'),
    path.join(firefoxDir, 'background.js')
  );

  console.log('Firefox build complete: dist/firefox/');
}

function createZips() {
  const { execSync } = require('child_process');

  console.log('Creating zip files...');

  // Chrome
  process.chdir(path.join(DIST, 'chrome'));
  execSync('zip -r ../peekr-chrome.zip .');

  // Firefox
  process.chdir(path.join(DIST, 'firefox'));
  execSync('zip -r ../peekr-firefox.zip .');

  process.chdir(ROOT);
  console.log('Zip files created: dist/peekr-chrome.zip, dist/peekr-firefox.zip');
}

function clean() {
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--clean')) {
  clean();
  console.log('Cleaned dist/');
  process.exit(0);
}

clean();
ensureDir(DIST);
buildChrome();
buildFirefox();

if (args.includes('--zip')) {
  createZips();
}

console.log('\nBuild complete!');
