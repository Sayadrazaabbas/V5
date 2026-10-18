// Publish only public media referenced by the built single-page site.
// Source assets remain untouched and available to the Vite dev server.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '');
const assets = new Set();

for (const match of html.matchAll(/(?:\.\/|\/)(images|videos)\/([A-Za-z0-9._/-]+)/g)) {
  const relative = path.posix.normalize(`${match[1]}/${match[2]}`);
  if (relative.startsWith('../') || relative.includes('/../')) {
    throw new Error(`Invalid public asset path: ${relative}`);
  }
  assets.add(relative);
}

let bytes = 0;
for (const relative of [...assets].sort()) {
  const source = path.join(root, 'public', relative);
  const target = path.join(root, 'dist', relative);
  if (!fs.existsSync(source)) throw new Error(`Missing public asset: ${relative}`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  bytes += fs.statSync(source).size;
}

console.log(`Copied ${assets.size} referenced media files (${(bytes / 1024 / 1024).toFixed(1)} MiB).`);
