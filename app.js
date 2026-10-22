const cards = [...document.querySelectorAll('.art-card')];
const filters = [...document.querySelectorAll('.filter')];
const loadMore = document.querySelector('#load-more');
const results = document.querySelector('#results-count');
const dialog = document.querySelector('#artwork-dialog');
const image = document.querySelector('#viewer-image');
const title = document.querySelector('#viewer-title');
const category = document.querySelector('#viewer-category');
const fileLink = document.querySelector('#viewer-file');
const position = document.querySelector('#viewer-position');
let selected = cards;
let viewerSelection = cards;
let visibleCount = 18;
let currentIndex = 0;
let returnFocus;

function renderCollection() {
  const visible = new Set(selected.slice(0, visibleCount));
  cards.forEach(card => { card.hidden = !visible.has(card); });
  loadMore.hidden = visibleCount >= selected.length;
  results.textContent = `${Math.min(visibleCount, selected.length)} of ${selected.length} images`;
}
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => {
    const active = button === filter;
    filter.classList.toggle('is-active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  selected = cards.filter(card => button.dataset.category === 'All works' || card.dataset.category === button.dataset.category);
  visibleCount = 18;
  renderCollection();
}));
loadMore.addEventListener('click', () => {
  const firstNewCard = selected[visibleCount];
  visibleCount += 18;
  renderCollection();
  firstNewCard?.querySelector('button').focus({ preventScroll: true });
});

function showArtwork() {
  const card = viewerSelection[currentIndex];
  const thumbnail = card.querySelector('img');
  image.src = card.dataset.full;
  image.alt = thumbnail.alt;
  title.textContent = card.dataset.title;
  category.textContent = card.dataset.category;
  position.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${viewerSelection.length}`;
  fileLink.href = card.dataset.full;
}
function openArtwork(id, trigger) {
  const card = cards.find(item => item.dataset.id === id);
  viewerSelection = selected.includes(card) ? selected : cards;
  currentIndex = viewerSelection.indexOf(card);
  if (currentIndex < 0) return;
  returnFocus = trigger;
  showArtwork();
  dialog.showModal();
  document.body.classList.add('viewer-open');
  document.querySelector('#viewer-close').focus();
}
document.querySelectorAll('[data-art-id]').forEach(button => button.addEventListener('click', () => openArtwork(button.dataset.artId, button)));
function moveArtwork(step) {
  currentIndex = (currentIndex + step + viewerSelection.length) % viewerSelection.length;
  showArtwork();
}
document.querySelector('#viewer-close').addEventListener('click', () => dialog.close());
document.querySelector('#viewer-prev').addEventListener('click', () => moveArtwork(-1));
document.querySelector('#viewer-next').addEventListener('click', () => moveArtwork(1));
dialog.addEventListener('close', () => {
  document.body.classList.remove('viewer-open');
  image.removeAttribute('src');
  returnFocus?.focus({ preventScroll: true });
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    moveArtwork(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
let touchStart;
image.addEventListener('touchstart', event => {
  touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
}, { passive: true });
image.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) moveArtwork(dx < 0 ? 1 : -1);
  touchStart = null;
}, { passive: true });
image.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
renderCollection();
