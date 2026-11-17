/**
 * Zoom state (spec 6.1.5, 6.1.6). Sets `is-zoom` on <html>; the CSS number --z
 * follows with a 0.9 s transition, and everything else is derived from it.
 *
 * Landing page, 900px and wider: on when the works top is above 25% of the
 * viewport and the footer top below 85%; off when the works top is below 50%
 * or the footer top above 70%.
 * Work pages (always on at load): off when the footer top rises above 60%,
 * on again when it falls below 80%.
 * Changes caused by a resize, and the first evaluation, do not animate.
 */
const root = document.documentElement;
const page = root.dataset.page;
const footer = document.getElementById('footer');
const works = document.getElementById('works');
const wide = window.matchMedia('(min-width: 900px)');

function next(on: boolean): boolean {
  if (!footer) return on;
  const vh = window.innerHeight;
  const f = footer.getBoundingClientRect().top / vh;
  if (page === 'work') {
    if (on && f < 0.6) return false;
    if (!on && f > 0.8) return true;
    return on;
  }
  if (page === 'landing' && works) {
    if (!wide.matches) return false;
    const w = works.getBoundingClientRect().top / vh;
    if (!on && w < 0.25 && f > 0.85) return true;
    if (on && (w > 0.5 || f < 0.7)) return false;
    return on;
  }
  return on;
}

function apply(animate: boolean): void {
  const on = root.classList.contains('is-zoom');
  const value = next(on);
  if (value === on) return;
  if (!animate) root.classList.add('no-zoom-anim');
  root.classList.toggle('is-zoom', value);
  if (!animate) {
    void root.offsetWidth; // commit the change without a transition
    requestAnimationFrame(() => root.classList.remove('no-zoom-anim'));
  }
}

if (page === 'landing' || page === 'work') {
  let queued = false;
  window.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        apply(true);
      });
    },
    { passive: true },
  );
  let timer: number | undefined;
  window.addEventListener('resize', () => {
    root.classList.add('no-zoom-anim');
    apply(false);
    window.clearTimeout(timer);
    timer = window.setTimeout(() => root.classList.remove('no-zoom-anim'), 150);
  });
  // The zoom change itself reflows the page; check again once it has settled.
  root.addEventListener('transitionend', (e) => {
    if (e.target === root) apply(true);
  });
  apply(false);
}

export {};
