import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import sharp from 'sharp';
import { resolve, join } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
await mkdir(join(out, 'images'), { recursive: true });
const entries = JSON.parse(await readFile(join(root, 'data/artworks.json'), 'utf8'));
const romanianTitles = JSON.parse(await readFile(join(root, 'data/artworks.ro.json'), 'utf8'));
const romanianCategories = { 'Landscapes': 'Peisaje', 'Still life': 'Natură statică', 'Places': 'Locuri', 'Figures & portraits': 'Figuri și portrete', 'Sacred & symbolic': 'Sacru și simbolic' };
for (const [source, , category] of entries) {
  if (!romanianTitles[source]?.trim() || !romanianCategories[category]) throw new Error(`Missing Romanian translation: ${source}`);
}
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
const hero = artworks[0];
const about = artworks.find(art => art.source === 'IMG_0748.JPG');
for (const language of ['en', 'ro']) {
  const ro = language === 'ro';
  const prefix = ro ? '../' : '';
  const gallery = artworks.map(art => {
    const title = escape(ro ? romanianTitles[art.source] : art.title);
    const categoryLabel = escape(ro ? romanianCategories[art.category] : art.category);
    return `<article class="art-card" data-id="${art.id}" data-title="${title}" data-category="${escape(art.category)}" data-category-label="${categoryLabel}" data-full="${prefix}${art.full}"><button type="button" class="art-button" data-art-id="${art.id}" aria-label="${ro ? 'Vezi' : 'View'} ${title}"><span class="art-mat"><img src="${prefix}${art.thumbnail}" width="${art.sizes[800].width}" height="${art.sizes[800].height}" alt="${title} — ${ro ? 'lucrare de' : 'artwork by'} Andrei Constantin" loading="lazy" decoding="async"></span><span class="art-caption"><span><span class="art-title">${title}</span><span class="art-category">${categoryLabel}</span></span><span class="art-open" aria-hidden="true">↗</span></span></button></article>`;
  }).join('\n');
  let html = await readFile(join(root, ro ? 'ro/index.html' : 'index.html'), 'utf8');
  html = html.replaceAll('__COUNT__', String(artworks.length)).replace('__GALLERY__', gallery)
  .replace('__HERO_WIDTH__', hero.width).replace('__HERO_HEIGHT__', hero.height)
  .replace('images/art-097-800.webp', about.thumbnail)
  .replace('__ABOUT_WIDTH__', about.sizes[800].width).replace('__ABOUT_HEIGHT__', about.sizes[800].height);
  const pageOut = ro ? join(out, 'ro') : out;
  await mkdir(pageOut, { recursive: true });
  await writeFile(join(pageOut, 'index.html'), html);
}
await writeFile(join(out, 'artworks.json'), JSON.stringify(artworks, null, 2) + '\n');
for (const name of ['styles.css', 'app.js']) await copyFile(join(root, name), join(out, name));
await copyFile(join(root, 'assets/paintings/resume.png'), join(out, 'resume.png'));
await writeFile(join(out, '.nojekyll'), '');
// Add a CNAME file at the repository root only after the actual domain is chosen.
if ((await readdir(root)).includes('CNAME')) await copyFile(join(root, 'CNAME'), join(out, 'CNAME'));
console.log(`Built English and Romanian pages with ${artworks.length} shared artwork photographs into dist/.`);
