import assert from 'node:assert/strict';
import { readFile, access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
const artworks = JSON.parse(await readFile(resolve(root, 'dist/artworks.json'), 'utf8'));
const sources = (await readdir(resolve(root, 'assets/paintings'))).filter(name => /\.(jpe?g|png)$/i.test(name) && name !== 'resume.png');
assert.equal(artworks.length, sources.length, 'Every compatible source image must be included');
assert.equal(new Set(artworks.map(art => art.source)).size, artworks.length, 'No duplicated source entries');
assert(!/__\w+__/.test(html), 'Template placeholders must be replaced');
assert.equal((html.match(/class="art-card"/g) || []).length, artworks.length);
const categories = new Set([...html.matchAll(/<button class="filter[^"]*" data-category="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&')));
let bytes = 0;
for (const art of artworks) {
  assert(sources.includes(art.source), `Source exists: ${art.source}`);
  assert(categories.has(art.category), `Filter exists: ${art.category}`);
  for (const path of [art.thumbnail, art.full]) {
    const metadata = await sharp(resolve(root, 'dist', path)).metadata();
    assert.equal(metadata.format, 'webp');
    assert(!metadata.exif, 'Generated images must strip original metadata');
  }
  bytes += art.sizes[800].bytes + art.sizes[1600].bytes;
}
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const url = match[1];
  if (/^(?:https?:|mailto:|tel:|data:)/.test(url)) continue;
  assert(!url.startsWith('/'), 'Asset paths must support a GitHub Pages subpath');
  await access(resolve(root, 'dist', url));
}
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
for (const match of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(match[1]), `Anchor exists: ${match[1]}`);
console.log(`Validated ${artworks.length} photographs, image formats, source coverage, local links, anchors and template output. Optimized images: ${(bytes / 1024 / 1024).toFixed(1)} MB.`);
