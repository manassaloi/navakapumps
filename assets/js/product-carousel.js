/* ANIMATION STORYBOARD
 *     0ms  show three categories (two on tablet, one on mobile)
 *  5000ms  advance one card; loop to the beginning after the last group
 *          suspend while hovered, focused, offscreen or in a hidden tab
 */
(() => {
  const TIMING = { advance: 5000 };
  const root = document.querySelector('[data-product-carousel]');
  if (!root) return;
  const track = root.querySelector('.featured-products-grid');
  const cards = [...track.children];
  const controls = root.querySelector('.carousel-controls');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, hovered = false, focused = false, visible = false;
  let timer, index = 0;
  const count = () => innerWidth <= 560 ? 1 : innerWidth <= 900 ? 2 : 3;
  const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
  function update() {
    index = Math.min(cards.length - count(), Math.max(0, Math.round(track.scrollLeft / step())));
    cards.forEach((card, i) => { card.tabIndex = i >= index && i < index + count() ? 0 : -1; });
  }
  function move(direction) {
    const max = cards.length - count();
    const next = (index + direction + max + 1) % (max + 1);
    track.scrollTo({ left: next * step(), behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  function schedule() {
    clearInterval(timer);
    if (!paused && !hovered && !focused && visible && !document.hidden)
      timer = setInterval(() => move(1), TIMING.advance);
  }
  controls.hidden = false;
  root.querySelector('[data-carousel-prev]').onclick = () => move(-1);
  root.querySelector('[data-carousel-next]').onclick = () => move(1);
  root.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  root.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  root.addEventListener('focusin', () => { focused = true; schedule(); });
  root.addEventListener('focusout', () => {
    requestAnimationFrame(() => { focused = root.contains(document.activeElement); schedule(); });
  });
  track.addEventListener('touchstart', () => { paused = true; schedule(); }, { passive: true });
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { paused = reduced.matches; schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .25 }).observe(root);
  update();
})();
