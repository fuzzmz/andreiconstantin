import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
for (const language of ['en', 'ro']) {
const html = await readFile(new URL(language === 'ro' ? '../dist/ro/index.html' : '../dist/index.html', import.meta.url), 'utf8');
class Element {
  constructor(dataset = {}) { this.dataset = dataset; this.events = {}; this.attributes = {}; this.hidden = false; this.classList = { toggle() {}, add() {}, remove() {} }; }
  addEventListener(type, action) { this.events[type] = action; }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; }
  focus() { this.focused = true; }
  fire(type, event = {}) { this.events[type]?.(event); }
  showModal() { this.open = true; }
  close() { this.open = false; this.fire('close'); }
}
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const buttons = [];
const cards = [...html.matchAll(/<article class="art-card"([^>]+)>/g)].map(match => {
  const data = Object.fromEntries([...match[1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map(m => [m[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), decode(m[2])]));
  const element = new Element(data);
  element.button = new Element({ artId: data.id });
  element.img = { alt: data.title };
  element.querySelector = query => query === 'img' ? element.img : element.button;
  buttons.push(element.button);
  return element;
});
const filters = ['All works', 'Landscapes', 'Still life', 'Places', 'Figures & portraits', 'Sacred & symbolic'].map(category => new Element({ category }));
const nodes = Object.fromEntries(['load-more', 'results-count', 'artwork-dialog', 'viewer-image', 'viewer-title', 'viewer-category', 'viewer-file', 'viewer-position', 'viewer-close', 'viewer-prev', 'viewer-next'].map(id => ['#' + id, new Element()]));
const hero = new Element({ artId: '0' });
const document = { documentElement: { lang: language }, body: new Element(), querySelector: query => nodes[query], querySelectorAll: query => ({ '.art-card': cards, '.filter': filters, '[data-art-id]': [hero, ...buttons] })[query] };
runInNewContext(await readFile(new URL('../app.js', import.meta.url), 'utf8'), { document, Set });
const visible = () => cards.filter(card => !card.hidden);
assert.equal(visible().length, 18);
assert.equal(nodes['#results-count'].textContent, language === 'ro' ? `18 din ${cards.length} imagini` : `18 of ${cards.length} images`);
nodes['#load-more'].fire('click');
assert.equal(visible().length, 36);
assert(cards[18].button.focused);
for (const filter of filters.slice(1)) {
  filter.fire('click');
  assert(visible().every(card => card.dataset.category === filter.dataset.category));
  assert.equal(filter.attributes['aria-pressed'], 'true');
}
filters[2].fire('click');
const stillLifeCount = visible().length;
hero.fire('click');
assert.equal(nodes['#artwork-dialog'].open, true);
assert.equal(nodes['#viewer-title'].textContent, cards[0].dataset.title);
assert.equal(nodes['#viewer-category'].textContent, cards[0].dataset.categoryLabel);
assert.equal(nodes['#viewer-file'].href, cards[0].dataset.full);
nodes['#viewer-next'].fire('click');
assert.equal(nodes['#viewer-title'].textContent, cards[1].dataset.title);
nodes['#artwork-dialog'].fire('keydown', { key: 'ArrowLeft', preventDefault() {} });
assert.equal(nodes['#viewer-title'].textContent, cards[0].dataset.title);
nodes['#viewer-close'].fire('click');
assert(hero.focused);
assert.equal(visible().length, stillLifeCount);
nodes['#load-more'].fire('click');
assert(visible().every(card => card.dataset.category === 'Still life'));
visible()[0].button.fire('click');
nodes['#viewer-image'].fire('touchstart', { touches: [{ clientX: 200, clientY: 100 }] });
nodes['#viewer-image'].fire('touchend', { changedTouches: [{ clientX: 80, clientY: 105 }] });
assert.equal(nodes['#viewer-title'].textContent, cards.filter(card => card.dataset.category === 'Still life')[1].dataset.title);
nodes['#viewer-close'].fire('click');
filters[0].fire('click');
assert.equal(visible().length, 18);
console.log(`Passed ${language} gallery pagination, every filter, localized captions and counts, viewer navigation, keyboard arrows, touch swipe, focus restoration, and hero/filter isolation checks.`);
}
