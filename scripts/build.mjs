import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import sharp from 'sharp';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
await mkdir(join(out, 'images'), { recursive: true });
const entries = JSON.parse(await readFile(join(root, 'data/artworks.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const artworks = [];
for (const [index, [source, title, category]] of entries.entries()) {
  const input = join(root, 'assets/paintings', source);
  const base = `images/art-${String(index + 1).padStart(3, '0')}`;
  // Auto-orient using EXIF, then remove metadata (including location information).
  const normalized = await sharp(input).rotate().toBuffer();
  const metadata = await sharp(normalized).metadata();
  const sizes = {};
  for (const width of [800, 1600]) {
    const info = await sharp(normalized).resize({ width, withoutEnlargement: true }).webp({ quality: width === 800 ? 80 : 88 }).toFile(join(out, `${base}-${width}.webp`));
    sizes[width] = { width: info.width, height: info.height, bytes: info.size };
  }
  artworks.push({ id: index, source, title, category, thumbnail: `${base}-800.webp`, full: `${base}-1600.webp`, width: metadata.width, height: metadata.height, sizes });
}
const gallery = artworks.map(art => `<article class="art-card" data-id="${art.id}" data-title="${escape(art.title)}" data-category="${escape(art.category)}" data-full="${art.full}"><button type="button" class="art-button" data-art-id="${art.id}" aria-label="View ${escape(art.title)}"><span class="art-mat"><img src="${art.thumbnail}" width="${art.sizes[800].width}" height="${art.sizes[800].height}" alt="${escape(art.title)} — artwork by Andrei Constantin" loading="lazy" decoding="async"></span><span class="art-caption"><span><span class="art-title">${escape(art.title)}</span><span class="art-category">${escape(art.category)}</span></span><span class="art-open" aria-hidden="true">↗</span></span></button></article>`).join('\n');
const hero = artworks[0];
const about = artworks.find(art => art.source === 'IMG_0748.JPG');
let html = await readFile(join(root, 'index.html'), 'utf8');
html = html.replaceAll('__COUNT__', String(artworks.length)).replace('__GALLERY__', gallery)
  .replace('__HERO_WIDTH__', hero.width).replace('__HERO_HEIGHT__', hero.height)
  .replace('images/art-097-800.webp', about.thumbnail)
  .replace('__ABOUT_WIDTH__', about.sizes[800].width).replace('__ABOUT_HEIGHT__', about.sizes[800].height);
await writeFile(join(out, 'index.html'), html);
await writeFile(join(out, 'artworks.json'), JSON.stringify(artworks, null, 2) + '\n');
for (const name of ['styles.css', 'app.js']) await copyFile(join(root, name), join(out, name));
await copyFile(join(root, 'assets/paintings/resume.png'), join(out, 'resume.png'));
await writeFile(join(out, '.nojekyll'), '');
// Add a CNAME file at the repository root only after the actual domain is chosen.
if ((await readdir(root)).includes('CNAME')) await copyFile(join(root, 'CNAME'), join(out, 'CNAME'));
console.log(`Built ${artworks.length} artwork photographs into dist/.`);
